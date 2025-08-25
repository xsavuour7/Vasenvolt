# Vasenvolt Setup Guide

This guide will help you set up the Vasenvolt secure authentication system locally.

## Prerequisites

- **Node.js** 18+ and npm 8+
- **Python** 3.8+
- **PostgreSQL** (for database)
- **Redis** (optional, for session storage)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix/macOS:
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Environment Configuration

1. **Set up environment variables**:
   ```bash
   # Copy the development environment file
   cp backend/env.development backend/.env.development
   
   # Set environment (optional, defaults to development)
   export APP_ENV=development
   ```

2. **Validate configuration**:
   ```bash
   # Check your configuration
   npm run config:check
   
   # Or manually:
   cd backend
   python validate_config.py
   ```

### 3. Database Setup

1. **Install PostgreSQL** (if not already installed):
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - **macOS**: `brew install postgresql`
   - **Ubuntu**: `sudo apt install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:
   - **Windows**: `net start postgresql-x64-15`
   - **macOS**: `brew services start postgresql`
   - **Ubuntu**: `sudo systemctl start postgresql`

3. **Create databases**:
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create databases
CREATE DATABASE vasenvolt;
CREATE DATABASE vasenvolt_test;

-- Exit psql
\q
```

4. **Initialize database**:
```bash
# From root directory
npm run db:init

# Or manually:
cd backend
python migrate.py init
```

### 3. Start Development Servers

#### Option A: Start Both Servers (Recommended)
```bash
# From root directory
npm run dev
```

#### Option B: Start Separately
```bash
# Terminal 1 - Frontend (port 3000)
npm run dev:frontend

# Terminal 2 - Backend (port 8000)
npm run dev:backend
```

## Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Project Structure

```
vasenvolt/
├── frontend/                 # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── lib/             # Utility functions
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                  # FastAPI + Python
│   ├── app/
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication logic
│   │   ├── models/          # Database models
│   │   └── schemas/         # Pydantic schemas
│   ├── alembic/             # Database migrations
│   ├── tests/                # Test suite
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration
│   ├── requirements.txt     # Python dependencies
│   └── dev.py               # Development setup script
├── package.json             # Monorepo scripts
└── README.md
```

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run setup` - Setup both frontend and backend
- `npm run test` - Run backend tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Backend
- `python dev.py` - Setup and start development server
- `uvicorn main:app --reload` - Start server manually
- `python migrate.py init` - Initialize database
- `python migrate.py migrate` - Run migrations
- `pytest` - Run tests

### Database
- `npm run db:init` - Initialize database with tables and data
- `npm run db:migrate` - Run pending migrations
- `npm run db:create` - Create new migration
- `npm run db:rollback` - Rollback last migration
- `npm run db:status` - Check migration status

### Configuration
- `npm run validate` - Validate environment configuration
- `npm run config:check` - Check configuration and connections

## Environment Variables

The system uses environment-specific configuration files. See [ENVIRONMENT.md](ENVIRONMENT.md) for complete setup instructions.

**Quick setup:**
```bash
# Copy the development environment file
cp backend/env.development backend/.env.development

# Validate your configuration
npm run config:check
```

**Required variables:**
- Database credentials
- JWT secret key (min 32 characters)
- Redis connection URL
- Frontend URL and CORS origins

## Testing

### Backend Tests
```bash
cd backend
# Activate virtual environment first
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Database Migrations

```bash
cd backend
# Activate virtual environment first

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in config files or kill existing processes
2. **Database connection failed**: Check PostgreSQL is running and credentials are correct
3. **Python import errors**: Ensure virtual environment is activated
4. **Node modules issues**: Delete `node_modules` and run `npm install` again

### Getting Help

- Check the API documentation at http://localhost:8000/docs
- Review the logs in your terminal
- Check the health endpoint at http://localhost:8000/health

## Next Steps

After setup, you can:
1. Create user accounts via the registration form
2. Test authentication flows
3. Extend the API with new endpoints
4. Add more frontend features
5. Implement additional security measures
