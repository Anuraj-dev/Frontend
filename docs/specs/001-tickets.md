# Spec 001 — Tickets

> One ticket = one PR (unless marked same-PR). Order matters within a phase; phases are
> sequential. AC = acceptance criteria. Parent spec: `001-codebase-overhaul.md`.
>
> **Status legend:** `[x]` done · `[~]` partial / in progress · `[ ]` not started  
> Status last updated: **2026-08-05**. Evidence: merged PRs on `Anuraj-dev/Frontend` + repo state
> (see `docs/STATE.md`).

## Status board (quick view)

| ID | Title | Status | Evidence / notes |
|----|-------|--------|------------------|
| T-01 | Screenshot baseline script | **Open** | Not in repo |
| T-02 | Mirror backup | **Partial** | Local mirror at `~/SUndarbans_Backup`; off-laptop (e.g. council Drive) still needed |
| T-03 | Lint/format config | **Done** | PR #9 |
| T-04 | One-shot reformat | **Done** | PR #13 |
| T-05 | CI workflow | **Done** | PR #15 |
| T-06 | Route smoke test | **Done** | PR #15 (`e2e/routes.smoke.spec.js`) |
| T-07 | CONTRIBUTING rewrite | **Done** | PR #10 |
| T-08 | Fork preview deploys | **Open** | Not verified/documented in ownership doc |
| T-09 | `/members` → `/login` | **Done** | PR #5 |
| T-10 | Lazy-load all routes | **Done** | PR #5 |
| T-11 | `ownership.md` | **Dropped** | Owner decision 2026-08-05: not needed; primary stays with the team |
| T-12 | Apps Script membership source | **Partial** | Live via `VITE_MEMBERSHIP_CHECK_URL` (T-13); source not under `tools/apps-script/` |
| T-13 | Wire login; delete members.json | **Done** | PRs #17, #19, #20 |
| T-14 | Purge dead files | **Done** | PR #6 |
| T-15 | Offline PDF backup | **Partial** | Local: `~/SUndarbans_Backup/t15-certificates-backup-2026-08-03`; confirm council Drive copy |
| T-16 | Drive migration (certs) | **Done** | PRs #18, #20 (`driveFileId` / `driveUrl` in data) |
| T-17 | Themed modal cert viewer | **Partial** | Drive view/download works; opens new tab (`window.open`), not in-site modal iframe |
| T-18 | Cloudinary images | **Done** | PR [#21](https://github.com/Anuraj-dev/Frontend/pull/21) **merged** 2026-08-05 |
| T-19 | Defer homepage frames | **Done** | PR #11 |
| T-20 | Re-baseline screenshots | **Open** | Post-Cloudinary (T-18 done); new truth set |
| T-21 | Stale-branch scan report | **Open** | |
| T-22 | History purge evening | **Open** | Gated: org admin + webadmin OK + T-15 + T-21 |
| T-23 | CI size guard | **Open** | |
| T-24 | StudyView split | **Done** | PR #8 |
| T-25 | Community shared components | **Done** | PR #12 |
| T-26 | Meetups param route | **Done** | PR #14 |
| T-27 | Remove v-html | **Done** | PR #7 |
| T-28 | Alt/aria pass | **Done** | PR #16 |
| T-29 | Final re-audit | **Open** | Needs `docs/audit-2026-08-01.md` baseline + post metrics |

**Suggested next pick order for the team:** T-20 → T-08 / T-12 → T-17 (if modal still wanted) → T-23 → T-21 → T-22 (gated) → T-01 / T-29 close-out.  
**Dropped:** T-11 (`ownership.md`) — owner will keep config knowledge; no handover doc.

---

## Phase 0a — Baseline

- [ ] **T-01 Screenshot baseline script.** Playwright script (gitignored output) capturing all
  26 routes × 2 widths on untouched `main`, animations frozen + `Math.random` stubbed.
  AC: 52 images captured; re-running twice produces visually identical images.
- [~] **T-02 Mirror backup.** `git clone --mirror` of org repo saved off-machine.
  AC: backup exists outside the repo/laptop (e.g. council Drive).
  _Note: local mirror exists; complete AC when off-laptop copy is confirmed._

## Phase 0b — Tooling + CI

- [x] **T-03 Lint/format config PR.** Prettier + ESLint flat config (`vue3-essential` errors +
  `eslint-config-prettier`), `engines` + `.nvmrc`, npm scripts `lint`/`format`.
  AC: `npm run lint` passes on untouched code except real-bug findings, which are listed in
  the PR body (fixed in T-04 only if mechanical). → **PR #9**
- [x] **T-04 One-shot reformat PR.** `prettier --write .` + `eslint --fix`. Mechanical only.
  AC: screenshots match T-01 baseline; no manual edits mixed in. → **PR #13**
- [x] **T-05 CI workflow.** `ci.yml`: npm ci → prettier check → eslint → build → T-06 smoke.
  AC: red on a deliberately broken import; green on main; runs on fork PRs. → **PR #15**
- [x] **T-06 Route smoke test.** Playwright in CI: visit every route, assert no console
  errors + non-empty `#app` render.
  AC: catches a deliberately broken route in a test PR. → **PR #15**
- [x] **T-07 CONTRIBUTING rewrite.** Fork→PR→approval flow, real npm scripts (kill
  `npm run serve`), asset policy (PDFs→Drive, images→Cloudinary, nothing heavy in git),
  "read docs/STATE.md first", red-CI-no-merge policy, SFC convention note (`<script setup>`
  for new code).
  AC: a newcomer can go clone→green PR using only this file. → **PR #10**
- [ ] **T-08 Verify fork preview deploys.** Enable/verify preview deployments for fork PRs;
  add preview domains to Google OAuth authorized JS origins. (No ownership.md — T-11 dropped.)
  AC: a PR from a fork produces a working preview URL where login is at least attemptable.

## Phase 1 — Bugfix

- [x] **T-09 Fix all four `/members` redirects → `/login`.** router/index.js:80,
  DashboardView.vue:169, MembersLoungeView.vue:446 (logout), MembersLoungeView.vue:462.
  AC: logged-out visits to /lounge and /dashboard land on login; logout lands on login;
  grep for `"/members"` returns zero hits. → **PR #5**

## Phase 2 — Lazy routes

- [x] **T-10 Lazy-load all routes** + `router.onError` chunk-reload + scrollBehavior
  async-anchor fix.
  AC: build emits per-route chunks; homepage JS payload drops from 767 kB to <~200 kB;
  hash anchors (e.g. /meetups regions `#upcoming`) still scroll; smoke test green. → **PR #5**

## Phase 3 — Membership via Apps Script

- [~] **T-11 ownership.md.** ~~Accounts/credentials inventory + handover + break-glass.~~
  **DROPPED (2026-08-05).** Owner decision: primary stays with the team; no
  `docs/ownership.md`. Config knowledge stays with the maintainer — do not implement.
- [~] **T-12 Apps Script membership endpoint.** Source in `tools/apps-script/`; Sheet-backed,
  CacheService ~6h, tokeninfo `aud` check, no caller-supplied email, POST text/plain
  contract documented in the file header.
  AC: curl with a valid token → `{member:true/false}`; curl with foreign-app token → error;
  curl with email param only → rejected.
  _Note: production endpoint is wired (T-13). Still open: commit script source under
  `tools/apps-script/` so the team can redeploy._
- [x] **T-13 Wire login to endpoint; delete members.json.** Token stored = lowercase email
  (lounge greeting depends on it). New failure messages reuse existing message UI.
  AC: member login reaches lounge with correct roll number; non-member rejected; roster
  absent from every built chunk (grep dist for `@ds.study.iitm.ac.in` = 0 hits).
  → **PRs #17, #19, #20**

## Phase 4 — Dead code

- [x] **T-14 Purge dead files.** `public/sudarbans/`, `src/assets/teams/mannu.jpeg`,
  `src/views/meetups/manifest.json`. NOT the EventsView countdown; NOTHING in docs/.
  AC: build green, smoke green, site pixel-identical. → **PR #6**

## Phase 5 — Assets + history

- [~] **T-15 Offline PDF backup.** All PDFs copied to council Drive backup folder + one
  local copy. AC: checksums match repo copies.
  _Note: local backup under `~/SUndarbans_Backup/t15-certificates-backup-2026-08-03` (100 PDFs).
  Confirm off-laptop council Drive copy to close._
- [x] **T-16 Drive migration.** Migration Apps Script: upload/verify files, set per-file
  anyone-with-link/view, emit `driveFileId` manifest; auto-share trigger for future files;
  `certificates.json` gains `driveFileId`.
  AC: script output maps every `pdf:true` cert to exactly one accessible file; folder
  itself private (checked from an incognito session). → **PRs #18, #20**
- [~] **T-17 Themed modal viewer.** Verify view swaps `/certificates/` paths for Drive:
  in-site modal with `/preview` iframe + download button.
  AC: view/download work for a sampled 10 certs; incognito user opening one file cannot
  list any other file; `public/certificates/` deleted from repo.
  _Note: Drive URLs + repo PDF deletion done. Viewer currently `window.open`s Drive — modal
  iframe UX still open if product still wants it._
- [x] **T-18 Cloudinary images.** Team/region/poster images uploaded with explicit widths;
  refs swapped. Frames NOT moved.
  AC: /teams and /meetups visually identical at normal zoom; largest image request
  <300 kB; src/assets drops by >15 MB.
  → **PR #21 merged** 2026-08-05 (`feat/cloudinary-media-pipeline`).
- [x] **T-19 Defer homepage frames.** Frame 1 eager, bounded look-ahead, last-loaded-frame
  fallback, cleanup on route leave. Frames stay in `public/assets/frames/`.
  AC: homepage initial network <2 MB; fast scroll shows no blank canvas. → **PR #11**
- [ ] **T-20 Re-baseline screenshots** (post-Cloudinary pixels are the new truth).
  AC: fresh 52-image set replaces T-01 set.
- [ ] **T-21 Stale-branch scan report.** Diff all 25 org branches vs main; one-page report
  of anything not already in main. AC: report delivered to owner for webadmin sign-off.
- [ ] **T-22 History purge evening** (gated: org admin + webadmin OK + T-15 + T-21 done).
  Delete signed-off branches → `filter-repo` (certificates/, root PDFs, members.json) →
  force-push → delete+re-fork owner fork → email GitHub Support.
  AC: fresh clone <25 MB; `git log --all` shows no PDF/members.json blobs; site deploy
  unaffected.
- [ ] **T-23 CI size guard.** Budgets from the real post-migration build (JS gz, CSS gz,
  total dist, max single file). AC: CI red when a 1 MB test file is added to public/.

## Phase 6 — Refactors (each PR: screenshots before/after vs T-20 baseline)

- [x] **T-24 StudyView split.** 5 sections → `src/components/study/*`; view = assembler.
  Pure move. AC: pixel-identical; StudyView.vue <150 lines. → **PR #8**
- [x] **T-25 Community shared components.** Extract shared hero/event-grid/winners
  components + shared stylesheet from the 45 duplicated classes; three thin views keep
  local data. NO full merge (decision reverted). AC: pixel-identical ×3 routes; net LOC
  down ≥40% across the three files. → **PR #12**
- [x] **T-26 Meetups param route.** `/meetups/:region` + explicit slug→config map
  (`delhi-ncr`→`delhi`!), invalid → NotFoundView, `:key` remount. Delete 9 wrappers.
  AC: all 9 URLs render identically; region→region nav re-runs reveals/counters;
  /meetups/nonsense → 404 view. → **PR #14**
- [x] **T-27 Remove v-html** in RegionMeetups.vue:81 (plain interpolation).
  AC: upcoming-event name renders identically. → **PR #7**

## Phase 7 — A11y + close-out

- [x] **T-28 Alt/aria pass.** 57/57 alt (decorative = `alt=""`), aria-labels on icon-only
  controls, tab keyboard sanity. AC: no visual change; axe-core quick scan shows no
  critical issues on main routes. → **PR #16**
- [ ] **T-29 Final re-audit.** Re-measure every §Baseline metric; append comparison table
  to `docs/audit-2026-08-01.md`. AC: table shows before/after for all 10 dimensions.

---

## How to update this file

When a ticket lands (or is abandoned):

1. Flip the checkbox (`[x]` / `[~]` / `[ ]`) and add the PR number next to the ticket.
2. Update the **Status board** table in the same commit.
3. Point `docs/STATE.md` at any ticket that is actively in progress.
