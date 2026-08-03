# Contributing to Sundarbans House

Thanks for contributing. This file is the whole onboarding path — clone, run, change, PR — read it
top to bottom and you should be able to open a green PR without asking anyone anything.

## 0. Read this first

Before writing any code, read **`docs/STATE.md`** in this repo. It has the current status,
architecture map, and known gotchas (e.g. large committed assets, no lazy-loaded routes). Skipping
it is the #1 way to duplicate work or reintroduce a problem someone already fixed.

## 1. Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) — this project is developed against **Node v22**. Use
  [nvm](https://github.com/nvm-sh/nvm) or similar if you need to manage versions.
- No backend and no database — the app is fully client-side. Optional env: copy
  `.env.example` to `.env` if you need Google OAuth login. The only variable is
  `VITE_GOOGLE_CLIENT_ID` (see `.env.example`). Without it the rest of the site
  still runs; OAuth sign-in will not.

## 2. Setup

1. Fork the repo on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Frontend.git
   cd Frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. (Optional) Set up OAuth env if you need login:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` only if you have your own Google client ID; the example value is
   fine for local exploration of non-OAuth pages.
5. Start the dev server:
   ```bash
   npm run dev
   ```
   Vite will print a local URL (default `http://localhost:5173`) — open it in a browser.

## 3. The real npm scripts

These are the only scripts that exist in `package.json`. Do not invent or reference others —
`npm run serve` in particular does **not** exist here.

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build (output to `dist/`) |
| `npm run preview` | Serve the built `dist/` output locally, to sanity-check a build |

There is currently no `lint` script and no test suite. A lint script and a CI workflow are being
added — once they land, this file (and the table above) will be updated, and running lint/CI green
locally before opening a PR will be expected the same way `build` is today. Until then, don't
reference commands that don't exist yet.

## 4. Making a change

1. Create a branch off `main` in your fork (never commit directly to `main`):
   ```bash
   git checkout -b your-feature-branch
   ```
2. Make your change. See **SFC convention** below before touching `.vue` files.
3. Run a production build to make sure nothing is broken:
   ```bash
   npm run build
   ```
4. Stage and commit with a clear, descriptive message:
   ```bash
   git add .
   git commit -m "Describe your change clearly"
   ```
5. Push the branch to your fork (first push sets upstream):
   ```bash
   git push -u origin your-feature-branch
   ```
6. Open a pull request from your fork/branch against `Anuraj-dev/Frontend`'s `main`. Describe what
   changed and why.
7. A repo owner reviews and approves. Contributors do not merge their own PRs and never push
   directly to `main` — everything goes through fork -> branch -> PR -> owner approval.
8. **When CI is set up** (planned; there is no GitHub Actions workflow on `main` yet), merges
   must wait for a green CI check — fix the build rather than merging around a red status. Until
   CI lands, treat a clean local `npm run build` as the gate.

## 5. SFC convention

- **New components: use `<script setup>`.** It's the standard for anything you add from now on.
- **Existing Options API components stay as-is.** Do not rewrite an existing component's script
  block to `<script setup>` just because you're touching that file for an unrelated change —
  that turns a small diff into a large one and makes review harder. Only convert a component when
  the ticket you're working on is specifically about that component.

## 6. Asset policy

This repo has previously accumulated tens of megabytes of committed binary assets, which is why
it's being actively slimmed down. Follow this policy for anything new:

- **PDFs (certificates, documents, etc.) go to Google Drive**, not into the repo. Link to them
  instead of committing them.
- **Images go to Cloudinary** (or another external asset host), not into `public/` or
  `src/assets/`. Reference the hosted URL in code.
- **Nothing heavy gets committed to git.** If you're unsure whether an asset counts as "heavy",
  ask before committing it rather than after.

## Issues & bug reports

- Check the [issue tracker](https://github.com/Anuraj-dev/Frontend/issues) before starting work,
  and check whether an issue is already assigned before picking it up.
- Bug reports should include a clear description and steps to reproduce.
- Feature ideas should be opened as an issue for discussion before a large PR.
