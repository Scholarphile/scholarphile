# Scholarphile Frontend Routing

This document describes the routing structure for the Scholarphile frontend application.

## Overview

The frontend has been restructured to use separate HTML files for each page, providing clean URLs and better user experience.

## Page Structure

### Main Pages

1. **`index.html`** - MyNotes (Home page)
   - URL: `/` or `/index.html`
   - Description: Main dashboard showing user's documents and recent uploads

2. **`discover.html`** - Discover
   - URL: `/discover.html`
   - Description: Search and browse all documents shared by the community

3. **`upload.html`** - Upload
   - URL: `/upload.html`
   - Description: Upload new documents to the platform

4. **`signin.html`** - Sign In
   - URL: `/signin.html`
   - Description: User authentication page

5. **`profile.html`** - Profile
   - URL: `/profile.html`
   - Description: User profile and account settings

### Additional Pages

6. **`cards.html`** - Flashcard Space
   - URL: `/cards.html`
   - Description: Create and study flashcards (separate feature)

## Navigation

All pages share a consistent navigation header with the following tabs:
- **MyNotes** - Links to `index.html`
- **Discover** - Links to `discover.html`
- **Upload** - Links to `upload.html`
- **Sign In/Profile** - Links to `signin.html` or `profile.html` based on auth state

## URL Structure

```
/                    → index.html (MyNotes)
/discover.html       → discover.html (Discover)
/upload.html         → upload.html (Upload)
/signin.html         → signin.html (Sign In)
/profile.html        → profile.html (Profile)
/cards.html          → cards.html (Flashcards)
```

## Benefits of This Structure

1. **Clean URLs**: Each page has its own URL in the address bar
2. **SEO Friendly**: Search engines can index individual pages
3. **Bookmarkable**: Users can bookmark specific pages
4. **Browser History**: Back/forward buttons work correctly
5. **Separate Concerns**: Each page is independent and focused
6. **Better Performance**: Only loads the content needed for each page

## Implementation Details

### Navigation
- Uses `onclick="window.location.href='page.html'"` for navigation
- Active tab is highlighted based on current page
- Consistent styling across all pages

### Styling
- Shared CSS variables for consistent theming
- Responsive design for mobile and desktop
- Dark theme with modern UI elements

### JavaScript
- Each page has its own focused JavaScript
- No complex routing logic needed
- Simple and maintainable code structure

## Future Enhancements

1. **Server-side Routing**: Could be implemented with a web server for even cleaner URLs
2. **SPA Conversion**: Could be converted to a Single Page Application with client-side routing
3. **Dynamic Content**: API integration for real data instead of static content
4. **Authentication**: Proper user authentication and session management

## File Organization

```
permates/
├── index.html          # MyNotes page
├── discover.html       # Discover page
├── upload.html         # Upload page
├── signin.html         # Sign In page
├── profile.html        # Profile page
├── cards.html          # Flashcard page
├── favicon.svg         # App icon
├── favicon.png         # App icon (PNG)
├── BACKEND_README.md   # Backend documentation
├── ROUTING_README.md   # This file
└── src/
    └── index.js        # Backend worker
```

## Deployment

The frontend can be deployed to any static hosting service:
- **Cloudflare Pages**
- **Netlify**
- **Vercel**
- **GitHub Pages**

All pages are self-contained and don't require server-side rendering. 