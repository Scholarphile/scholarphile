# 🚀 Scholarphile Deployment Guide

Complete guide to deploy your Scholarphile platform to production.

---

## 📋 Prerequisites

- GitHub account
- YouTube API key
- Credit card (for Railway/Vercel - free tiers available)

---

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare for Deployment

✅ Already done:
- `railway.json` configured
- `Procfile` created
- Requirements specified
- Docker support

### Step 2: Deploy to Railway

**Option A: Via Railway CLI**

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize project:
```bash
cd /Users/georgematali/permates/scholarphile
railway init
```

4. Add environment variables:
```bash
railway variables set YOUTUBE_API_KEY=your_key_here
railway variables set SECRET_KEY=$(openssl rand -hex 32)
railway variables set DATABASE_URL='sqlite:///./scholarphile.db'
railway variables set ALLOWED_ORIGINS='["https://your-frontend.vercel.app"]'
```

5. Deploy:
```bash
railway up
```

**Option B: Via Railway Dashboard** (Easier)

1. Go to: https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account
4. Select the `scholarphile` repository
5. Railway will auto-detect it's a Python app
6. Go to "Variables" tab and add:
   ```
   YOUTUBE_API_KEY=your_key_here
   SECRET_KEY=generate-random-32-char-string
   DATABASE_URL=sqlite:///./scholarphile.db
   REDIS_URL=redis://localhost:6379/0
   ALLOWED_ORIGINS=["https://scholarphile.vercel.app"]
   LOG_LEVEL=INFO
   DEBUG=false
   ```
7. Click "Deploy"
8. Get your backend URL (e.g., `https://scholarphile-production.up.railway.app`)

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update API URL

Update `/Users/georgematali/permates/scholarphile/frontend/.env`:
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1
```

### Step 2: Deploy to Vercel

**Option A: Via Vercel CLI**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
cd /Users/georgematali/permates/scholarphile/frontend
vercel
```

4. Follow prompts:
   - Set up and deploy? `Y`
   - Which scope? (your account)
   - Link to existing project? `N`
   - Project name: `scholarphile`
   - Directory: `./`
   - Override settings? `N`

5. Set environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL
# Paste your Railway backend URL + /api/v1
```

6. Deploy to production:
```bash
vercel --prod
```

**Option B: Via Vercel Dashboard** (Easiest)

1. Go to: https://vercel.com
2. Click "New Project"
3. Import from GitHub → Select `scholarphile` repo
4. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app/api/v1`
5. Click "Deploy"
6. Get your frontend URL (e.g., `https://scholarphile.vercel.app`)

### Step 3: Update Backend CORS

Go back to Railway and update `ALLOWED_ORIGINS`:
```bash
railway variables set ALLOWED_ORIGINS='["https://scholarphile.vercel.app"]'
```

Or in Railway dashboard, update the variable to include your Vercel URL.

---

## 🔐 Production Checklist

### Backend
- [ ] YouTube API key added
- [ ] SECRET_KEY is random and secure (32+ characters)
- [ ] ALLOWED_ORIGINS includes your frontend URL
- [ ] DEBUG=false
- [ ] Health check working: `https://your-backend.railway.app/health`
- [ ] API docs working: `https://your-backend.railway.app/api/v1/docs`

### Frontend
- [ ] NEXT_PUBLIC_API_URL points to Railway backend
- [ ] Site loads: `https://your-frontend.vercel.app`
- [ ] Search works
- [ ] Curate works
- [ ] Videos play

### YouTube API (Production Key)
- [ ] Created separate production API key
- [ ] Restricted to Railway server IP
- [ ] API restrictions set to YouTube Data API v3 only

---

## 🎯 Quick Deploy Commands

**If you have GitHub repo set up:**

```bash
# Push to GitHub
cd /Users/georgematali/permates/scholarphile
git add .
git commit -m "Production ready"
git push origin main

# Then deploy via Railway & Vercel dashboards
```

---

## 🐛 Troubleshooting

### Backend Issues

**"Module not found" error:**
```bash
# Make sure all dependencies are in requirements.txt
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
```

**CORS errors:**
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Make sure it's JSON array format: `["https://..."]`

**Database errors:**
- Railway provides PostgreSQL for free
- Update DATABASE_URL if needed

### Frontend Issues

**"Failed to fetch" errors:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Make sure backend is running
- Check backend CORS settings

**Environment variable not working:**
- Redeploy after adding env vars
- Variables must start with `NEXT_PUBLIC_` for client-side

---

## 📊 Monitoring

### Railway
- View logs in Railway dashboard
- Monitor CPU/memory usage
- Set up uptime monitoring

### Vercel
- View deployment logs
- Analytics built-in
- Error tracking available

---

## 💰 Costs

### Railway
- **Free Tier**: $5/month credit (enough for small apps)
- **Hobby**: $5/month per service
- **Pro**: Pay as you go

### Vercel
- **Hobby**: Free for personal projects
- **Pro**: $20/month per user (commercial)

---

## 🔄 CI/CD (Auto Deploy)

Once connected to GitHub:
- **Railway**: Auto-deploys on push to main
- **Vercel**: Auto-deploys on push to main

Every `git push` automatically deploys! 🚀

---

## 📝 Custom Domain (Optional)

### Backend (Railway)
1. Go to Settings → Domains
2. Add custom domain (e.g., `api.scholarphile.com`)
3. Update DNS records as shown

### Frontend (Vercel)
1. Go to Settings → Domains
2. Add custom domain (e.g., `scholarphile.com`)
3. Update DNS records as shown

---

## ✅ Post-Deployment

1. Test all features in production
2. Monitor error logs
3. Set up analytics (optional)
4. Share with users! 🎉

---

**Need help?** Check the logs in Railway/Vercel dashboards or let me know!

