# Scholarphile Backend

Python backend for the Scholarphile learning platform.

## Setup

1. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   ```

2. **Activate virtual environment:**
   ```bash
   # On macOS/Linux
   source venv/bin/activate
   
   # On Windows
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   Then add your YouTube API key to `.env`

## Project Structure

```
backend/
├── curator/           # YouTube content curation tools
│   ├── youtube_scraper.py
│   ├── quality_analyzer.py
│   ├── transcript_extractor.py
│   └── json_generator.py
├── api/              # FastAPI application (Phase 2)
├── ml/               # Machine learning services (Phase 3)
├── tests/            # Test suite
├── venv/             # Virtual environment (not in git)
├── requirements.txt  # Python dependencies
└── README.md         # This file
```

## Current Phase: Phase 1 - Content Curation

Building YouTube video discovery and analysis tools.

### Learning Goals
- Python basics
- API integration
- Data processing
- File I/O
- Object-oriented programming

## Usage

Coming soon...

## Development

Run tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=curator --cov=api
```

