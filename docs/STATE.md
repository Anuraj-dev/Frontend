# Sundarbans House — State
> Centralized web platform for the Sundarbans House council (IITM BS degree) — events, resources, team collaboration, meetups, and certificate verification. · Last checkpoint: 2026-07-11

## 🚧 In progress / next
- **Storage/latency overhaul (current focus).** Web admin is offloading storage-heavy assets to Cloudinary to fix route latency. First step is an audit (see gotchas below for the weight breakdown). Not started in code yet.

## Status
- Live single-page Vue 3 app, deployed from GitHub (repo: Anuraj-dev/Frontend). Actively maintained via PRs.
- Public site + a members lounge (auth-gated) + dashboard widgets + certificate verification are all built and working.

## Architecture map
- App bootstrap -> `src/main.js`, `src/App.vue`
- Routes (all defined in one file) -> `src/router/index.js`
- Page views -> `src/views/*.vue` (Home, About, Events, Study, Teams, Community, Contact, Login, MembersLounge, Dashboard, VerifyCertificate, NotFound)
- Community sub-pages -> `src/views/{Technical,Cultural,ESports}View.vue`
- Meetups landing + per-region pages -> `src/views/MeetupsView.vue`, `src/views/meetups/*.vue` (+ `regionConfigs.js`, per-region JSON/CSV exports)
- Shared components -> `src/components/*.vue` (AppFooter, MembersNavbar, PageHero, RegionMeetups, DailyNotifications)
- Dashboard widgets -> `src/components/dashboard/*.vue` (BuddyMatcher, ConfessionWall, DailyChallenge, HousePoints, MemeOfWeek, MoodWall, PomodoroRoom, StudyStreak)
- Reusable animation logic -> `src/composables/useAnimations.js`
- Static data -> `src/data/` (members.json, scData_generated.js), `public/data/`
- Heavy static assets -> `public/certificates/` (89M PDFs), `public/assets/` (incl. 240-frame scroll animation), `src/assets/` (teams, regions, event posters)

## Stack & run
- Stack: Vue 3 (SFC), vue-router 4 (hash history), Vite 6. No backend — fully client-side. Auth is a localStorage token.
- Run: `npm run dev` · Build: `npm run build` · Preview: `npm run preview`
- Test: none configured.

## Key decisions (top 3–5)
- No backend — the site is static/client-only; "auth" is a localStorage token gate (`sundarbans_auth_token`). (inferred at adoption)
- Hash-based routing (`createWebHashHistory`) — works on static hosts without server rewrites. (inferred at adoption)
- **All routes are eagerly imported** in `src/router/index.js` (no lazy loading / code-splitting) — everything ships in the initial bundle. This is a known latency lever, not a deliberate choice to keep.

## Gotchas
- **Asset weight is large: ~130 MB committed.** `public/` is 103M (of which `public/certificates/` PDFs = 89M, `public/assets/` = 14M incl. 240 JPEG animation frames), `src/assets/` is 26M (teams 11M, regions 7.3M, Community Events 5.2M). This is the main latency/storage target — moving to Cloudinary is the current work.
- Certificate PDFs churn a lot in git history (many add/delete "Add files via upload" commits) and have been accidentally committed at repo root before — handle with care.
- No tests and no CI checks — verify changes by running the app.
