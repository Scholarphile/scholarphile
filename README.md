# Scholarphile - Modern Learning Platform

A beautiful, modern learning platform featuring note sharing and interactive flashcards.

## 🚀 Features

- **Modern Landing Page**: Professional design for Scholarphile platform
- **Interactive Flashcards**: Create, study, and manage flashcards
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works perfectly on all devices
- **Real-time Updates**: Automatic deployment via GitHub Actions

## 📁 Project Structure

```
permates/
├── index.html          # Main landing page
├── cards.html          # Flashcard application
├── .github/workflows/  # GitHub Actions
├── package.json        # Project configuration
└── README.md          # This file
```

## 🛠️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/permates.git
   cd permates
   ```

2. **Start local server**:
   ```bash
   # Using Python (recommended)
   python -m http.server 8000
   
   # Or using Node.js
   npm start
   ```

3. **Open in browser**:
   - Main site: http://localhost:8000
   - Flashcards: http://localhost:8000/cards.html

## 🌐 Automatic Deployment

This project is set up for automatic deployment to GitHub Pages. Here's how it works:

### Setup GitHub Pages

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose "gh-pages" branch
   - Click "Save"

2. **Push your changes**:
   ```bash
   git add .
   git commit -m "Update site design"
   git push origin main
   ```

3. **Automatic deployment**:
   - GitHub Actions will automatically build and deploy your site
   - Your site will be available at: `https://yourusername.github.io/permates`

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Create gh-pages branch**:
   ```bash
   git checkout -b gh-pages
   git push origin gh-pages
   ```

2. **Update GitHub Pages settings** to use the gh-pages branch

## 🔧 Customization

### Changing Colors
Edit the CSS variables in both HTML files:
```css
:root {
    --primary: #6366f1;        /* Main brand color */
    --secondary: #06b6d4;      /* Secondary color */
    --accent: #f59e0b;         /* Accent color */
}
```

### Adding New Pages
1. Create new HTML files
2. Follow the same structure as existing files
3. Include the same CSS variables and theme toggle
4. Push to trigger automatic deployment

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Push and create a pull request

## 📄 License

MIT License - feel free to use this project for your own learning platform!

## 🆘 Support

If you need help:
1. Check the GitHub Issues
2. Create a new issue with details
3. Include browser and device information

---

**Made with ❤️ for better learning** # Updated Sat Jul 26 18:24:22 EDT 2025
