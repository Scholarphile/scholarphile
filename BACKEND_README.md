# Scholarphile Backend - Cloudflare Workers

A scalable, global backend for the Scholarphile platform built on Cloudflare's edge computing infrastructure.

## 🚀 **Why Cloudflare Stack?**

### **Cost Comparison**
- **Cloudflare**: ~$15-20/month for 1M requests, 100GB storage, 1TB bandwidth
- **AWS**: ~$80-150/month for equivalent services
- **Savings**: 70-85% cost reduction with better global performance

### **Performance Benefits**
- ⚡ **200+ Edge Locations** - <50ms latency worldwide
- 🚫 **Zero Cold Starts** - Instant response times
- 🛡️ **Built-in Security** - DDoS protection, WAF, SSL
- 💰 **No Egress Fees** - Massive cost savings

## 🛠️ **Technology Stack**

- **Runtime**: Cloudflare Workers (V8 JavaScript)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Storage**: Cloudflare R2 (S3-compatible, no egress fees)
- **CDN**: Cloudflare's global network
- **Language**: JavaScript/TypeScript
- **CLI**: Wrangler

## 📁 **Project Structure**

```
permates/
├── src/
│   └── index.js          # Main Worker entry point
├── schema.sql            # Database schema
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies and scripts
└── BACKEND_README.md     # This file
```

## 🚀 **Quick Start**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Login to Cloudflare**
```bash
npx wrangler login
```

### 3. **Create Database**
```bash
npm run db:create
```

### 4. **Create Storage Bucket**
```bash
npm run storage:create
```

### 5. **Update Configuration**
Edit `wrangler.toml` with your database and bucket IDs.

### 6. **Deploy Database Schema**
```bash
npm run db:migrate
```

### 7. **Deploy Worker**
```bash
npm run worker:deploy
```

## 🔧 **Development**

### **Local Development**
```bash
npm run worker:dev
```

### **Test API Endpoints**
```bash
# Health check
curl https://your-worker.your-subdomain.workers.dev/health

# Get documents
curl https://your-worker.your-subdomain.workers.dev/api/documents

# Search documents
curl "https://your-worker.your-subdomain.workers.dev/api/search?q=mathematics"
```

## 📊 **API Endpoints**

### **Health Check**
- `GET /health` - Service health status

### **Documents**
- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload new document
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

### **Search**
- `GET /api/search?q=query` - Search documents

### **Users**
- `GET /api/users` - Get user profile
- `POST /api/users` - Create user account
- `PUT /api/users` - Update user profile

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

## 💾 **Database Schema**

### **Users Table**
- `id` - Unique user identifier
- `email` - User email (unique)
- `name` - Display name
- `avatar_url` - Profile picture URL
- `created_at` - Account creation timestamp

### **Documents Table**
- `id` - Unique document identifier
- `title` - Document title
- `description` - Document description
- `file_url` - R2 storage URL
- `preview_url` - Generated preview URL
- `course_code` - Course identifier
- `year` - Academic year
- `user_id` - Uploader reference
- `download_count` - Download statistics
- `view_count` - View statistics

## 🔐 **Security Features**

- **CORS Headers** - Cross-origin request handling
- **Input Validation** - Request data sanitization
- **Rate Limiting** - Built into Cloudflare Workers
- **DDoS Protection** - Automatic with Cloudflare
- **SSL/TLS** - Automatic HTTPS

## 📈 **Scaling Benefits**

### **Automatic Scaling**
- Workers scale from 0 to millions of requests instantly
- No server provisioning or management
- Global edge deployment

### **Cost Optimization**
- Pay per request (no idle costs)
- No egress fees for R2 storage
- Built-in CDN and caching

### **Performance**
- <50ms response times globally
- Zero cold starts
- Automatic failover

## 🚀 **Deployment**

### **Production Deployment**
```bash
npm run worker:deploy
```

### **Staging Deployment**
```bash
npx wrangler deploy --env staging
```

### **GitHub Actions Integration**
The project includes automatic deployment via GitHub Actions for the frontend. Backend deployment can be added to the same workflow.

## 🔍 **Monitoring & Analytics**

### **Cloudflare Dashboard**
- Request metrics
- Error rates
- Performance analytics
- Real-time logs

### **Custom Analytics**
- Search query tracking
- Document download statistics
- User engagement metrics

## 🛠️ **Next Steps**

1. **Authentication System** - Implement JWT-based auth
2. **File Upload** - Complete document upload with preview generation
3. **Search Enhancement** - Add full-text search with relevance scoring
4. **User Profiles** - Complete user management system
5. **Real-time Features** - WebSocket connections for live updates

## 📚 **Resources**

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [R2 Storage Documentation](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)

---

**Ready to scale globally with minimal cost and maximum performance!** 🚀 