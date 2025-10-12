# 🚀 Deploy Scholarphile NOW - Quick Guide

Your code is ready and pushed to GitHub! Follow these steps:

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
ALLOWED_ORIGINS=["https://scholarphile.vercel.app"]
API_V1_PREFIX=/api/v1
PROJECT_NAME=Scholarphile
VERSION=1.0.0
DEBUG=false
LOG_LEVEL=INFO
```

**Important**: Replace `your_actual_youtube_api_key_here` with your real key!

### Get Your Backend URL:

- Click **"Settings"** → **"Domains"**
- Copy the Railway URL (e.g., `scholarphile-production-xxxx.up.railway.app`)
- ✅ Backend deployed!

---

## 🔵 Step 2: Deploy Frontend to Vercel (5 minutes)

### Go to: https://vercel.com

1. **Sign up/Login** with GitHub
2. Click **"New Project"**
3. Click **"Import"** next to `Scholarphile/scholarphile`
4. **Root Directory**: Change to `frontend`
5. **Framework Preset**: Next.js (auto-detected)

### Add Environment Variable:

Under **"Environment Variables"**:

```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api/v1
```

Replace with your actual Railway URL from Step 1!

6. Click **"Deploy"**
7. Wait 2-3 minutes...
8. ✅ Frontend deployed!

### Get Your Frontend URL:

- Copy the Vercel URL (e.g., `scholarphile.vercel.app`)

---

## 🔄 Step 3: Update Backend CORS

### Go back to Railway:

1. Open your Scholarphile project
2. Go to **"Variables"**
3. Find `ALLOWED_ORIGINS`
4. Change to:
```
["https://scholarphile.vercel.app","https://scholarphile-xxxx.vercel.app"]
```

Use your actual Vercel URL(s)!

5. Click **"Save"**
6. Railway will automatically redeploy

---

## ✅ Step 4: Test Your Live Site!

1. **Open your Vercel URL**: `https://scholarphile.vercel.app`
2. Try searching for "calculus"
3. Try the curate page
4. Watch a video
5. Check API docs: `https://your-railway-url.up.railway.app/api/v1/docs`

---

## 🎯 That's It! You're Live! 🎉

Your production site is now online at:
- **Frontend**: https://scholarphile.vercel.app
- **Backend**: https://your-name.up.railway.app

---

## 💡 Next Steps (Optional)

### Custom Domain:
- **Vercel**: Settings → Domains → Add `scholarphile.com`
- **Railway**: Settings → Domains → Add `api.scholarphile.com`

### Monitoring:
- Railway dashboard shows logs and metrics
- Vercel dashboard shows analytics

### Auto-Deploy:
- Already set up! Every `git push` auto-deploys 🚀

---

## 🐛 Troubleshooting

**"Failed to fetch" errors?**
- Check `NEXT_PUBLIC_API_URL` in Vercel is correct
- Check `ALLOWED_ORIGINS` in Railway includes Vercel URL
- Make sure backend is running (check Railway logs)

**Backend won't start?**
- Check Railway logs for errors
- Make sure `YOUTUBE_API_KEY` is set
- Verify all env variables are present

**No videos showing?**
- Check YouTube API quota (10,000 units/day)
- Verify API key is valid and not restricted
- Check browser console for errors

---

## 📞 Need Help?

- **Railway logs**: Click project → "Deployments" → Click latest → "View logs"
- **Vercel logs**: Click deployment → "Logs" tab

---

**You're ready to go live! 🚀**


