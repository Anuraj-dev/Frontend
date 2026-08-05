# Decisions — Sundarbans House
> Append-only log of load-bearing choices and WHY. Newest at the bottom.
> Format: `## YYYY-MM-DD — <decision>` then a short **Why:** line.

## 2026-07-11 — No backend; fully client-side app (inferred at adoption)
**Why:** Site is served as a static Vite build; "auth" is a localStorage token gate (`sundarbans_auth_token`), not server-verified. Keeps hosting simple and free.

## 2026-07-11 — Hash-based routing via `createWebHashHistory` (inferred at adoption)
**Why:** Works on plain static hosting without server-side rewrite rules for deep links.

## 2026-07-11 — All routes eagerly imported in `src/router/index.js` (inferred at adoption)
**Why:** Not clearly a deliberate performance choice — every view is statically imported, so the whole app ships in the initial bundle. Flagged as a latency lever to revisit during the storage/perf overhaul.
**Superseded:** routes are now lazy-loaded (see PR #5 / decision below).

## ~2026-07 — Lazy route imports in `src/router/index.js` (PR #5)
**Why:** Visitors only download the view chunk they need; homepage no longer pulls the whole app. Vite needs literal static paths in `import()` so each view emits its own chunk.

## 2026-07 — Membership via Apps Script + Google Sheet (T-13); no local roster (PRs #17, #19, #20)
**Why:** Single source of truth in the council Sheet. Client calls `VITE_MEMBERSHIP_CHECK_URL` after Google OAuth. `members.json` removed so prod cannot silently fall back to a stale roster.

## 2026-07 — Certificate PDFs on Google Drive, not in git (T-16; PRs #18, #20)
**Why:** ~89M of PDFs bloated the repo and deploys. Verify flow opens Drive view/export URLs by file id. Do not re-commit certificate binaries.

## 2026-08-05 — Site images on Cloudinary; hero frames stay in-repo
**Why:** Teams/events/regions (~40M) bloated git and page weight. Cloudinary hosts display images. Homepage 240-frame scroll stays on same-origin (`public/assets/frames/`) for predictable fast scrub. No full backend/admin — team dumps into `media/` and runs `npm run media:sync`.

## 2026-08-05 — Delivery URL transforms + incoming upload compression
**Why:** Raw CDN masters still lag (multi‑MB eager loads). Delivery URLs use `f_auto,q_auto:good,w_1000,c_limit` for bandwidth. Future `media:sync` uploads apply incoming max-1600 + `quality:auto:good` so free-tier **storage** is not filled with phone originals. URL-only transforms do not shrink stored bytes; both layers are intentional.

## 2026-08-05 — Drop Spec 001 T-11 (`docs/ownership.md`)
**Why:** Owner stays with the team long-term and will communicate where configs live when needed. No council-backup / handover / break-glass ownership doc.
