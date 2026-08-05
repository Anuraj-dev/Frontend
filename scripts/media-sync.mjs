#!/usr/bin/env node
/**
 * Ongoing workflow: dump images into media/, upload to Cloudinary, update
 * media/manifest.json, delete local files after success.
 *
 * Usage:
 *   npm run media:sync
 *   npm run media:sync -- --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  MEDIA_DIR,
  REPO_ROOT,
  isDryRun,
  loadDotEnvIfPresent,
  loadManifest,
  saveManifest,
  upsertAsset,
  walkImages,
  publicIdFromMediaRel,
  requireCredentials,
  uploadImage,
  placeholderUrl,
  relToRepo,
} from './lib/cloudinary-media.mjs';

loadDotEnvIfPresent();
const dryRun = isDryRun();

async function main() {
  console.log('=== media:sync ===');
  console.log(`media dir: ${path.relative(REPO_ROOT, MEDIA_DIR) || 'media'}`);
  if (dryRun) console.log('mode: DRY-RUN (no upload / delete / write)\n');
  else console.log('mode: live\n');

  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
    console.log('Created media/ folder.');
  }

  const images = walkImages(MEDIA_DIR);
  if (images.length === 0) {
    console.log('No image files found in media/. Nothing to do.');
    console.log('Dump jpg/png/webp/gif files here, then re-run.');
    return;
  }

  console.log(`Found ${images.length} image(s):\n`);
  for (const abs of images) {
    console.log(`  - ${relToRepo(abs)}`);
  }
  console.log('');

  if (!dryRun) {
    requireCredentials();
  }

  const manifest = loadManifest();
  let uploaded = 0;
  let deleted = 0;
  let failed = 0;

  for (const abs of images) {
    const relFromRepo = relToRepo(abs);
    const relFromMedia = path.relative(MEDIA_DIR, abs).split(path.sep).join('/');
    const publicId = publicIdFromMediaRel(relFromMedia);
    const filename = path.basename(abs);

    if (dryRun) {
      const url = placeholderUrl(publicId);
      console.log(`[dry-run] would upload ${relFromRepo}`);
      publicIdLog(publicId, url);
      console.log(`         would delete local file after success`);
      uploaded++;
      deleted++;
      continue;
    }

    try {
      console.log(`Uploading ${relFromRepo} → ${publicId} ...`);
      const result = await uploadImage(abs, publicId);
      // manifest.url = delivery URL (paste into Vue; already size-capped for the web)
      upsertAsset(manifest, {
        filename,
        source: relFromRepo,
        publicId: result.public_id || publicId,
        url: result.delivery_url || result.secure_url,
        masterUrl: result.secure_url,
        bytes: result.bytes,
        format: result.format,
        uploadedAt: new Date().toISOString(),
      });
      uploaded++;
      fs.unlinkSync(abs);
      deleted++;
      console.log(`  OK (stored)  ${result.secure_url}`);
      console.log(`     (display) ${result.delivery_url || result.secure_url}`);
      console.log(`  deleted local ${relFromRepo}`);
    } catch (err) {
      failed++;
      console.error(`  FAIL ${relFromRepo}: ${err.message}`);
    }
  }

  if (!dryRun && uploaded > 0) {
    saveManifest(manifest);
    console.log(`\nWrote media/manifest.json (${manifest.assets.length} asset(s) total)`);
  }

  console.log('\n--- summary ---');
  console.log(`uploaded: ${uploaded}`);
  console.log(`deleted local: ${deleted}`);
  console.log(`failed: ${failed}`);
  if (dryRun) console.log('(dry-run: no changes made)');
  if (failed > 0) process.exitCode = 1;
}

function publicIdLog(publicId, url) {
  console.log(`         public_id: ${publicId}`);
  console.log(`         url: ${url}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
