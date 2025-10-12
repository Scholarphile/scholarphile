# Scholarphile - Production Platform

Search-first educational video platform with AI-powered curation.

## Architecture

```
┌─────────────────────────────────────┐
│   Frontend (Next.js 15)             │
│   - Search interface                │
│   - Video player                    │
│   - Curation UI                     │
│   - Port: 3000                      │
└─────────────┬───────────────────────┘
              │ HTTP/REST
              │
┌─────────────▼───────────────────────┐
│   Backend (FastAPI)                 │
│   - YouTube API integration         │
│   - Quality scoring                 │
│   - Video curation                  │
│   - Port: 8000                      │
└─────────────┬───────────────────────┘
              │
              ▼
        YouTube Data API v3
```

## Quick Start

### 1. Backend Setup

```bash
cd scholarphile
source venv/bin/activate
pip install -r requirements.txt

# Add YouTube API key to .env
echo "YOUTUBE_API_KEY=your_key_here" >> .env
echo "DATABASE_URL=postgresql://..." >> .env

# Run backend
uvicorn app.main:app --reload
```

Backend runs on http://localhost:8000
- API Docs: http://localhost:8000/api/v1/docs
- Health: http://localhost:8000/health

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env

# Run frontend
npm run dev
```

Frontend runs on http://localhost:3000

## Project Structure

```
scholarphile/
├── app/                    # FastAPI backend
│   ├── api/v1/endpoints/  # REST endpoints
│   ├── core/              # Config & logging
│   ├── schemas/           # Pydantic models
│   └── services/          # Business logic
├── frontend/              # Next.js frontend
│   ├── app/              # Pages (App Router)
│   ├── components/       # React components
│   └── lib/              # Utils & API client
├── requirements.txt      # Python dependencies
├── Dockerfile           # Backend container
└── docker-compose.yml   # Full stack
```

## Features

### Backend
- ✅ YouTube video search & curation
- ✅ Quality scoring algorithm (0-100)
- ✅ REST API with OpenAPI docs
- ✅ Structured logging
- ✅ Type-safe with Pydantic
- ✅ Docker support

### Frontend
- ✅ Search-first interface
- ✅ Advanced filtering
- ✅ AI-powered curation
- ✅ Embedded video player
- ✅ Quality visualization
- ✅ Responsive design

## API Endpoints

### Videos
- `POST /api/v1/videos/search` - Search videos
- `POST /api/v1/videos/curate` - Curate for topic
- `GET /api/v1/videos/{id}` - Video details

### Content
- `GET /api/v1/content/subjects` - List subjects
- `GET /api/v1/content/subjects/{slug}/courses` - List courses

### Health
- `GET /health` - Health check
- `GET /api/v1/health` - Detailed health

## Development

### Using Docker Compose

```bash
docker-compose up
```

Starts:
- Backend on :8000
- Frontend on :3000
- PostgreSQL on :5432
- Redis on :6379

### Manual Setup

**Terminal 1 - Backend:**
```bash
cd scholarphile
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Deployment

### Backend
- **Railway**: Connect GitHub, set env vars
- **Fly.io**: `fly launch` in root
- **Docker**: Build and push to registry

### Frontend
- **Vercel**: Connect GitHub, auto-deploy
- **Cloudflare Pages**: `npm run build`, deploy `./out`
- **Netlify**: Connect GitHub, build command: `npm run build`

## Environment Variables

### Backend (.env)
```
YOUTUBE_API_KEY=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=...
ALLOWED_ORIGINS=http://localhost:3000,https://...
```

### Frontend (.env)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Tech Stack

### Backend
- FastAPI
- Pydantic
- SQLAlchemy
- YouTube Data API v3
- Structlog
- PostgreSQL

### Frontend
- Next.js 15
- TypeScript
- Tailwind CSS
- React Query
- Lucide Icons
- React YouTube

## Quality Score Algorithm

Videos are scored 0-100 based on:
- **Views** (30 points): Popularity indicator
- **Engagement** (30 points): Like/view ratio
- **Comments** (20 points): Community engagement
- **Captions** (20 points): Accessibility

## Roadmap

- [ ] User authentication
- [ ] Progress tracking
- [ ] Learning paths
- [ ] Quiz generation (AI)
- [ ] Recommendation engine
- [ ] Scholarship matching
- [ ] Mobile app

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests
5. Submit PR

## License

MIT

