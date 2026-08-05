# Media drop folder

Team workflow for uploading new site images to Cloudinary.

## How to use

1. **Dump** image files (jpg / jpeg / png / webp / gif) into this folder (or a subfolder).
2. **Run** from the repo root (needs Cloudinary credentials in `.env`):

   ```bash
   npm run media:sync
   ```

   Dry-run (no upload / delete / write):

   ```bash
   npm run media:sync -- --dry-run
   ```

3. **Copy the URL** from `manifest.json` (`assets[].url`) into your Vue/HTML code.
   That URL already includes delivery transforms (`f_auto,q_auto:good,w_1000,c_limit`) so the browser downloads a web-sized image.

After a successful sync, local image files are deleted. `manifest.json` and this README stay forever — the manifest is the history of every upload.

## Env vars (`.env`)

```
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

See `.env.example`.

## Compression policy (storage + bandwidth)

**On upload (future files via `media:sync`):**  
Cloudinary applies an *incoming* transform before storing: long edge max **1600px**, `quality: auto:good`.  
So a multi‑MB phone photo does **not** fill your free storage as a full original.

**On display (URLs in the site):**  
Links use `f_auto,q_auto:good,w_1000,c_limit` so each page request stays small on low bandwidth. Quality loss is minor for cards/posters.

You do **not** need to hand-compress files before dumping them here.

## Notes

- Uploads land under the Cloudinary folder `sundarbans/` (public_id from the relative path under `media/`).
- Re-uploading the same filename overwrites the previous Cloudinary asset (with compression applied again).
- Prefer syncing large dumps **before** committing — this folder is not specially gitignored, but images disappear after sync.
- Hero scroll frames live under `public/assets/frames/` and are **never** part of this pipeline.
