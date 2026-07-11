# Decisions — Sundarbans House
> Append-only log of load-bearing choices and WHY. Newest at the bottom.
> Format: `## YYYY-MM-DD — <decision>` then a short **Why:** line.

## 2026-07-11 — No backend; fully client-side app (inferred at adoption)
**Why:** Site is served as a static Vite build; "auth" is a localStorage token gate (`sundarbans_auth_token`), not server-verified. Keeps hosting simple and free.

## 2026-07-11 — Hash-based routing via `createWebHashHistory` (inferred at adoption)
**Why:** Works on plain static hosting without server-side rewrite rules for deep links.

## 2026-07-11 — All routes eagerly imported in `src/router/index.js` (inferred at adoption)
**Why:** Not clearly a deliberate performance choice — every view is statically imported, so the whole app ships in the initial bundle. Flagged as a latency lever to revisit during the storage/perf overhaul.
