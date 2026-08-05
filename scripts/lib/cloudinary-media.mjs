/**
 * Shared helpers for Cloudinary media scripts (media-sync, media-migrate-repo).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../..');
export const MEDIA_DIR = path.join(REPO_ROOT, 'media');
export const MANIFEST_PATH = path.join(MEDIA_DIR, 'manifest.json');

export const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export const CLOUDINARY_FOLDER = 'sundarbans';

/** Paths under public that must never be uploaded/deleted/rewritten. */
export const FRAMES_PREFIX = path.join(REPO_ROOT, 'public', 'assets', 'frames');

export function isImageFile(filePath) {
  return IMAGE_EXTS.has(path.extname(filePath).toLowerCase());
}

/** Load repo-root `.env` into process.env if present (does not override existing env). */
export function loadDotEnvIfPresent() {
  const envPath = path.join(REPO_ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

export function isFramesPath(absPath) {
  const normalized = path.resolve(absPath);
  return normalized === FRAMES_PREFIX || normalized.startsWith(FRAMES_PREFIX + path.sep);
}

/** Sanitize a path segment for Cloudinary public_id (spaces → underscores). */
export function sanitizePublicIdSegment(segment) {
  return segment.replace(/\s+/g, '_');
}

/**
 * Build public_id from path parts under the sundarbans prefix (no extension).
 * @param {string[]} relativeParts path parts without leading folder like media/ or absolute
 */
export function toPublicId(relativeParts) {
  const sanitized = relativeParts.map(sanitizePublicIdSegment).join('/');
  // strip extension from last segment if present
  const withoutExt = sanitized.replace(/\.[^.]+$/, '');
  return `${CLOUDINARY_FOLDER}/${withoutExt}`;
}

/**
 * public_id for a dump under media/: media/foo/bar.jpg → sundarbans/foo/bar
 */
export function publicIdFromMediaRel(relFromMedia) {
  const parts = relFromMedia.split(/[/\\]/).filter(Boolean);
  return toPublicId(parts);
}

/**
 * public_id for a repo image: src/assets/teams/mannu.jpg → sundarbans/src/assets/teams/mannu
 */
export function publicIdFromRepoRel(relFromRepo) {
  const parts = relFromRepo.split(/[/\\]/).filter(Boolean);
  return toPublicId(parts);
}

export function loadEnvCredentials() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  const missing = [];
  if (!cloud_name) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!api_key) missing.push('CLOUDINARY_API_KEY');
  if (!api_secret) missing.push('CLOUDINARY_API_SECRET');
  return { cloud_name, api_key, api_secret, missing };
}

export function requireCredentials() {
  const creds = loadEnvCredentials();
  if (creds.missing.length) {
    console.error(
      `Missing Cloudinary credentials: ${creds.missing.join(', ')}\n` +
        'Set them in .env (see .env.example) and re-run.\n' +
        'For discovery-only, pass --dry-run (no credentials required).'
    );
    process.exit(1);
  }
  cloudinary.config({
    cloud_name: creds.cloud_name,
    api_key: creds.api_key,
    api_secret: creds.api_secret,
    secure: true,
  });
  return creds;
}

export function emptyManifest() {
  return { version: 1, updatedAt: null, assets: [] };
}

export function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return emptyManifest();
  }
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.assets)) {
      return emptyManifest();
    }
    return {
      version: data.version ?? 1,
      updatedAt: data.updatedAt ?? null,
      assets: data.assets,
    };
  } catch (err) {
    console.warn(`Warning: could not parse ${MANIFEST_PATH}, starting empty: ${err.message}`);
    return emptyManifest();
  }
}

export function saveManifest(manifest) {
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

/**
 * Upsert asset entry by publicId (preferred) or filename+source.
 * New entries get order = max(order)+1.
 */
export function upsertAsset(manifest, entry) {
  const idx = manifest.assets.findIndex(
    (a) =>
      a.publicId === entry.publicId || (a.filename === entry.filename && a.source === entry.source)
  );
  if (idx >= 0) {
    const prev = manifest.assets[idx];
    manifest.assets[idx] = {
      ...prev,
      ...entry,
      order: prev.order,
    };
    return manifest.assets[idx];
  }
  const maxOrder = manifest.assets.reduce((m, a) => Math.max(m, a.order || 0), 0);
  const next = { order: maxOrder + 1, ...entry };
  manifest.assets.push(next);
  return next;
}

/**
 * Recursively collect image files under dir.
 * Skips hidden files, manifest.json, README.md, non-images.
 */
export function walkImages(dir, { skipFrames = false } = {}) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue;
      if (ent.name === 'manifest.json' || ent.name === 'README.md') continue;
      const abs = path.join(current, ent.name);
      if (ent.isDirectory()) {
        if (skipFrames && isFramesPath(abs)) continue;
        walk(abs);
        continue;
      }
      if (!ent.isFile()) continue;
      if (!isImageFile(abs)) continue;
      if (skipFrames && isFramesPath(abs)) continue;
      results.push(abs);
    }
  }

  walk(dir);
  results.sort((a, b) => a.localeCompare(b));
  return results;
}

/**
 * Incoming transform applied **before** Cloudinary stores the file.
 * Caps long edge at 1600px and uses smart quality so free-tier storage
 * is not filled with multi‑MB phone originals. Quality loss is minor for web.
 */
export const UPLOAD_TRANSFORM = [
  { width: 1600, height: 1600, crop: 'limit' },
  { quality: 'auto:good' },
];

/**
 * Delivery transform inserted into the URL the browser requests.
 * Used for already-uploaded assets and for the `url` field in manifest
 * (so paste-into-Vue links stay small even if you open the master).
 */
export const DELIVERY_TRANSFORM = 'f_auto,q_auto:good,w_1000,c_limit';

/**
 * Insert delivery transforms after `/image/upload/` if not already present.
 * Idempotent.
 */
export function toDeliveryUrl(secureUrl) {
  if (typeof secureUrl !== 'string' || !secureUrl.includes('/image/upload/')) {
    return secureUrl;
  }
  // Already transformed (f_auto or any non-version transform segment)
  if (
    /\/image\/upload\/(?:[^/]+,)+/.test(secureUrl) ||
    secureUrl.includes('/image/upload/f_auto')
  ) {
    return secureUrl;
  }
  return secureUrl.replace('/image/upload/', `/image/upload/${DELIVERY_TRANSFORM}/`);
}

/**
 * Upload a local file to Cloudinary.
 * Applies incoming compression so the **stored** master is already web-sized.
 * @returns {{ secure_url, public_id, bytes, format, delivery_url }}
 */
export async function uploadImage(absPath, publicId) {
  const result = await cloudinary.uploader.upload(absPath, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
    // Incoming: resize/compress what is stored (saves account storage)
    transformation: UPLOAD_TRANSFORM,
  });
  const secure_url = result.secure_url;
  return {
    secure_url,
    delivery_url: toDeliveryUrl(secure_url),
    public_id: result.public_id,
    bytes: result.bytes ?? 0,
    format: result.format ?? path.extname(absPath).slice(1).toLowerCase(),
  };
}

/** Placeholder secure URL for dry-run (no API). */
export function placeholderUrl(publicId) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || '<cloud>';
  return toDeliveryUrl(`https://res.cloudinary.com/${cloud}/image/upload/${publicId}`);
}

export function isDryRun(argv = process.argv) {
  return argv.includes('--dry-run');
}

export function relToRepo(absPath) {
  return path.relative(REPO_ROOT, absPath).split(path.sep).join('/');
}
