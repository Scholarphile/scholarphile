# Scholarphile Enhanced Setup Guide

## 🚀 Features Included

### ✅ Core Functionality
- **User Authentication** - JWT-based auth with registration/login
- **File Upload & Management** - Drag & drop uploads with metadata
- **Enhanced Search** - Advanced search with filters and relevance scoring
- **AI-Powered Recommendations** - Hybrid content + collaborative filtering
- **Analytics Dashboard** - User stats, popular content, and usage metrics
- **Debug Tools** - Comprehensive logging and monitoring

### ✅ Advanced Features
- **Predictive Algorithms** - Content-based and collaborative filtering
- **File Processing** - Text extraction and file validation
- **Real-time Debugging** - Live API logging and performance metrics
- **Responsive Design** - Mobile-friendly interface
- **Comprehensive Database** - Enhanced schema with proper indexing

## 🛠 Prerequisites

1. **Cloudflare Account** with Workers and D1 access
2. **Node.js** (v18 or later)
3. **Wrangler CLI** installed globally: `npm install -g wrangler`

## 📦 Installation

### 1. Clone and Setup

```bash
# Navigate to your project directory
cd permates

# Install dependencies
npm install

# Login to Cloudflare
wrangler login
```

### 2. Database Setup

```bash
# Create D1 database
npm run db:create

# Apply database schema
npm run db:migrate

# For remote database
npm run db:migrate:remote
```

### 3. R2 Storage Setup

```bash
# Create R2 bucket for file storage
npm run storage:create
```

### 4. Environment Configuration

Update `wrangler.toml` with your actual database and bucket IDs:

```toml
# Replace with your actual database ID
database_id = "your-actual-database-id"

# Replace with your bucket name
bucket_name = "your-bucket-name"
```

### 5. Security Configuration

**Important**: Update the JWT secret in production:

```toml
[vars]
JWT_SECRET = "your-super-secure-production-secret-key"
```

## 🚀 Deployment

### Development
```bash
# Start local development server
npm run worker:dev

# With debugging enabled
npm run worker:debug
```

### Production
```bash
# Deploy to Cloudflare Workers
npm run worker:deploy
```

## 🔧 Configuration Options

### Environment Variables (wrangler.toml)

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT tokens | Change in production! |
| `SESSION_DURATION` | Session duration in ms | 86400000 (24h) |
| `MAX_FILE_SIZE` | Max upload size in bytes | 10485760 (10MB) |
| `DEBUG_MODE` | Enable debug logging | true |

### Database Configuration

The enhanced schema includes:
- **Users** - Authentication and profiles
- **Documents** - File metadata and content
- **Search History** - For analytics and recommendations
- **User Interactions** - View/download tracking
- **Course Information** - Structured course data
- **Study Groups** - Collaborative features
- **System Metrics** - Performance monitoring

## 📱 Frontend Features

### User Interface
- **Dashboard** - Personalized recommendations and stats
- **Document Management** - Upload, view, and organize files
- **Advanced Search** - Filter by type, course, year
- **Analytics** - Personal usage statistics
- **Debug Panel** - Real-time API monitoring

### File Upload
- **Drag & Drop** - Modern file upload interface
- **Multiple Files** - Batch upload support
- **Metadata** - Course codes, descriptions, tags
- **Validation** - File size and type checking

### Search & Discovery
- **Smart Search** - Relevance-based ranking
- **Filters** - Course, year, file type
- **Recommendations** - AI-powered suggestions
- **Analytics** - Search history tracking

## 🤖 AI Recommendations

The platform includes a sophisticated recommendation engine:

### Content-Based Filtering
- Recommends documents from courses you've favorited
- Suggests content based on search history
- Uses document metadata for matching

### Collaborative Filtering
- Finds users with similar interests
- Recommends popular content among similar users
- Tracks interaction patterns

### Trending Content
- Highlights recently popular documents
- Time-based relevance scoring
- Community engagement metrics

## 🐛 Debugging & Monitoring

### Debug Panel Features
- **API Logs** - Real-time request/response logging
- **Performance Metrics** - Response times and system health
- **Network Status** - Database and storage connectivity
- **Error Tracking** - Detailed error information

