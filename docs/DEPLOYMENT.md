# Deployment (Cloudflare Pages + GitHub Actions)

This project deploys via GitHub Actions to Cloudflare Pages. Every push to `main` triggers a build and publish of `dist/`.

## Prerequisites
- Cloudflare Account ID
- Cloudflare API Token with minimal permissions:
  - Account → Cloudflare Pages: Read
  - Account → Cloudflare Pages: Edit
- Cloudflare Pages project created (recommended name: `scholarphile`)
- Custom domain `scholarphile.com` mapped in Cloudflare Pages

## Configure GitHub Secrets
In GitHub → Repo → Settings → Secrets and variables → Actions:
- `CLOUDFLARE_API_TOKEN`: API token string
- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare Account ID
- `PAGES_PROJECT_NAME`: Cloudflare Pages project name (e.g., `scholarphile`)

## CI workflow
Defined in `.github/workflows/deploy.yml`:
- Checkout → Node 20 → `npm install` → `npm run build` → publish `dist/` via `cloudflare/pages-action`

## Build command
`npm run build` simply copies static assets into `dist/`:
```
npm run build
```

## Manual deployment trigger
Use the “Run workflow” button in GitHub Actions (Workflow Dispatch) to redeploy latest `main`.

## Verify deployment
- Open `https://scholarphile.com`
- Hard refresh to bypass cache: Cmd+Shift+R (macOS) / Ctrl+F5 (Windows)

## Troubleshooting
- 404 or old content: ensure `dist/` contains the latest files and hard-refresh
- Action failed: open the workflow logs; verify secrets and Pages project name
- Domain mismatch: confirm custom domain is connected to the Cloudflare Pages project
