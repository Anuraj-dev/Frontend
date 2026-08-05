#!/usr/bin/env node
/**
 * One-time migration: upload src/assets + public images (except frames) to
 * Cloudinary, rewrite code references to secure URLs, delete local files.
 *
 * Usage:
 *   npm run media:migrate-repo
 *   npm run media:migrate-repo -- --dry-run
 *   npm run media:migrate-repo -- --keep-local   # upload + rewrite, do not delete files
 *
 * --dry-run works without Cloudinary credentials (discovery + rewrite plan).
 * --keep-local: leave local images on disk so you can verify CDN URLs first.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  REPO_ROOT,
  FRAMES_PREFIX,
  isDryRun,
  loadDotEnvIfPresent,
  loadManifest,
  saveManifest,
  upsertAsset,
  walkImages,
  publicIdFromRepoRel,
  requireCredentials,
  uploadImage,
  placeholderUrl,
  relToRepo,
  isImageFile,
  isFramesPath,
  IMAGE_EXTS,
} from './lib/cloudinary-media.mjs';

loadDotEnvIfPresent();
const dryRun = isDryRun();
const keepLocal = process.argv.includes('--keep-local');

const SRC_ASSETS = path.join(REPO_ROOT, 'src', 'assets');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');

const CODE_EXTS = new Set(['.vue', '.js', '.html', '.css', '.json']);

function walkCodeFiles() {
  const files = [];
  // index.html at root
  const indexHtml = path.join(REPO_ROOT, 'index.html');
  if (fs.existsSync(indexHtml)) files.push(indexHtml);

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.name.startsWith('.')) continue;
      if (ent.name === 'node_modules' || ent.name === 'dist') continue;
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!ent.isFile()) continue;
      if (!CODE_EXTS.has(path.extname(ent.name))) continue;
      files.push(abs);
    }
  }
  walk(path.join(REPO_ROOT, 'src'));
  files.sort((a, b) => a.localeCompare(b));
  return files;
}

/**
 * Discover all migratable images under src/assets and public (skip frames).
 */
function discoverImages() {
  const fromSrc = walkImages(SRC_ASSETS);
  const fromPublic = walkImages(PUBLIC_DIR, { skipFrames: true });
  // Also count frames for summary (never migrate)
  let framesSkipped = 0;
  if (fs.existsSync(FRAMES_PREFIX)) {
    framesSkipped = walkImages(FRAMES_PREFIX).length;
  }
  const all = [...fromSrc, ...fromPublic].sort((a, b) => a.localeCompare(b));
  return { images: all, framesSkipped };
}

/**
 * Escape string for use in a RegExp (literal match).
 */
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build lookup maps from repo-relative path → { publicId, abs, filename, ... }
 * and all reference forms we might find in source.
 */
function buildImageMeta(absPath) {
  const repoRel = relToRepo(absPath); // e.g. src/assets/teams/mannu.jpg
  const publicId = publicIdFromRepoRel(repoRel);
  const filename = path.basename(absPath);
  const ext = path.extname(absPath);

  /** Reference strings that should become the Cloudinary URL. */
  const refCandidates = new Set();

  if (repoRel.startsWith('src/assets/')) {
    const underAssets = repoRel.slice('src/assets/'.length); // teams/mannu.jpg
    // Vite alias
    refCandidates.add(`@/assets/${underAssets}`);
    // Relative from various depths
    refCandidates.add(`../assets/${underAssets}`);
    refCandidates.add(`./assets/${underAssets}`);
    refCandidates.add(`../../assets/${underAssets}`);
    // Occasional bare
    refCandidates.add(`assets/${underAssets}`);
  }

  if (repoRel.startsWith('public/')) {
    // Served at site root without "public/"
    const publicUrl = '/' + repoRel.slice('public/'.length); // /assets/pastevent/foo.jpg
    refCandidates.add(publicUrl);
    // Without leading slash (rare)
    refCandidates.add(publicUrl.slice(1));
  }

  return {
    abs: absPath,
    repoRel,
    publicId,
    filename,
    ext,
    refCandidates: [...refCandidates],
  };
}

/**
 * Replace image import lines:
 *   import name from 'path-with-image-ext';
 * → const name = 'url';
 *
 * Handles single/double quotes. Leaves CSS imports alone (non-image ext).
 */