### Enable Debug Mode
1. Click the "Debug" button in the header
2. Add `X-Debug-Mode: true` header to API requests
3. Check the `/debug` endpoint for system info

### Log Export
- Export logs as text files
- Filter by time range or request type
- Include performance metrics

## 📊 Analytics Features

### User Analytics
- Documents uploaded
- Favorites count
- Search history
- Total interactions

### System Analytics
- Popular courses
- Trending documents
- Search patterns
- Usage statistics

### Performance Monitoring
- API response times
- Database query performance
- Error rates
- User engagement metrics

## 🔒 Security Features

### Authentication
- JWT-based session management
- Secure password hashing (use bcrypt in production)
- Session expiration and cleanup
- Device and IP tracking

### File Security
- File type validation
- Size limits
- Hash-based duplicate detection
- Virus scanning capabilities (planned)

### API Security
- CORS protection
- Rate limiting (planned)
- Request logging
- Error sanitization

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Documents
- `GET /api/documents` - List documents (with pagination)
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Upload new document
- `DELETE /api/documents/:id` - Delete document

### Search
- `GET /api/search?q=query` - Search documents
- Advanced filters: `course`, `year`, `type`

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

### Analytics
- `GET /api/analytics` - Get user analytics

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/favorites` - Get favorites
- `POST /api/users/favorites` - Add to favorites

## 🎯 Usage Examples

### Upload a Document
```javascript
const formData = new FormData();
formData.append('file', fileObject);
formData.append('title', 'My Study Notes');
formData.append('courseCode', 'CS101');
formData.append('description', 'Comprehensive notes for midterm');

fetch('/api/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Search Documents
```javascript
const response = await fetch('/api/search?q=algorithms&course=CS101&year=2024', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.results);
```

### Get Recommendations
```javascript
const response = await fetch('/api/recommendations', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
console.log(data.recommendations);
```

## 🛠 Development Tips

### Local Development
1. Use `npm run worker:debug` for enhanced logging
2. Enable debug mode in the frontend
3. Monitor the debug panel for API calls
4. Use browser dev tools for frontend debugging

### Testing
1. Create test users through the registration flow
2. Upload sample documents for testing
3. Perform searches to generate recommendations
4. Monitor analytics for data accuracy

### Performance Optimization
1. Use database indexes for frequently queried fields
2. Implement pagination for large result sets
3. Cache frequently accessed data
4. Optimize file upload sizes

## 🚨 Production Checklist

### Security
- [ ] Update JWT secret to a strong, unique value
- [ ] Enable HTTPS for all communications
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Set up monitoring and alerting

### Performance
- [ ] Configure CDN for file delivery
- [ ] Set up proper caching headers
- [ ] Monitor database query performance
- [ ] Implement file compression

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Monitor storage usage

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Test recovery procedures
- [ ] Document disaster recovery plan
- [ ] Monitor backup integrity

## 🆘 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check D1 database configuration in wrangler.toml
- Verify database ID is correct
- Ensure migrations have been applied

**File Upload Not Working**
- Check R2 bucket configuration
- Verify bucket permissions
- Check file size limits

**Authentication Issues**
- Verify JWT secret configuration
- Check token expiration settings
- Ensure proper CORS headers

**Debug Mode Not Working**
- Ensure `DEBUG_MODE=true` in environment
- Check browser console for errors
- Verify debug panel is enabled

### Getting Help

1. Check the debug panel for detailed error information
2. Review API logs for request/response details
3. Check browser console for frontend errors
4. Verify configuration in wrangler.toml

## 📈 Next Steps

### Planned Features
- [ ] Real-time notifications
- [ ] Study group collaboration
- [ ] Advanced file processing (OCR, etc.)
- [ ] Mobile app
- [ ] Integration with learning management systems

### Customization
- Modify the recommendation algorithm weights
- Add new document types and categories
- Implement custom search filters
- Create personalized dashboards

## 🎉 Success!

Your enhanced Scholarphile platform is now ready with:
- ✅ Full user authentication
- ✅ Advanced file management
- ✅ AI-powered recommendations
- ✅ Comprehensive search
- ✅ Analytics and debugging
- ✅ Responsive design
- ✅ Production-ready architecture

Happy learning! 🎓