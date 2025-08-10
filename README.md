<<<<<<< HEAD
# ScholarPhile 🎓

A sleek, minimal document sharing community platform designed specifically for college students. ScholarPhile enables students to share academic documents, collaborate on projects, and build meaningful connections within their academic community.

## ✨ Features

- **Document Sharing**: Upload and share academic materials (PDFs, Word docs, presentations)
- **Smart Search**: Intelligent search system with subject-based categorization
- **Student Community**: Connect with peers from your university and beyond
- **Academic Integrity**: Built-in plagiarism detection and citation tools
- **Mobile-First**: Responsive design that works on all devices
- **Dark Theme**: Sleek, modern interface with a dark background

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Custom component library
- **Development**: ESLint, PostCSS, Autoprefixer

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/scholarphile/scholarphile.git
cd scholarphile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
scholarphile/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── sections/          # Page sections
├── public/                 # Static assets
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Background**: Deep dark (#0a0a0a)
- **Surface**: Multiple surface levels for depth
- **Primary**: Blue accent (#0ea5e9)
- **Accent**: Purple accent (#d946ef)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono
- **Weights**: 300, 400, 500, 600, 700

## 📱 Responsive Design

The platform is built with a mobile-first approach and includes:
- Responsive grid layouts
- Mobile navigation menu
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: hello@scholarphile.com
- **Documentation**: [docs.scholarphile.com](https://docs.scholarphile.com)
- **Community**: [community.scholarphile.com](https://community.scholarphile.com)

## 🙏 Acknowledgments

- Built with Next.js and React
- Styled with Tailwind CSS
- Icons by Lucide
- Fonts by Google Fonts

---

Made with ❤️ for students worldwide
# ScholarPhile Platform - Sun Aug 10 00:12:16 EDT 2025
=======
# Scholarphile - Collaborative Study-Notes Platform

A modern, responsive web application for uploading, organizing, and sharing study materials. Built with vanilla HTML, CSS, and JavaScript for simplicity and performance.

## Features

### 📚 Document Upload & Management
- **File Support**: PDF, Markdown, text files, and images
- **Metadata**: Title, description, course codes, tags, and visibility settings
- **Drag & Drop**: Intuitive file upload interface
- **File Validation**: Type and size validation (10MB limit)

### 🔍 Document Discovery
- **Search**: Full-text search across titles, descriptions, and tags
- **Filtering**: By visibility (Private/Public) and course codes
- **Grid Layout**: Responsive card-based document display
- **Tags System**: Organize documents with custom tags

### 🎨 Modern UI/UX
- **Dark Theme**: Beautiful dark gradient design with blue-green accents
- **Responsive Design**: Works perfectly on desktop and mobile
- **Smooth Animations**: CSS animations and hover effects
- **Glass Morphism**: Modern backdrop blur effects

### 📱 Responsive Navigation
- **Fixed Navigation**: Always accessible top navigation
- **Mobile Optimized**: Collapsible navigation for small screens
- **Active States**: Clear visual feedback for current page

## Pages

### Home (`index.html`)
- Hero section with platform introduction
- Quick access buttons to upload and browse
- Responsive design with smooth animations

### Upload (`upload.html`)
- Comprehensive document upload form
- Drag & drop file interface
- Form validation and error handling
- Success feedback and redirect

### Documents (`documents.html`)
- Grid view of all uploaded documents
- Search and filtering capabilities
- Document actions (view, download, delete)
- Empty state for new users

## Technical Implementation

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern features like CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ classes and modern APIs
- **Local Storage**: Client-side document persistence for demo

### Design System
- **Color Palette**: Dark theme with `#4ecdc4` accent
- **Typography**: Open Sans font family
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable button and form styles

### File Handling
- **File Validation**: MIME type and size checking
- **Drag & Drop**: Native HTML5 drag and drop API
- **File Preview**: Selected file information display
- **Error Handling**: User-friendly error messages

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Scholarphile
   ```

2. **Open in browser**
   - Simply open `index.html` in any modern web browser
   - No build process or dependencies required

3. **Start using**
   - Navigate to the Upload page to add documents
   - Use the Documents page to browse and manage your collection
   - All data is stored locally in your browser

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Future Enhancements

### Backend Integration
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js integration
- **File Storage**: Supabase Storage or UploadThing
- **API Routes**: RESTful API endpoints

### Advanced Features
- **User Management**: User accounts and profiles
- **Collaboration**: Group sharing and permissions
- **Version Control**: Document version history
- **Real-time**: Live collaboration features

### Performance
- **PWA**: Progressive Web App capabilities
- **Caching**: Service worker for offline support
- **Optimization**: Image compression and lazy loading

## Project Structure

```
Scholarphile/
├── index.html          # Home page
├── upload.html         # Document upload page
├── documents.html      # Document browsing page
├── style.css           # Main styles and navigation
├── upload.css          # Upload page specific styles
├── documents.css       # Documents page specific styles
├── script.js           # Main page JavaScript
├── upload.js           # Upload functionality
├── documents.js        # Documents management
└── README.md           # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Demo

The application is fully functional as a demo with client-side storage. Upload documents, add metadata, and experience the full user interface. All data persists in your browser's local storage.

---

Built with ❤️ for students and educators everywhere.
>>>>>>> 397689fa14264a297ea89c41d0f63473a4d5b52f
