# Vasenvolt Backend

FastAPI-based authentication server with secure endpoints.

## Setup

1. Create virtual environment: `python -m venv venv`
2. Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Unix)
3. Install dependencies: `pip install -r requirements.txt`
4. Run: `uvicorn main:app --reload`

## Development

- **Dev server**: `uvicorn main:app --reload` (port 8000)
- **API docs**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── requirements.txt     # Python dependencies
├── app/                # Application modules
│   ├── auth/          # Authentication logic
│   ├── models/        # Database models
│   ├── schemas/       # Pydantic schemas
│   └── api/           # API routes
├── tests/              # Test suite
└── alembic/            # Database migrations
```
