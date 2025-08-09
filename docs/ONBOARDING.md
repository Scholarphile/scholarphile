# Onboarding

Welcome to Scholarphile. This repo is intentionally minimal: a static site deployed to Cloudflare Pages on every push to `main`.

## Access you need
- GitHub: access to `Scholarphile/scholarphile` repo (Write or higher)
- Cloudflare: added to the account that hosts `scholarphile.com` with Pages permissions

## Local development
- Requirements: modern browser, `node >= 18` (optional), `python3` (for simple server)
- Run locally (any of these):
  - Static: `python3 -m http.server 8080` and open http://localhost:8080
  - Or: `npm start` (uses Python http server under the hood)

## Project layout
- `index.html` — entry page (dark, minimal hero)
- `style.css` — styles (dark theme, subtle animations)
- `script.js` — optional minimal JS
- `package.json` — `build` copies files into `dist/` for deploy
- `.github/workflows/deploy.yml` — CI for Cloudflare Pages
- `docs/` — docs for onboarding, deployment, and architecture

## Deploys
- Push to `main` → GitHub Action builds and deploys to Cloudflare Pages
- Secrets required in GitHub repo settings → Secrets and variables → Actions:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `PAGES_PROJECT_NAME`

If you don’t have these, see `docs/DEPLOYMENT.md`.

## Workflow
- Create a branch: `git checkout -b feat/short-desc`
- Make focused edits
- Open PR → get review → merge to `main`
- Deployment auto-runs; confirm on `scholarphile.com`

## Coding style
- Keep it minimal; every line should serve a purpose
- Prefer semantic HTML; small, composable CSS
- Avoid heavy dependencies unless a real need is proven

## Questions
- Ask in the team channel; link your branch/PR and a 1–2 sentence context
