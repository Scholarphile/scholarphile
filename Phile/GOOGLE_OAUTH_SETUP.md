# 🔐 Google OAuth Setup for ScholarPhile

This guide will help you set up Google OAuth authentication for the ScholarPhile platform.

## 📋 Prerequisites

- Google Cloud Console account
- ScholarPhile project repository
- Domain (scholarphile.com)

## 🚀 Step 1: Google Cloud Console Setup

### 1.1 Create a New Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Name: `ScholarPhile Auth`
4. Click **"Create"**

### 1.2 Enable Google+ API
1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click **"Enable"**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Configure the consent screen if prompted

### 1.4 Configure OAuth Consent Screen
1. **App name**: `ScholarPhile`
2. **User support email**: `support@scholarphile.com`
3. **Developer contact information**: `support@scholarphile.com`
4. **Scopes**: Add `email`, `profile`, `openid`
5. **Test users**: Add your email for testing

### 1.5 Create OAuth Client ID
1. **Application type**: `Web application`
2. **Name**: `ScholarPhile Web Client`
3. **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://scholarphile.com` (production)
   - `https://www.scholarphile.com` (production)
4. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://scholarphile.com/api/auth/callback/google` (production)
   - `https://www.scholarphile.com/api/auth/callback/google` (production)

## 🔧 Step 2: Environment Configuration

### 2.1 Create Environment File
Copy `env.example` to `.env.local` and fill in your values:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=https://scholarphile.com
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2.2 Generate NEXTAUTH_SECRET
Generate a secure secret key:

```bash
openssl rand -base64 32
```

Or use an online generator and save it securely.

## 🌐 Step 3: Production Deployment

### 3.1 Cloudflare Pages Environment Variables
1. Go to your Cloudflare Pages project
2. Navigate to **"Settings"** → **"Environment variables"**
3. Add these variables for production:

```
NEXTAUTH_URL = https://scholarphile.com
NEXTAUTH_SECRET = your-generated-secret
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
```

### 3.2 Update Google OAuth Redirect URIs
After deployment, add your production callback URL to Google OAuth:
- `https://scholarphile.com/api/auth/callback/google`

## 🧪 Step 4: Testing

### 4.1 Local Testing
1. Start development server: `npm run dev`
2. Visit `http://localhost:3000/auth/signin`
3. Test Google sign-in flow

### 4.2 Production Testing
1. Deploy to Cloudflare Pages
2. Test sign-in at `https://scholarphile.com/auth/signin`
3. Verify redirect and callback work correctly

## 🔒 Step 5: Security Considerations

### 5.1 Environment Variables
- Never commit `.env.local` to version control
- Use strong, unique secrets for production
- Rotate secrets periodically

### 5.2 OAuth Scopes
- Only request necessary scopes (`email`, `profile`, `openid`)
- Don't request unnecessary permissions

### 5.3 HTTPS
- Always use HTTPS in production
- Google OAuth requires secure connections

## 🚨 Troubleshooting

### Common Issues

#### "Invalid redirect URI"
- Check that your redirect URI exactly matches Google OAuth settings
- Ensure protocol (http/https) and domain match exactly

#### "OAuth consent screen not configured"
- Complete the OAuth consent screen setup
- Add test users if in testing mode

#### "Invalid client ID"
- Verify your Google OAuth client ID and secret
- Check that the API is enabled

#### "Redirect URI mismatch"
- Ensure all redirect URIs are added to Google OAuth
- Check for typos in domain names

### Debug Mode
Enable NextAuth debug mode in development:

```typescript
// app/api/auth/[...nextauth]/route.ts
const handler = NextAuth({
  debug: true, // Add this line
  // ... rest of config
})
```

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Google Cloud Console logs
3. Check Cloudflare Pages build logs
4. Contact support at `support@scholarphile.com`

---

**Note**: Keep your OAuth credentials secure and never expose them in client-side code or public repositories.
