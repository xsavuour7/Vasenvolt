# Vasenvolt - Secure Authentication System 

A monorepo containing a secure authentication system with React/TypeScript frontend and FastAPI backend.

## Quick Setup

1. **Frontend**: `cd frontend && npm install && npm run dev`
2. **Backend**: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
3. **Both**: Use separate terminals for frontend (port 3000) and backend (port 8000)

## Project Structure

- `frontend/` - React + TypeScript + TailwindCSS (Next.js)
- `backend/` - FastAPI + Python authentication server
- `shared/` - Common types and utilities

## CI/CD Pipeline

- **Automatic**: Linting and testing on every push/PR
- **Manual**: Staging deployment via GitHub Actions
- **Coverage**: Code coverage reports uploaded to Codecov
- **Security**: Automated vulnerability scanning with npm audit and Snyk

## Development

- Frontend: `npm run dev` (port 3000)
- Backend: `uvicorn main:app --reload` (port 8000)
- Lint: `npm run lint` (frontend), `flake8` (backend)
- CI: `npm run ci:lint`, `npm run ci:test`, `npm run ci:security`
