# Cloudflare Pages Setup

## If you don't have a Cloudflare Pages project yet:

1. **Create Pages Project:**
   - Go to: Cloudflare Dashboard → Workers & Pages → Pages
   - Click "Create application"
   - Choose "Connect to Git"
   - Select "Scholarphile/scholarphile" repository
   - Configure:
     - Project name: `scholarphile` (or your preferred name)
     - Production branch: `main`
     - Build command: `npm run build`
     - Build output directory: `dist`

2. **Add Custom Domain:**
   - In your Pages project → Custom domains
   - Add `scholarphile.com`
   - Add `www.scholarphile.com` (optional)

3. **Add GitHub Secret:**
   - GitHub → Scholarphile/scholarphile → Settings → Secrets and variables → Actions
   - New repository secret:
     - Name: `PAGES_PROJECT_NAME`
     - Value: your exact project name from step 1

## Common project names to try:
- `scholarphile`
- `scholarphile-com`
- `scholarphile-pages`

## If the project already exists:
Just add the `PAGES_PROJECT_NAME` secret with the exact name you see in Cloudflare.
