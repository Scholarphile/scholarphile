# Scholarphile

Academic research platform with auto-deployment to scholarphile.com

## Installation

Backend skeleton is implemented using Cloudflare Pages Functions.

### Endpoints
- POST `/api/signin`
  - body: `{ email, password, remember }`
  - returns: `{ token, user }`
- GET `/api/me`
  - headers: `Authorization: Bearer <token>`
  - returns: `{ user }`
- GET `/api/user-data`
  - headers: `Authorization: Bearer <token>`
  - returns: user data object (simulated), cached for 60s

### Environment
- Set `JWT_SECRET` in your Cloudflare Pages project (Settings → Environment variables)

### Dev/Build
- Build: `npm run build` (copies static files and `functions/` to `dist/`)
- Local static preview: `npm run start` (no functions runtime)
- For full local functions dev, use Wrangler: `wrangler pages dev dist` (requires Wrangler installed)

See `setup-cloudflare.md` for Cloudflare Pages setup.