function rewriteImports(content, pathToUrl) {
  // import foo from '...' or import foo from "..."
  // Use [ \t] (not \s) so we never swallow newlines and collapse blank lines.
  const importRe = /^([ \t]*)import\s+(\w+)\s+from\s+(['"])([^'"]+)\3[ \t]*;?[ \t]*$/gm;

  let changed = false;
  const next = content.replace(importRe, (full, indent, name, quote, importPath) => {
    if (!isImageRefPath(importPath)) return full;
    const url = resolveImportPathToUrl(importPath, pathToUrl);
    if (!url) return full;
    changed = true;
    const q = quote === "'" ? "'" : '"';
    return `${indent}const ${name} = ${q}${url}${q};`;
  });
  return { content: next, changed };
}

function isImageRefPath(p) {
  // strip query/hash
  const clean = p.split('?')[0].split('#')[0];
  const ext = path.extname(clean);
  return IMAGE_EXTS.has(ext) || IMAGE_EXTS.has(ext.toLowerCase());
}

/**
 * Match an import/template path to a known image URL via refCandidates map.
 * pathToUrl: Map of exact reference string → url
 */
function resolveImportPathToUrl(importPath, pathToUrl) {
  // direct hit
  if (pathToUrl.has(importPath)) return pathToUrl.get(importPath);

  // try decodeURI for %20 spaces
  try {
    const decoded = decodeURIComponent(importPath);
    if (pathToUrl.has(decoded)) return pathToUrl.get(decoded);
  } catch {
    /* ignore */
  }

  // Normalize backslashes
  const norm = importPath.replace(/\\/g, '/');
  if (pathToUrl.has(norm)) return pathToUrl.get(norm);

  return null;
}

/**
 * Replace string literals and attribute paths that point at known images.
 * Operates after import rewrite so import lines are already const.
 *
 * We replace longest refs first to avoid partial matches.
 */
function rewritePathStrings(content, pathToUrl) {
  // Build sorted list of refs (longest first)
  const refs = [...pathToUrl.keys()].sort((a, b) => b.length - a.length);
  if (refs.length === 0) return { content, changed: false, hits: 0 };

  let hits = 0;
  let next = content;

  for (const ref of refs) {
    const url = pathToUrl.get(ref);
    if (!url || ref === url) continue;

    // Already cloudinary? skip
    if (ref.includes('res.cloudinary.com')) continue;

    // Replace occurrences of the ref when used as a path string.
    // Match the literal path inside quotes, or in src= attributes without worrying about partial words.
    // We replace the exact path substring, but only when bounded by quotes or path-ish delimiters.
    const escaped = escapeRegExp(ref);

    // Pattern 1: quoted string containing exactly this path (or path as full string content)
    // 'path' or "path" or `path`
    const quoted = new RegExp(`(['"\`])${escaped}\\1`, 'g');
    next = next.replace(quoted, (m, q) => {
      hits++;
      return `${q}${url}${q}`;
    });

    // Pattern 2: unquoted in src= / href= for vite-style @/assets (already often quoted)
    // Also url(/assets/...) in CSS — only if not frames (frames never in pathToUrl)
    const cssUrl = new RegExp(`url\\((['"]?)${escaped}\\1\\)`, 'g');
    next = next.replace(cssUrl, (m, q) => {
      hits++;
      const qq = q || '';
      return `url(${qq}${url}${qq})`;
    });
  }

  return { content: next, changed: hits > 0, hits };
}

/**
 * Build Map: reference path string → cloudinary URL
 */
function buildPathToUrlMap(metas, urlByPublicId) {
  const map = new Map();
  for (const meta of metas) {
    const url = urlByPublicId.get(meta.publicId);
    if (!url) continue;
    for (const ref of meta.refCandidates) {
      map.set(ref, url);
    }
    // also map repo-relative forms occasionally used
    map.set(meta.repoRel, url);
  }
  return map;
}

async function main() {
  console.log('=== media:migrate-repo ===');
  if (dryRun) console.log('mode: DRY-RUN (no upload / write / delete)\n');
  else if (keepLocal) console.log('mode: live + KEEP-LOCAL (upload + rewrite, no delete)\n');
  else console.log('mode: live (upload + rewrite + delete local images)\n');

  const { images, framesSkipped } = discoverImages();
  console.log(`Discovered ${images.length} image(s) to migrate`);
  console.log(`Skipped frames (public/assets/frames): ${framesSkipped} (never touched)\n`);

  if (images.length === 0) {
    console.log('Nothing to migrate. Local images already gone or never present.');
    printSummary({ uploaded: 0, rewritten: 0, deleted: 0, failed: 0, framesSkipped });
    return;
  }

  const metas = images.map(buildImageMeta);

  // Show discovery list
  for (const m of metas) {
    console.log(`  ${m.repoRel}  →  ${m.publicId}`);
  }
  console.log('');

  if (!dryRun) {
    requireCredentials();
  }

  const manifest = loadManifest();
  const urlByPublicId = new Map();
  let uploaded = 0;
  let failed = 0;
  let deleted = 0;

  // --- Upload phase ---
  for (const meta of metas) {
    if (isFramesPath(meta.abs)) {
      console.log(`SKIP frames (safety): ${meta.repoRel}`);
      continue;
    }

    if (dryRun) {
      const url = placeholderUrl(meta.publicId);
      urlByPublicId.set(meta.publicId, url);
      console.log(`[dry-run] would upload ${meta.repoRel}`);
      console.log(`         → ${meta.publicId}`);
      console.log(`         url: ${url}`);
      uploaded++;
      continue;
    }

    try {
      console.log(`Uploading ${meta.repoRel} → ${meta.publicId} ...`);
      const result = await uploadImage(meta.abs, meta.publicId);
      const publicId = result.public_id || meta.publicId;
      urlByPublicId.set(meta.publicId, result.secure_url);
      urlByPublicId.set(publicId, result.secure_url);
      upsertAsset(manifest, {
        filename: meta.filename,
        source: meta.repoRel,
        publicId,
        url: result.delivery_url || result.secure_url,
        masterUrl: result.secure_url,
        bytes: result.bytes,
        format: result.format,
        uploadedAt: new Date().toISOString(),
      });
      uploaded++;
      console.log(`  OK ${result.secure_url}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${meta.repoRel}: ${err.message}`);
    }
  }

  // --- Rewrite phase ---
  const pathToUrl = buildPathToUrlMap(metas, urlByPublicId);
  const codeFiles = walkCodeFiles();
  let rewritten = 0;

  console.log(`\nScanning ${codeFiles.length} code file(s) for rewrites...\n`);

  for (const codePath of codeFiles) {
    let content;
    try {
      content = fs.readFileSync(codePath, 'utf8');
    } catch {
      continue;
    }

    // Skip if nothing looks image-related (cheap)
    if (!content.includes('assets') && !content.includes('/assets/')) {
      continue;
    }

    const before = content;
    let { content: c1, changed: ch1 } = rewriteImports(content, pathToUrl);
    let { content: c2, changed: ch2, hits } = rewritePathStrings(c1, pathToUrl);
    content = c2;

    if (content === before) continue;

    const rel = relToRepo(codePath);
    if (dryRun) {
      console.log(`[dry-run] would rewrite ${rel} (imports=${ch1}, stringHits≈${hits})`);
      // Show a few would-be replacements for clarity
      showDiffPreview(before, content, rel);
      rewritten++;
    } else {
      fs.writeFileSync(codePath, content, 'utf8');
      console.log(`Rewrote ${rel}`);
      rewritten++;
    }
  }

  // --- Delete local images (after successful upload; dry-run / --keep-local skip) ---
  if (!dryRun && !keepLocal) {
    for (const meta of metas) {
      if (isFramesPath(meta.abs)) continue;
      if (!urlByPublicId.has(meta.publicId)) continue; // upload failed
      if (!fs.existsSync(meta.abs)) continue;
      try {
        fs.unlinkSync(meta.abs);
        deleted++;
        console.log(`Deleted ${meta.repoRel}`);
      } catch (err) {
        console.error(`Could not delete ${meta.repoRel}: ${err.message}`);
      }
    }
    // Prune empty dirs under src/assets and public/assets (not frames, not media)
    pruneEmptyDirs(SRC_ASSETS);
    pruneEmptyDirs(path.join(PUBLIC_DIR, 'assets'), { keep: [FRAMES_PREFIX] });
  } else if (dryRun) {
    deleted = 0; // dry-run: nothing deleted
  } else if (keepLocal) {
    console.log('\n--keep-local: left all local image files on disk for verification.');
    deleted = 0;
  }

  if (!dryRun && uploaded > 0) {
    saveManifest(manifest);
    console.log(`\nWrote media/manifest.json (${manifest.assets.length} asset(s) total)`);
  }

  printSummary({ uploaded, rewritten, deleted, failed, framesSkipped });
  if (failed > 0) process.exitCode = 1;
}

function showDiffPreview(before, after, rel) {
  const bLines = before.split('\n');
  const aLines = after.split('\n');
  let shown = 0;
  for (let i = 0; i < Math.max(bLines.length, aLines.length) && shown < 8; i++) {
    if (bLines[i] !== aLines[i]) {
      console.log(`         L${i + 1}:`);
      if (bLines[i] != null) console.log(`           - ${trimMid(bLines[i], 100)}`);
      if (aLines[i] != null) console.log(`           + ${trimMid(aLines[i], 100)}`);
      shown++;
    }
  }
}

function trimMid(s, n) {
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + '…';
}

function pruneEmptyDirs(root, { keep = [] } = {}) {
  if (!fs.existsSync(root)) return;

  function isKept(p) {
    const abs = path.resolve(p);
    return keep.some((k) => abs === path.resolve(k) || abs.startsWith(path.resolve(k) + path.sep));
  }

  function walk(dir) {
    if (isKept(dir)) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.isDirectory()) walk(path.join(dir, ent.name));
    }
    // re-read after children pruned
    try {
      const left = fs.readdirSync(dir);
      if (left.length === 0 && path.resolve(dir) !== path.resolve(root)) {
        fs.rmdirSync(dir);
      }
    } catch {
      /* ignore */
    }
  }
  walk(root);
}

function printSummary({ uploaded, rewritten, deleted, failed, framesSkipped }) {
  console.log('\n--- summary ---');
  console.log(`uploaded: ${uploaded}`);
  console.log(`rewritten files: ${rewritten}`);
  console.log(`deleted local images: ${deleted}`);
  console.log(`failed: ${failed}`);
  console.log(`frames skipped (untouched): ${framesSkipped}`);
  if (dryRun) console.log('(dry-run: no changes made)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
