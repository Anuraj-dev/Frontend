# Spec 001 — Codebase Overhaul (quality, security, weight, team-readiness)

> Status: **in progress** (approved 2026-08-01; bulk of tickets shipped including **T-18 Cloudinary**
> via PR #21 merged 2026-08-05). Remaining work tracked in `001-tickets.md`.
> Baseline to beat: `docs/audit-2026-08-01.md` (if missing, recreate from T-29 / historical audit).
> Tickets: **`001-tickets.md`** — read that for done vs open.

## Goal

Turn the repo into a maintainable, collaborative codebase for the arriving team — **without a
backend** and **without changing the site's UI or functionality** (refactor-only). Deliberate
exceptions, chosen by owner: the `/members`→`/login` bugfix, faster loads, and the certificate
viewer becoming a themed in-site modal.

## Hard constraints

1. No org-run backend. Google-hosted services (Apps Script, Sheets, Drive) and Cloudinary
   (images only) are allowed.
2. Zero unintended UI/functionality changes. Every risky PR is screenshot-compared.
3. Nothing under `docs/` is ever deleted.
4. Review flow: contributors fork → PR to org repo → owner approves. CI is an approval
   signal: **owner does not merge red PRs** (policy, in CONTRIBUTING).

## Phases (final order — reviewers moved baseline before reformat, lazy-loading earlier)

### Phase 0a — Baseline (on untouched `main`, BEFORE any change)
- Playwright script captures all 26 routes at 2 widths (desktop/mobile). Before capture,
  inject `*{animation:none!important;transition:none!important}` and stub `Math.random`
  (kills particle/scroll-reveal nondeterminism). Stored locally/gitignored; manual
  comparison aid, NOT a CI gate. → **T-01** (open)
- Full `git clone --mirror` backup of the org repo (pre-purge safety). → **T-02** (partial)

### Phase 0b — Tooling + CI (two PRs: config first, reformat second)
- Prettier + ESLint flat config: `vue3-essential` rules as errors + `eslint-config-prettier`
  last (NOT `vue3-recommended` — it fights Prettier; reviewer finding). → **T-03** (done)
- One-shot mechanical reformat commit (own PR). Compare screenshots after. → **T-04** (done)
- CI `.github/workflows/ci.yml`: `npm ci` → `prettier --check` → `eslint` → `vite build` →
  **route smoke test** (Playwright: visit all routes, assert no console errors + non-empty
  render — this IS a CI gate; catches broken chunks/hash URLs/CORS). → **T-05, T-06** (done)
- Pin Node (`engines` + `.nvmrc`). Fix CONTRIBUTING's phantom `npm run serve` → real scripts;
  rewrite for fork workflow + asset policy. → **T-07** (done)
- **Verify preview deployments work for fork PRs** (they're the review channel; disabled by
  default on Vercel/Netlify). Add every preview domain to Google OAuth authorized origins.
  → **T-08** (open)

### Phase 1 — Bugfix: `/members` → `/login` (ALL FOUR sites)
`src/router/index.js:80`, `src/views/DashboardView.vue:169`,
`src/views/MembersLoungeView.vue:446` (logout → 404!), `MembersLoungeView.vue:462`.
→ **T-09** (done)

### Phase 2 — Lazy-load all routes
- Every route → `() => import(...)`. URLs unchanged (hash router).
- `router.onError`: reload on chunk-load failure (stale-tab-after-deploy).
- `scrollBehavior` hash-anchor fix: resolve after component load (async components mean the
  `el` may not exist yet).
- This alone stops the roster + lounge code downloading on `/`.
→ **T-10** (done)

### Phase 3 — Membership check via Apps Script (kills the roster leak)
- Council-owned Google Sheet = single source of truth (survives webadmin tenure).
- Apps Script web app ("execute as me, anyone can access"), **source committed to repo**
  (`tools/apps-script/`), deployed by copy-paste; redeploys via "manage deployments → edit"
  (a NEW deployment mints a new URL and breaks login). → **T-12** (partial: live, source not in repo)
- Contract: client POSTs the OAuth access token as `Content-Type: text/plain` (Apps Script
  cannot answer CORS preflight — no JSON content-type, no auth headers), `redirect: 'follow'`.
  Script verifies token via `oauth2/v3/tokeninfo` **asserting `aud` = our client ID**, reads
  email from Google server-side, checks Sheet (CacheService ~6h), returns `{member: bool}`.
  **Never accept a caller-supplied email** (roster-enumeration oracle).
- On success client stores the lowercase email in `sundarbans_auth_token` — unchanged, the
  lounge greeting parses it.
- Login gains explicit states for the new failure modes (script down/slow) reusing existing
  message UI. Delete `src/data/members.json`. → **T-13** (done)
- Prereq: `docs/ownership.md` — who owns each account (Google/Sheet/Drive/Cloudinary/OAuth
  client/Apps Script URL), how it transfers at tenure handover, env var inventory
  (`VITE_GOOGLE_CLIENT_ID`, Apps Script URL), break-glass notes. → **T-11** (open)
- The lounge gate stays a soft gate (lounge is a mockup; the roster was the only asset) —
  documented in decisions.md.

### Phase 4 — Dead-code purge (code/assets ONLY — `docs/` untouched)
- `public/sudarbans/` (legacy vanilla dashboard, zero refs), `src/assets/teams/mannu.jpeg`
  (byte-identical dup of .jpg), `src/views/meetups/manifest.json` (zero refs).
- **NOT** the EventsView countdown — reviewer finding: it computes a rolling next-Friday
  target; `useAnimations.js` version takes a fixed date. Not a duplicate. Leave it.
→ **T-14** (done)

### Phase 5 — Asset weight
- **PDFs → Google Drive** (council account): private folder, per-file "anyone with link /
  view". Offline backup first. → **T-15** (partial), **T-16** (done)
  Viewer: **themed in-site modal** with `drive.google.com/file/d/{id}/preview` iframe +
  download button. → **T-17** (partial: Drive links work; modal UX open)
- **Oversized images → Cloudinary** (`f_auto,q_auto` + width limits): team photos, region
  images, event posters. Pipeline: `media/` + `npm run media:sync`. → **T-18** (done, PR #21 merged)
- **Frames stay on the static host**. Deferral: frame 1 eager, bounded look-ahead, last-loaded
  fallback, cleanup on leave. → **T-19** (done)
- **Re-baseline screenshots after Cloudinary.** → **T-20** (open)
- **History purge evening** (gated): stale-branch report → filter-repo → force-push → re-fork.
  → **T-21** (open), **T-22** (open, gated)
- CI size-guard step post-migration. → **T-23** (open)

### Phase 6 — Refactors (screenshot-gated, pure moves, no "improving while in there")
- **StudyView.vue → per-section components** under `src/components/study/`. → **T-24** (done)
- **Community views: shared components, NOT a full merge.** → **T-25** (done)
- **Meetups → single `/meetups/:region` route** (`delhi-ncr` slug ≠ `delhi` config key).
  → **T-26** (done)
- Remove the `v-html` at RegionMeetups. → **T-27** (done)

### Phase 7 — A11y + re-audit
- Alt text + aria-labels + keyboard focus sanity. → **T-28** (done)
- Final re-audit comparison table. → **T-29** (open)

## Deferred / out of scope

- Lounge real functionality (mockup today), in-page community forms (separate effort, see
  decisions.md), `certificates.json` publishing recipient names (accepted — it's a public
  verification registry), Options-API→`<script setup>` unification (convention note in
  CONTRIBUTING; migrate opportunistically only).
- Hero 240 frames on Cloudinary (explicitly rejected; stay under `public/assets/frames/`).

## Related docs

| Doc | Role |
|-----|------|
| `001-tickets.md` | Authoritative ticket list + live status board |
| `docs/STATE.md` | Cold-start "what's in flight right now" |
| `docs/decisions.md` | Why we chose Drive / Cloudinary / Apps Script / etc. |
| `CONTRIBUTING.md` | How a newcomer opens a green PR |
