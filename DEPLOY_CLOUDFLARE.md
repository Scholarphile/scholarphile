# 🚀 Deploy Scholarphile to Cloudflare Pages

Complete deployment guide using **Railway** (backend) + **Cloudflare Pages** (frontend).

---

## 🔴 Step 1: Deploy Backend to Railway (5 minutes)

### Go to: https://railway.app

1. **Sign up/Login** with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`Scholarphile/scholarphile`**
5. Railway will detect Python and start deploying

### Add Environment Variables:

Click on your project → **"Variables"** tab → Add these:

```
YOUTUBE_API_KEY=your_actual_youtube_api_key_here
SECRET_KEY=your-secret-key-here-make-it-random-32-chars
DATABASE_URL=sqlite:///./scholarphile.db
REDIS_URL=redis://localhost:6379/0
CACHE_TTL=3600
ALLOWED_ORIGINS=["https://scholarphile.pages.dev"]
API_V1_PREFIX=/api/v1
PROJECT_NAME=Scholarphile
VERSION=1.0.0
DEBUG=false
LOG_LEVEL=INFO
```

**Important**: 
- Replace `your_actual_youtube_api_key_here` with your real key!
- We'll update `ALLOWED_ORIGINS` later with your actual Cloudflare URL

### Get Your Backend URL:

- Click **"Settings"** → **"Domains"**
- Copy the Railway URL (e.g., `scholarphile-production-xxxx.up.railway.app`)
- ✅ Backend deployed!

---

## 🟠 Step 2: Deploy Frontend to Cloudflare Pages (5 minutes)

### Option A: Via Cloudflare Dashboard (Easiest)

#### Go to: https://dash.cloudflare.com

1. **Sign up/Login** to Cloudflare
2. Go to **"Workers & Pages"** in the sidebar
3. Click **"Create application"**
4. Click **"Pages"** tab
5. Click **"Connect to Git"**

#### Connect GitHub:

6. Authorize Cloudflare to access your GitHub
7. Select repository: **`Scholarphile/scholarphile`**
8. Click **"Begin setup"**

#### Configure Build Settings:

```
Project name: scholarphile
Production branch: main
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/out
Root directory: /
```

#### Environment Variables:

Click **"Add variable"** and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api/v1
NODE_VERSION=18
```

Replace with your actual Railway URL from Step 1!

9. Click **"Save and Deploy"**
10. Wait 2-3 minutes...
11. ✅ Frontend deployed!

#### Get Your Frontend URL:

- You'll see: `https://scholarphile.pages.dev`
- Or custom: `https://xxxx-xxx.scholarphile.pages.dev`

---

### Option B: Via Wrangler CLI (For Advanced Users)

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy from frontend directory
cd /Users/georgematali/permates/scholarphile/frontend

# Create pages project
wrangler pages project create scholarphile

# Build and deploy
npm run build
wrangler pages deploy out --project-name=scholarphile

# Set environment variable
wrangler pages deployment create scholarphile \
  --env=production \
  --var NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api/v1
```

---

## 🔄 Step 3: Update Backend CORS

### Go back to Railway:

1. Open your Scholarphile project
2. Go to **"Variables"**
3. Find `ALLOWED_ORIGINS`
4. Update to include your Cloudflare Pages URL:

```
["https://scholarphile.pages.dev","https://your-branch.scholarphile.pages.dev"]
```

If you have a custom domain:
```
["https://scholarphile.pages.dev","https://scholarphile.com","https://www.scholarphile.com"]
```

5. Click **"Save"**
6. Railway will automatically redeploy

---

## ✅ Step 4: Test Your Live Site!

1. **Open your Cloudflare Pages URL**: `https://scholarphile.pages.dev`
2. Try searching for "calculus"
3. Try the curate page
4. Watch a video
5. Check API docs: `https://your-railway-url.up.railway.app/api/v1/docs`

---

## 🌐 Step 5: Add Custom Domain (Optional)

### In Cloudflare Pages:

1. Go to your **"scholarphile"** project
2. Click **"Custom domains"**
3. Click **"Set up a domain"**
4. Enter your domain: `scholarphile.com`
5. Cloudflare will automatically configure DNS if domain is on Cloudflare
6. If not, add the CNAME record shown

### Update Backend CORS:

Don't forget to add your custom domain to Railway's `ALLOWED_ORIGINS`!

---

## 🎯 Why Cloudflare Pages?

✅ **Blazing Fast**: Global edge network  
✅ **Unlimited Bandwidth**: No overage charges  
✅ **Free SSL**: Automatic HTTPS  
✅ **DDoS Protection**: Built-in security  
✅ **Functions**: Edge functions available  
✅ **Analytics**: Built-in Web Analytics  
✅ **Rollbacks**: Easy deployment rollbacks  

---

## 🔧 Cloudflare Pages Configuration

### Update `frontend/package.json`:

Make sure you have the build script:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "export": "next build && next export"
  }
}
```

### Update `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports for Cloudflare
  images: {
    unoptimized: true,  // Required for static export
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
```

---

## 🐛 Troubleshooting

### Build Fails on Cloudflare?

**Error: "output: 'export' not configured"**
- Update `next.config.ts` with `output: 'export'`
- Commit and push changes
- Retry deployment

**Error: "Image optimization requires a server"**
- Add `images: { unoptimized: true }` to next.config.ts
- This is required for static exports

### CORS Errors?

- Check `ALLOWED_ORIGINS` in Railway includes your Cloudflare URL
- Make sure it's JSON array format: `["https://..."]`
- Include both main URL and preview URLs

### Videos Not Loading?

- Check browser console for CORS errors
- Verify `NEXT_PUBLIC_API_URL` is set in Cloudflare
- Make sure Railway backend is running

---

## 📊 Deployment Status

After deployment, you can monitor:

### Railway:
- **Logs**: Real-time backend logs
- **Metrics**: CPU, memory, bandwidth
- **Deployments**: History and rollbacks

### Cloudflare Pages:
- **Analytics**: Page views, performance
- **Logs**: Build and function logs
- **Deployments**: Git commits linked to deploys

---

## 🔄 Auto-Deploy Setup

Both platforms support automatic deployment:

- **Railway**: Auto-deploys on push to `main` branch
- **Cloudflare Pages**: Auto-deploys on push to `main` branch

Every `git push` will trigger both deployments! 🚀

---

## 💰 Cost Breakdown

### Railway:
- **Free**: $5/month credit (enough for hobby projects)
- **Pro**: $20/month (if you need more)

### Cloudflare Pages:
- **Free**: 500 builds/month, unlimited requests
- **Paid**: $20/month for 5,000 builds/month

**Total for hobby project**: $0/month! 🎉

---

## 🎊 Your Live URLs

After deployment:

- **Frontend**: https://scholarphile.pages.dev
- **Backend**: https://scholarphile-production.up.railway.app
- **API Docs**: https://scholarphile-production.up.railway.app/api/v1/docs

---

## 🚀 Next Steps

1. **Custom Domain**: Add `scholarphile.com` to Cloudflare Pages
2. **Analytics**: Enable Cloudflare Web Analytics
3. **Monitoring**: Set up Railway alerts
4. **CDN**: Already enabled via Cloudflare!
5. **SEO**: Add meta tags and sitemap

---

**Ready to deploy?** Follow the steps above and you'll be live in 10 minutes! 🚀

