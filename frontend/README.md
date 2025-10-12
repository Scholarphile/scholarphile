# Scholarphile Frontend

Modern Next.js frontend for Scholarphile educational video platform.

## Features

- ✅ Search-first interface
- ✅ Video search with advanced filters
- ✅ AI-powered video curation
- ✅ Embedded YouTube player
- ✅ Quality scoring visualization
- ✅ Responsive design
- ✅ Type-safe with TypeScript
- ✅ React Query for state management

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query + Zustand
- **UI Components**: Custom components with Lucide icons
- **Video Player**: React YouTube

## Getting Started

### Prerequisites

- Node.js 18+
- Running FastAPI backend on `localhost:8000`

### Installation

```bash
npm install
```

### Configuration

Create `.env` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Development

```bash
npm run dev
```

Visit http://localhost:3000

### Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page
│   ├── search/page.tsx       # Search results
│   ├── curate/page.tsx       # Video curation
│   ├── watch/[videoId]/      # Video player
│   ├── layout.tsx            # Root layout
│   └── providers.tsx         # React Query provider
├── components/
│   ├── search-bar.tsx        # Search input
│   ├── video-card.tsx        # Video thumbnail card
│   ├── video-grid.tsx        # Video grid layout
│   └── subject-grid.tsx      # Subject browser
├── lib/
│   ├── api.ts                # API client & types
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## Pages

### Home (`/`)
- Hero section with search
- Subject browser
- Feature highlights

### Search (`/search?q=...`)
- Video search results
- Advanced filters (sort, quality, captions)
- Grid layout

### Curate (`/curate`)
- AI-powered video curation
- Topic and level selection
- Curated results with stats

### Watch (`/watch/[videoId]`)
- Embedded YouTube player
- Video details and stats
- Quality score visualization

## API Integration

The frontend connects to the FastAPI backend:

- `POST /api/v1/videos/search` - Search videos
- `POST /api/v1/videos/curate` - Curate videos
- `GET /api/v1/videos/{id}` - Get video details
- `GET /api/v1/content/subjects` - List subjects

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Cloudflare Pages

```bash
npm run build
# Deploy ./out directory
```

### Docker

```bash
docker build -t scholarphile-frontend .
docker run -p 3000:3000 scholarphile-frontend
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## Development Tips

- API responses are cached with React Query
- All pages are client-side rendered for dynamic content
- TypeScript types match backend Pydantic schemas
- Tailwind classes use responsive breakpoints

## License

MIT
