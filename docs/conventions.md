# Conventions — Sundarbans House
- Stack: Vue 3 (SFC) · vue-router 4 (hash history) · Vite 6 · no backend, no TypeScript
- Run the app: `npm run dev`
- Build: `npm run build` · Preview build: `npm run preview`
- Local gates (same idea as CI): `npm run format:check` · `npm run lint` · `npm run build` · `npm run test:smoke` (Playwright route smoke; needs prior build + Chromium)
- Env: copy `.env.example` → `.env`. Lounge login needs `VITE_GOOGLE_CLIENT_ID` and `VITE_MEMBERSHIP_CHECK_URL` at build time.
- Naming / structure notes:
  - Page-level components live in `src/views/` and are named `*View.vue`; region meetup pages in `src/views/meetups/`.
  - Shared components in `src/components/`; dashboard widgets in `src/components/dashboard/`.
  - All routes are declared in one file: `src/router/index.js` (lazy `import()` per view — keep paths as literal strings for Vite chunking).
  - `src/assets/` = assets processed/bundled by Vite (import them); `public/` = served as-is at the root URL.
  - Static data as JSON/CSV/JS in `src/data/`, `public/data/`, and per-region export folders under `src/views/meetups/`. No committed members roster.
  - Certificates live on Google Drive (URLs in code/data), not under `public/certificates/`.
  - Display images live on Cloudinary (delivery transforms in URL). Dump new files in `media/` and run `npm run media:sync`; copy URLs from `media/manifest.json`. Hero frames stay in `public/assets/frames/`.
- Workflow: changes land via GitHub PRs (repo `Anuraj-dev/Frontend`, branch `main`). See `CONTRIBUTING.md` for the full onboarding path.

