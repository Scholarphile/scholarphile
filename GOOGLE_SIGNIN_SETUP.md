# Google Sign-In Setup Guide

This guide explains how to set up Google OAuth for the Scholarphile application.

## Prerequisites

1. A Google Cloud Console account
2. A web application that can serve HTTPS (required for OAuth)

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "Scholarphile"
   - User support email: Your email
   - Developer contact information: Your email
4. Add the following scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users if needed
6. Save and continue

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000/signin.html` (for development)
   - `https://yourdomain.com/signin.html` (for production)
6. Click "Create"
7. Copy the Client ID

## Step 4: Update the Application

1. Open `signin.html`
2. Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID in two places:
   - Line ~380: In the `google.accounts.id.initialize()` call
   - Line ~390: In the `data-client_id` attribute

```javascript
// Example:
google.accounts.id.initialize({
    client_id: '123456789-abcdefghijklmnop.apps.googleusercontent.com',
    callback: handleCredentialResponse
});
```

```html
<!-- Example: -->
<div id="g_id_onload"
     data-client_id="123456789-abcdefghijklmnop.apps.googleusercontent.com"
     data-context="signin"
     data-ux_mode="popup"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false">
</div>
```

## Step 5: Test the Integration

1. Open your application in a web browser
2. Navigate to the sign-in page
3. Click "Continue with Google"
4. You should see the Google sign-in popup
5. After signing in, you should be redirected to the profile page

## Security Considerations

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **Client ID Security**: The client ID is public, but keep it secure
3. **Token Validation**: In production, validate tokens on the server side
4. **Error Handling**: Implement proper error handling for failed sign-ins

## Troubleshooting

### Common Issues

1. **"Invalid Client" Error**
   - Check that your Client ID is correct
   - Ensure the domain is authorized in Google Cloud Console

2. **"Redirect URI Mismatch" Error**
   - Add your domain to authorized redirect URIs
   - Check for trailing slashes or protocol mismatches

3. **"Pop-up Blocked" Error**
   - Ensure pop-ups are allowed for your domain
   - Check browser settings

4. **"Not Displayed" Error**
   - Check browser console for specific error messages
   - Verify that the Google Sign-In script is loaded

### Debug Mode

To enable debug mode, add this to your HTML:

```html
<script>
    window.googleSignInDebug = true;
</script>
```

## Production Deployment

1. Update authorized origins and redirect URIs with your production domain
2. Ensure HTTPS is enabled
3. Test the sign-in flow thoroughly
4. Monitor for any authentication errors

## Additional Features

The current implementation includes:
- Automatic user profile population
- Session persistence using localStorage
- Sign-out functionality
- Profile page integration

For production use, consider adding:
- Server-side token validation
- Refresh token handling
- Account linking with existing users
- Multi-provider authentication (Google + GitHub + Email) 