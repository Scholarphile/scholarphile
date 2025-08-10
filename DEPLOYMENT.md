# 🚀 ScholarPhile Deployment Guide

## Cloudflare Pages + Namecheap Domain Setup

### 📋 Prerequisites
- ✅ GitHub repository connected
- ✅ Cloudflare account
- ✅ Namecheap domain (scholarphile.com)
- ✅ Domain added to Cloudflare

---

## 🌐 **Step 1: Cloudflare Pages Deployment**

### 1.1 Create Cloudflare Pages Project
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Choose **"Connect to Git"**
4. Select GitHub → `Scholarphile/scholarphile`

### 1.2 Build Configuration
- **Project name**: `scholarphile`
- **Production branch**: `main`
- **Framework preset**: `Next.js`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/` (leave empty)

### 1.3 Environment Variables
```
NODE_VERSION = 18
NPM_FLAGS = --legacy-peer-deps
```

---

## 🔧 **Step 2: Domain Configuration**

### 2.1 Cloudflare DNS Setup
1. In Cloudflare, go to your domain's **DNS** settings
2. Add these records:

**For www subdomain:**
```
Type: CNAME
Name: www
Target: your-project.pages.dev
Proxy: Proxied (orange cloud)
TTL: Auto
```

**For root domain:**
```
Type: CNAME
Name: @
Target: your-project.pages.dev
Proxy: Proxied (orange cloud)
TTL: Auto
```

### 2.2 Namecheap DNS Setup
1. Log into [Namecheap](https://namecheap.com)
2. Go to **Domain List** → **Manage** your domain
3. Navigate to **Advanced DNS** tab
4. Add these records:

**CNAME Records:**
```
Host: www
Value: your-project.pages.dev
TTL: Automatic
```

```
Host: @
Value: your-project.pages.dev
TTL: Automatic
```

---

## ⚙️ **Step 3: Cloudflare Pages Settings**

### 3.1 Custom Domain
1. In your Pages project, go to **Custom domains**
2. Add domain: `scholarphile.com`
3. Add subdomain: `www.scholarphile.com`

### 3.2 Build & Deploy Settings
- **Auto-deploy from Git**: ✅ Enabled
- **Preview deployments**: ✅ Enabled
- **Branch deployments**: ✅ Enabled

### 3.3 Functions (Optional)
- **Functions**: Disabled (for static deployment)
- **Edge functions**: Disabled

---

## 🔄 **Step 4: Continuous Deployment**

### 4.1 Automatic Deployments
- Every push to `main` branch triggers deployment
- Preview deployments for pull requests
- Build logs available in Cloudflare dashboard

### 4.2 Manual Deployments
```bash
# Trigger manual deployment
# Go to Cloudflare Pages → Deployments → Create deployment
```

---

## 🧪 **Step 5: Testing Your Deployment**

### 5.1 Check Build Status
1. Go to Cloudflare Pages dashboard
2. Monitor build progress
3. Check build logs for any errors

### 5.2 Test Your Site
- **Production**: `https://scholarphile.com`
- **Preview**: `https://your-project.pages.dev`

---

## 🚨 **Troubleshooting**

### Common Issues & Solutions

#### Build Failures
```bash
# Check build logs in Cloudflare dashboard
# Verify Node.js version (should be 18+)
# Check package.json dependencies
```

#### Domain Not Working
1. Verify DNS propagation (can take 24-48 hours)
2. Check Cloudflare proxy status
3. Verify CNAME records in both Cloudflare and Namecheap

#### Performance Issues
1. Enable Cloudflare's CDN
2. Check image optimization settings
3. Verify static asset caching

---

## 📱 **Mobile & SEO Optimization**

### Mobile Testing
- Test on various devices
- Check responsive design
- Verify touch interactions

### SEO Setup
- Meta tags configured in `app/layout.tsx`
- Open Graph tags for social sharing
- Structured data (optional)

---

## 🔒 **Security & Performance**

### Security Headers
Cloudflare automatically provides:
- HTTPS enforcement
- DDoS protection
- WAF (Web Application Firewall)

### Performance Features
- Global CDN
- Edge caching
- Image optimization
- Minification

---

## 📊 **Monitoring & Analytics**

### Cloudflare Analytics
- Page views
- Performance metrics
- Security events
- Real-time monitoring

### Custom Analytics (Optional)
- Google Analytics
- Plausible Analytics
- Fathom Analytics

---

## 🎯 **Next Steps After Deployment**

1. **Test thoroughly** on different devices
2. **Set up monitoring** and alerts
3. **Configure backups** and version control
4. **Plan scaling** strategy
5. **Set up staging** environment

---

## 📞 **Support Resources**

- **Cloudflare Support**: [support.cloudflare.com](https://support.cloudflare.com)
- **Namecheap Support**: [support.namecheap.com](https://support.namecheap.com)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project Issues**: [GitHub Issues](https://github.com/Scholarphile/scholarphile/issues)

---

**🎉 Congratulations! Your ScholarPhile platform will be live at scholarphile.com**

*Last updated: $(date)*
