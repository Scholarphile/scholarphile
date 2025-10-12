# 🚀 Deploy Scholarphile - Google Cloud + Cloudflare Pages

The best deployment stack: **Google Cloud Run** (backend) + **Cloudflare Pages** (frontend)

---

## 🔴 Part 1: Deploy Backend to Google Cloud Run (5 minutes)

### Prerequisites:
- Google Cloud account (free $300 credit for new users)
- gcloud CLI installed

### Step 1: Install gcloud CLI (if not installed)

**macOS:**
```bash
brew install google-cloud-sdk
```

**Or download from:** https://cloud.google.com/sdk/docs/install

### Step 2: Login and Setup

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create scholarphile-prod --name="Scholarphile"

# Set the project
gcloud config set project scholarphile-prod

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 3: Build and Deploy

```bash
cd /Users/georgematali/permates/scholarphile

# Build the Docker image
gcloud builds submit --tag gcr.io/scholarphile-prod/scholarphile-api

# Deploy to Cloud Run
gcloud run deploy scholarphile-api \
  --image gcr.io/scholarphile-prod/scholarphile-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "YOUTUBE_API_KEY=your_youtube_api_key,SECRET_KEY=your_secret_key,ALLOWED_ORIGINS=[\"https://scholarphile.pages.dev\"],DEBUG=false,LOG_LEVEL=INFO,API_V1_PREFIX=/api/v1,PROJECT_NAME=Scholarphile,VERSION=1.0.0"
```

**Replace:**
- `your_youtube_api_key` with your actual YouTube API key
- `your_secret_key` with a random 32-character string

### Step 4: Get Your Backend URL

After deployment completes, you'll see:
```
Service URL: https://scholarphile-api-xxxxx-uc.a.run.app
```

Copy this URL! ✅

---

## 🟠 Part 2: Deploy Frontend to Cloudflare Pages (5 minutes)

### Go to: https://dash.cloudflare.com

### Step 1: Create Pages Project

1. Click **"Workers & Pages"** in sidebar
2. Click **"Create application"**
3. Click **"Pages"** tab
4. Click **"Connect to Git"**

### Step 2: Connect GitHub

5. Authorize Cloudflare
6. Select repository: **`Scholarphile/scholarphile`**
7. Click **"Begin setup"**

### Step 3: Configure Build

**Project name:** `scholarphile`

**Production branch:** `main`

**Framework preset:** `Next.js`

**Build command:**
```
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/out
```

**Root directory:** Leave as `/`

### Step 4: Environment Variables

Click **"Add variable"** and add:

```
NEXT_PUBLIC_API_URL=https://scholarphile-api-xxxxx-uc.a.run.app/api/v1
NODE_VERSION=18
```

**Replace** with your actual Google Cloud Run URL from Part 1!

### Step 5: Deploy!

8. Click **"Save and Deploy"**
9. Wait 2-3 minutes...
10. ✅ Done!

You'll get: `https://scholarphile.pages.dev`

---

## 🔄 Part 3: Update Backend CORS

Now that you have your Cloudflare Pages URL, update the backend:

```bash
gcloud run services update scholarphile-api \
  --region us-central1 \
  --set-env-vars "ALLOWED_ORIGINS=[\"https://scholarphile.pages.dev\",\"https://scholarphile.com\"]"
```

Add your actual Cloudflare URL and any custom domains!

---

## ✅ Test Your Deployment

1. **Backend Health:** https://scholarphile-api-xxxxx-uc.a.run.app/health
2. **API Docs:** https://scholarphile-api-xxxxx-uc.a.run.app/api/v1/docs
3. **Frontend:** https://scholarphile.pages.dev
4. **Try searching** for "calculus"
5. **Try curation** page

---

## 💰 Costs

### Google Cloud Run:
- **Free tier**: 2 million requests/month
- **After free tier**: ~$0.00004 per request
- **Your cost**: Likely $0-5/month for hobby project

### Cloudflare Pages:
- **Free tier**: 500 builds/month, unlimited requests
- **Your cost**: $0/month

**Total: $0-5/month** 🎉

---

## 🚀 Auto-Deploy Setup

### Google Cloud Build Triggers:

1. Go to: https://console.cloud.google.com/cloud-build/triggers
2. Click **"Create Trigger"**
3. Configure:
   - **Name:** `scholarphile-auto-deploy`
   - **Event:** Push to branch
   - **Source:** Connect your GitHub repo
   - **Branch:** `^main$`
   - **Configuration:** Cloud Build configuration file
   - **Location:** `cloudbuild.yaml`
4. Click **"Create"**

Now every `git push` auto-deploys the backend! 🎊

### Cloudflare Pages:
Already set up! Auto-deploys on every push to `main`.

---

## 🔧 Environment Variables Management

### To update backend env vars:

```bash
gcloud run services update scholarphile-api \
  --region us-central1 \
  --update-env-vars "KEY=value"
```

### To view current env vars:

```bash
gcloud run services describe scholarphile-api \
  --region us-central1 \
  --format="value(spec.template.spec.containers[0].env)"
```

---

## 📊 Monitoring

### Google Cloud Console:
- **Logs:** https://console.cloud.google.com/logs
- **Metrics:** CPU, memory, request count
- **Errors:** Automatic error reporting

### Cloudflare Dashboard:
- **Analytics:** Page views, bandwidth
- **Build logs:** Deployment history
- **Performance:** Core Web Vitals

---

## 🌐 Custom Domain (Optional)

### Backend (Google Cloud Run):

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service scholarphile-api \
  --domain api.scholarphile.com \
  --region us-central1
```

Follow DNS instructions provided.

### Frontend (Cloudflare Pages):

1. Go to your project → **"Custom domains"**
2. Click **"Set up a domain"**
3. Enter: `scholarphile.com`
4. DNS auto-configured if domain is on Cloudflare!

---

## 🐛 Troubleshooting

### Backend Issues:

**View logs:**
```bash
gcloud run logs read scholarphile-api --region us-central1
```

**Common issues:**
- **"Module not found"**: Check requirements.txt
- **"PORT not set"**: Cloud Run sets $PORT automatically
- **CORS errors**: Update ALLOWED_ORIGINS env var

### Frontend Issues:

**Build fails:**
- Check build logs in Cloudflare dashboard
- Verify `next.config.ts` has `output: 'export'`
- Ensure `NODE_VERSION=18` is set

**API not connecting:**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend CORS settings
- Open browser console for errors

---

## 🎯 Quick Commands Reference

```bash
# Deploy backend
gcloud builds submit --tag gcr.io/scholarphile-prod/scholarphile-api
gcloud run deploy scholarphile-api --image gcr.io/scholarphile-prod/scholarphile-api

# View logs
gcloud run logs read scholarphile-api --limit 50

# Update env vars
gcloud run services update scholarphile-api --update-env-vars "KEY=value"

# View service details
gcloud run services describe scholarphile-api

# Delete service (if needed)
gcloud run services delete scholarphile-api
```

---

## ✨ Why This Stack?

✅ **Google Cloud Run:**
- Scales to zero (no cost when idle)
- Auto-scales with traffic
- Fully managed (no servers)
- Great for Docker/FastAPI

✅ **Cloudflare Pages:**
- Global CDN
- Unlimited bandwidth
- Edge computing
- Free SSL

**Perfect combo for modern web apps!** 🚀

---

**Ready to deploy?** Follow the steps above and you'll be live in 10 minutes!


