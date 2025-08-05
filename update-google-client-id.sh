#!/bin/bash

# Script to update Google OAuth Client ID in HTML files
echo "🔧 Google OAuth Client ID Update Script"
echo "======================================"
echo ""

# Check if client ID is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Google OAuth Client ID"
    echo ""
    echo "Usage: ./update-google-client-id.sh YOUR_CLIENT_ID"
    echo ""
    echo "Example: ./update-google-client-id.sh 123456789-abcdefghijklmnop.apps.googleusercontent.com"
    echo ""
    echo "To get your Client ID:"
    echo "1. Go to https://console.cloud.google.com/"
    echo "2. Create OAuth 2.0 credentials"
    echo "3. Copy the Client ID"
    exit 1
fi

CLIENT_ID="$1"

echo "✅ Updating Google OAuth Client ID: $CLIENT_ID"
echo ""

# Update index.html
echo "📝 Updating index.html..."
sed -i '' "s/REPLACE_WITH_YOUR_ACTUAL_CLIENT_ID/$CLIENT_ID/g" index.html
echo "✅ Updated index.html"

# Update signin.html
echo "📝 Updating signin.html..."
sed -i '' "s/REPLACE_WITH_YOUR_ACTUAL_CLIENT_ID/$CLIENT_ID/g" signin.html
echo "✅ Updated signin.html"

echo ""
echo "🎉 Success! Your Google OAuth Client ID has been updated."
echo ""
echo "Next steps:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'Update Google OAuth Client ID'"
echo "   git push origin main"
echo ""
echo "2. Deploy to your site:"
echo "   npx wrangler pages deploy . --project-name scholarphile"
echo ""
echo "3. Test Google Sign-In on your live site!" 