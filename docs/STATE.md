# Sundarbans House — State
> Centralized web platform for the Sundarbans House council (IITM BS degree) — events, resources, team collaboration, meetups, and certificate verification. · Last checkpoint: 2026-08-05

## 🚧 In progress / next
- **PR open, CI green — ready to merge:** [#21](https://github.com/Anuraj-dev/Frontend/pull/21) (`feat/cloudinary-media-pipeline`). After merge: hard-refresh Teams/Events and confirm images load from `res.cloudinary.com`.
- **Not started / later (optional):** data-drive Teams (JSON/Sheet); overwrite old full-size Cloudinary masters to reclaim free-tier storage; ongoing `media:sync` only when the team dumps new photos.
- **Out of scope for this PR:** hero 240 frames stay local forever under `public/assets/frames/`.

## Status
- Live Vue 3 SPA (`Anuraj-dev/Frontend`), static host (Vercel). No app backend.
- **Auth (T-13):** Google OAuth → Apps Script membership (`VITE_MEMBERSHIP_CHECK_URL`). No `members.json`.
- **Certs (T-16):** PDFs on Google Drive; no `public/certificates/` in repo.
- **Media (this session — landed in PR, not yet merged at checkpoint write):**
  - **85** non-frame images uploaded to Cloudinary (folder prefix `sundarbans/…`).
  - Vue/HTML rewrites use delivery URLs: `…/upload/f_auto,q_auto:good,w_1000,c_limit/…` (bandwidth).
  - Locals for those 85 **deleted** from git; only frames remain as heavy local images (~9.5M under `public/assets/frames/`).
  - Teams: `loading="lazy"` + `decoding="async"` on card images.
  - Pipeline for the team: dump into `media/` → `npm run media:sync` → URLs in `media/manifest.json` → paste into views.
  - Future uploads: **incoming** compress on store (max 1600px long edge, `quality: auto:good`) + delivery URL in manifest.
- **Routes:** lazy-loaded. CI: lint, Prettier, build, Playwright smoke.

## Architecture map
- App bootstrap → `src/main.js`, `src/App.vue`
- Routes (lazy) → `src/router/index.js`
- Views → `src/views/*` · Meetups → `src/views/meetups/*`
- Components → `src/components/*` · dashboard widgets → `src/components/dashboard/*`
- Static data → `src/data/` (no members roster), `public/data/`
- **Media pipeline** → `media/` (drop + `manifest.json` + README), `scripts/media-sync.mjs`, `scripts/media-migrate-repo.mjs`, `scripts/lib/cloudinary-media.mjs`
- **CDN images** → Cloudinary (`res.cloudinary.com/<cloud>/image/upload/…`)
- **Local images left** → `public/assets/frames/` (240 hero JPEGs only)
- Env (scripts): `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (local `.env`, never commit)
- Env (app build): `VITE_GOOGLE_CLIENT_ID`, `VITE_MEMBERSHIP_CHECK_URL`

## Stack & run
- Stack: Vue 3 (SFC), vue-router 4 (hash history), Vite 6. No backend.
- Run: `npm run dev` · Build: `npm run build` · Preview: `npm run preview`
- Gates: `npm run format:check` · `npm run lint` · `npm run build` · `npm run test:smoke`
- Media: `npm run media:sync` · `npm run media:migrate-repo` (one-time; `--keep-local` / `--dry-run` flags)

## Key decisions (top)
- No backend; client localStorage token after Google + Sheet check.
- Hash routing for static hosting.
- Certs on Drive; membership via Apps Script (no members.json).
- **Site display images on Cloudinary**; hero frames stay in-repo (scroll performance / same-origin).
- **Delivery transforms** for existing assets (bandwidth); **incoming upload transforms** for future dumps (storage).

## Gotchas
- Cloudinary keys live in `.env` only — share among the team privately; rotate if someone leaves.
- Free Cloudinary storage still holds **full masters** from the first migrate (some multi‑MB). Pages do not download those; reclaim storage later by re-uploading compressed overwrites if needed.
- Do **not** re-commit large binaries under `src/assets/teams`, pastevent, etc. Use `media/` + sync.
- Do **not** put hero frames on Cloudinary without a deliberate design change.
- Auth is not server-verified after login; lounge needs both Vite env vars at **build** time on Vercel.
