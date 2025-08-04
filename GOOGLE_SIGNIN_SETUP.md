# Google Sign-In Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `https://scholarphile.com`
     - `https://www.scholarphile.com`
     - `https://*.scholarphile.pages.dev` (for development)
   - Add authorized redirect URIs:
     - `https://scholarphile.com`
     - `https://www.scholarphile.com`
5. Copy your Client ID

## Step 2: Update Your Code

Replace `YOUR_GOOGLE_CLIENT_ID` in these files with your actual Client ID:

- `index.html` (line with `data-client_id="YOUR_GOOGLE_CLIENT_ID"`)
- `signin.html` (line with `data-client_id="YOUR_GOOGLE_CLIENT_ID"`)

## Step 3: Test the Implementation

1. Deploy your changes
2. Visit your site
3. Click "Sign In with Google"
4. Complete the OAuth flow
5. Check that user info is stored in localStorage

## Security Notes

- Never commit your Client ID to public repositories
- Use environment variables in production
- Consider implementing server-side token verification
- Add proper error handling for failed sign-ins

## Features Implemented

✅ Google Sign-In button with proper styling
✅ JWT token decoding to extract user information
✅ User data storage in localStorage
✅ Profile page updates with user info
✅ Success notifications
✅ Automatic redirect to profile page

## Next Steps

1. Get your Google OAuth Client ID
2. Replace the placeholder in the code
3. Test the sign-in flow
4. Deploy to production 