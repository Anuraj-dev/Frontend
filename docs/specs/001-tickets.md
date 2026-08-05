# Spec 001 — Tickets

> One ticket = one PR (unless marked same-PR). Order matters within a phase; phases are
> sequential. AC = acceptance criteria. Parent spec: `001-codebase-overhaul.md`.
>
> **Status legend:** `[x]` done · `[-]` cancelled / dropped · (no open tickets)  
> Status last updated: **2026-08-05**. Spec 001 is **closed**.
> Evidence: merged PRs on `Anuraj-dev/Frontend` + owner decision to cancel remaining work.

## Spec closed

**Shipped value (what mattered on the live site + repo HEAD):** membership (T-13), certs on Drive
(T-16), Cloudinary media (T-18), plus tooling/CI/lazy routes/refactors/a11y already merged.

**Remaining tickets cancelled 2026-08-05** — optional hygiene only; not needed for product or
day-to-day quality. Do not re-open unless the owner explicitly wants them later.

| ID | Title | Status | Evidence / notes |
|----|-------|--------|------------------|
| T-01 | Screenshot baseline script | **Cancelled** | Optional visual regression aid |
| T-02 | Mirror backup | **Cancelled** | Local mirror may still exist; not a ticket |
| T-03 | Lint/format config | **Done** | PR #9 |
| T-04 | One-shot reformat | **Done** | PR #13 |
| T-05 | CI workflow | **Done** | PR #15 |
| T-06 | Route smoke test | **Done** | PR #15 (`e2e/routes.smoke.spec.js`) |
| T-07 | CONTRIBUTING rewrite | **Done** | PR #10 |
| T-08 | Fork preview deploys | **Cancelled** | Optional contributor ergonomics |
| T-09 | `/members` → `/login` | **Done** | PR #5 |
| T-10 | Lazy-load all routes | **Done** | PR #5 |
| T-11 | `ownership.md` | **Cancelled** | Owner stays with the team; no handover doc |
| T-12 | Apps Script membership source in repo | **Cancelled** | Endpoint live via T-13; source not committed |
| T-13 | Wire login; delete members.json | **Done** | PRs #17, #19, #20 |
| T-14 | Purge dead files | **Done** | PR #6 |
| T-15 | Offline PDF backup | **Cancelled** | Local backup may still exist; not a ticket |
| T-16 | Drive migration (certs) | **Done** | PRs #18, #20 |
| T-17 | Themed modal cert viewer | **Cancelled** | Drive via `window.open` is enough |
| T-18 | Cloudinary images | **Done** | PR #21 merged 2026-08-05 |
| T-19 | Defer homepage frames | **Done** | PR #11 |
| T-20 | Re-baseline screenshots | **Cancelled** | No baseline program |
| T-21 | Stale-branch scan report | **Cancelled** | Not needed without history purge |
| T-22 | History purge evening | **Cancelled** | HEAD already clean; rewrite not worth the risk |
| T-23 | CI size guard | **Cancelled** | Policy + review enough for now |
| T-24 | StudyView split | **Done** | PR #8 |
| T-25 | Community shared components | **Done** | PR #12 |
| T-26 | Meetups param route | **Done** | PR #14 |
| T-27 | Remove v-html | **Done** | PR #7 |
| T-28 | Alt/aria pass | **Done** | PR #16 |
| T-29 | Final re-audit | **Cancelled** | Spec closed without formal re-audit table |

**Next for the team:** none from Spec 001. Maintain HEAD: no heavy binaries in git; use
`media/` + `npm run media:sync` for new photos; keep CI green.

---

## Phase 0a — Baseline

- [-] **T-01 Screenshot baseline script.** **CANCELLED.**
- [-] **T-02 Mirror backup.** **CANCELLED.**

## Phase 0b — Tooling + CI

- [x] **T-03 Lint/format config PR.** → **PR #9**
- [x] **T-04 One-shot reformat PR.** → **PR #13**
- [x] **T-05 CI workflow.** → **PR #15**
- [x] **T-06 Route smoke test.** → **PR #15**
- [x] **T-07 CONTRIBUTING rewrite.** → **PR #10**
- [-] **T-08 Verify fork preview deploys.** **CANCELLED.**

## Phase 1 — Bugfix

- [x] **T-09 Fix all four `/members` redirects → `/login`.** → **PR #5**

## Phase 2 — Lazy routes

- [x] **T-10 Lazy-load all routes** + `router.onError` + scrollBehavior. → **PR #5**

## Phase 3 — Membership via Apps Script

- [-] **T-11 ownership.md.** **CANCELLED** (2026-08-05).
- [-] **T-12 Apps Script membership source in `tools/apps-script/`.** **CANCELLED.**
  (Production endpoint remains via `VITE_MEMBERSHIP_CHECK_URL` / T-13.)
- [x] **T-13 Wire login to endpoint; delete members.json.** → **PRs #17, #19, #20**

## Phase 4 — Dead code

- [x] **T-14 Purge dead files.** → **PR #6**

## Phase 5 — Assets + history

- [-] **T-15 Offline PDF backup.** **CANCELLED.**
- [x] **T-16 Drive migration.** → **PRs #18, #20**
- [-] **T-17 Themed modal viewer.** **CANCELLED** (Drive new-tab is accepted).
- [x] **T-18 Cloudinary images.** → **PR #21 merged** 2026-08-05
- [x] **T-19 Defer homepage frames.** → **PR #11**
- [-] **T-20 Re-baseline screenshots.** **CANCELLED.**
- [-] **T-21 Stale-branch scan report.** **CANCELLED.**
- [-] **T-22 History purge evening.** **CANCELLED.**
- [-] **T-23 CI size guard.** **CANCELLED.**

## Phase 6 — Refactors

- [x] **T-24 StudyView split.** → **PR #8**
- [x] **T-25 Community shared components.** → **PR #12**
- [x] **T-26 Meetups param route.** → **PR #14**
- [x] **T-27 Remove v-html.** → **PR #7**

## Phase 7 — A11y + close-out

- [x] **T-28 Alt/aria pass.** → **PR #16**
- [-] **T-29 Final re-audit.** **CANCELLED.**

---

## How to update this file

Spec 001 is closed. If a cancelled item is ever revived, open a **new** ticket outside this
closed board (or a new numbered spec) rather than silently re-opening cancelled rows.
