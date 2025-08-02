# Fix Google Sign-In Error

## The Problem
You're getting "Error 401: invalid_client" because:
1. You're using placeholder `YOUR_GOOGLE_CLIENT_ID` instead of a real Google Client ID
2. Your Google Cloud Console isn't configured properly

## Quick Fix Steps

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://scholarphile.com` (for production)
7. Click "Create"
8. Copy the Client ID

### 2. Update Your Code
Replace `YOUR_GOOGLE_CLIENT_ID` in `signin.html` line 386 with your real Client ID:

```html
data-client_id="123456789-abcdefghijklmnop.apps.googleusercontent.com"
```

### 3. Test
- The error should disappear
- You'll have only ONE Google Sign-In button (the official one)
- No more duplicate sign-in options

## What I Fixed
- ✅ Removed duplicate custom Google Sign-In button
- ✅ Removed conflicting JavaScript code
- ✅ Cleaned up CSS for unused button
- ✅ Now using only Google's official Sign-In widget

## Next Steps
1. Get your real Google Client ID
2. Replace the placeholder in the code
3. Test the sign-in flow
4. Deploy the changes

The sign-in page will now have a clean, single Google Sign-In option without the confusing duplicate buttons! 