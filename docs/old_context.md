# Old context — Sundarbans House
> ⚠️ Reconstructed from the codebase, README, and git history when the context system was adopted on
> 2026-07-11. This is a best-effort summary of what the project is and how far it had progressed BEFORE
> per-session tracking began. It is NOT a record of exact past sessions or decisions — those weren't
> captured. Treat specifics as inferred, not authoritative.

## What this project is
A centralized web platform for the Sundarbans House council within the IITM BS degree program. It manages
events, resources, team collaboration, regional meetups, and digital initiatives for house members, plus a
public certificate-verification page. Maintained by the Sundarbans WebOps team; the current maintainer is
the web admin (WebOps head).

## How far it had progressed
The Vue app is well-developed and in active use (546 commits, PR-driven workflow). Built and working:
- Public marketing/info pages: Home, About (with a magazine/flipbook section), Events, Study, Teams,
  Community (with Technical / Cultural / E-Sports sub-pages), Contact.
- A members area: Login -> members lounge (auth-gated via a localStorage token) and a Dashboard with
  several interactive widgets (BuddyMatcher, ConfessionWall, DailyChallenge, HousePoints, MemeOfWeek,
  MoodWall, PomodoroRoom, StudyStreak).
- Meetups: a landing page plus per-region pages (Delhi NCR, Mumbai, Bangalore, Kolkata, Hyderabad, Patna,
  Chandigarh, Chennai, Lucknow), each driven by shared region config and per-region JSON/CSV data.
- Certificate verification: a public `/verify-certificate` page backed by a large set of certificate PDFs
  and a `certificates.json` manifest (~67-certificate set per history).

## Notable structure / entry points
- `src/main.js` / `src/App.vue` bootstrap; `src/router/index.js` holds every route (all eagerly imported).
- `src/views/` = page components; `src/views/meetups/` = region pages; `src/components/` + `.../dashboard/`
  = shared and dashboard widgets; `src/composables/useAnimations.js` = animation logic.
- Heavy static media lives in `public/` (certificates, a 240-frame scroll-animation image sequence) and
  `src/assets/` (team photos, region/city images, event posters).
- README also references a legacy standalone HTML version (`sundarbans/` login/dashboard/members pages)
  that predates the Vue rewrite.

## Inferred stack & tooling
- Vue 3 (single-file components) + vue-router 4 using hash history + Vite 6 as the build tool.
- No backend, no database, no test suite. Deployed as a static build from the GitHub repo.
