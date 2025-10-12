# Scholarphile API

Production-grade FastAPI backend for educational video curation and learning path management.

## Features

- ✅ YouTube video search and curation
- ✅ Quality scoring algorithm
- ✅ RESTful API with OpenAPI docs
- ✅ Structured logging
- ✅ Docker support
- ✅ Type-safe with Pydantic
- ✅ Production-ready configuration

## Quick Start

### Prerequisites

- Python 3.11+
- Docker & Docker Compose (optional)
- YouTube Data API v3 key

### Local Development

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env and add your YouTube API key
```

4. **Run the server:**
```bash
uvicorn app.main:app --reload
```

5. **Access the API:**
- API: http://localhost:8000
- Docs: http://localhost:8000/api/v1/docs
- Health: http://localhost:8000/health

### Docker Development

```bash
docker-compose up
```

## API Endpoints

### Health Check
```
GET /health
GET /api/v1/health
```

### Videos
```
POST /api/v1/videos/search - Search for videos
POST /api/v1/videos/curate - Curate videos for a topic
GET /api/v1/videos/{video_id} - Get video details
```

### Content
```
GET /api/v1/content/subjects - List subjects
GET /api/v1/content/subjects/{slug}/courses - List courses
GET /api/v1/content/courses/{id} - Get course details
```

## Project Structure

```
scholarphile/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           ├── health.py
│   │           ├── videos.py
│   │           └── content.py
│   ├── core/
│   │   ├── config.py
│   │   └── logging.py
│   ├── schemas/
│   │   └── video.py
│   ├── services/
│   │   └── youtube_service.py
│   └── main.py
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Configuration

Environment variables (see `.env.example`):

- `YOUTUBE_API_KEY` - Required: YouTube Data API key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - Secret key for JWT
- `LOG_LEVEL` - Logging level (INFO, DEBUG, ERROR)
- `DEBUG` - Debug mode (true/false)

## Development

### Run tests:
```bash
pytest
```

### Code quality:
```bash
black app/
ruff check app/
mypy app/
```

### Type checking:
```bash
mypy app/
```

## Deployment

### Railway/Fly.io

1. Create new project
2. Set environment variables
3. Deploy from GitHub

### Docker

```bash
docker build -t scholarphile-api .
docker run -p 8000:8000 --env-file .env scholarphile-api
```

## API Usage Examples

### Search Videos
```bash
curl -X POST "http://localhost:8000/api/v1/videos/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "differential equations tutorial",
    "max_results": 5,
    "order": "rating",
    "require_captions": true
  }'
```

### Curate Videos
```bash
curl -X POST "http://localhost:8000/api/v1/videos/curate" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "linear algebra",
    "level": "intermediate",
    "max_videos": 5
  }'
```

## YouTube API Quota

- Search: 100 units per request
- Video details: 1 unit per request
- Daily quota: 10,000 units (free tier)

## License

MIT

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests and linters
5. Submit pull request

