# Vasenvolt Database Setup Guide

This guide covers setting up the PostgreSQL database and running migrations for the Vasenvolt system.

## Prerequisites

- **PostgreSQL** 15+ installed and running
- **Python** 3.8+ with virtual environment activated
- **Database credentials** configured

## Database Setup

### 1. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create databases
CREATE DATABASE vasenvolt;
CREATE DATABASE vasenvolt_test;

-- Create user (optional, if you want a dedicated user)
CREATE USER vasenvolt_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vasenvolt TO vasenvolt_user;
GRANT ALL PRIVILEGES ON DATABASE vasenvolt_test TO vasenvolt_user;

-- Exit psql
\q
```

### 2. Configure Environment

The system uses environment-specific configuration files. Create the appropriate file:

**For Development:**
```bash
# Copy the development config
cp backend/env.development backend/.env.development
```

**For Production:**
```bash
# Create production config
cp backend/env.development backend/.env.production
# Edit with production values
```

### 3. Database Schema

The system includes the following core entities:

#### Users
- Authentication and user management
- Multi-tenant support
- Role-based access control

#### Tenants
- Multi-tenancy support
- Organization isolation
- Customizable settings

#### Sites
- Physical locations
- Geographic coordinates
- Address information

#### Meters
- Energy monitoring devices
- Multiple meter types (electricity, water, gas, heat, solar)
- Communication protocols

#### Meter Readings
- Time-series data from meters
- Data quality indicators
- Validation status

## Migration Commands

### Quick Start

```bash
# Initialize database (creates tables + initial data)
npm run db:init

# Run pending migrations
npm run db:migrate

# Check migration status
npm run db:status
```

### Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run db:init` | Initialize database with tables and sample data | Quick setup |
| `npm run db:migrate` | Run all pending migrations | After schema changes |
| `npm run db:create` | Create new migration | `npm run db:create "Description"` |
| `npm run db:rollback` | Rollback last migration | Undo changes |
| `npm run db:status` | Show migration status | Check current state |
| `npm run db:history` | Show migration history | View all migrations |

### Manual Migration Commands

```bash
cd backend

# Initialize database
python migrate.py init

# Run migrations
python migrate.py migrate

# Create new migration
python migrate.py create "Add new feature"

# Check status
python migrate.py status
```

## Database Health Checks

### API Endpoints

- **Basic Health**: `GET /health`
- **Database Health**: `GET /health/db`

### Test Database Connection

```bash
# Test connection
curl http://localhost:8000/health/db

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "tables": {
    "users": 1,
    "tenants": 1,
    "sites": 1,
    "meters": 1
  }
}
```

## Initial Data

The system automatically creates:

1. **Default Tenant**: "VasenVolt Default"
2. **Admin User**: admin@vasenvolt.com / admin123
3. **Demo Site**: Sample location with coordinates
4. **Demo Meter**: Electricity meter with specifications

## Troubleshooting

### Common Issues

#### 1. Connection Refused
```
❌ Database connection failed: connection to server at localhost failed
```

**Solution**: Ensure PostgreSQL is running
```bash
# Windows
net start postgresql-x64-15

# macOS/Linux
sudo systemctl start postgresql
# or
brew services start postgresql
```

#### 2. Authentication Failed
```
❌ Database connection failed: FATAL: password authentication failed
```

**Solution**: Check credentials in `.env.development`
```bash
# Test connection manually
psql -U postgres -d vasenvolt -h localhost
```

#### 3. Database Does Not Exist
```
❌ Database connection failed: FATAL: database "vasenvolt" does not exist
```

**Solution**: Create the database
```sql
CREATE DATABASE vasenvolt;
```

#### 4. Permission Denied
```
❌ Database connection failed: permission denied for database
```

**Solution**: Grant permissions
```sql
GRANT ALL PRIVILEGES ON DATABASE vasenvolt TO your_user;
```

### Debug Mode

Enable detailed logging by setting `DEBUG=true` in your environment file.

## Development Workflow

### 1. Schema Changes

```bash
# 1. Modify models in app/models/
# 2. Create migration
npm run db:create "Add new field to user table"

# 3. Review generated migration file
# 4. Apply migration
npm run db:migrate
```

### 2. Data Seeding

```bash
# Add seed data to app/database_init.py
# Run initialization
npm run db:init
```

### 3. Testing

```bash
# Run tests with test database
npm run test

# Test database connection
curl http://localhost:8000/health/db
```

## Production Considerations

### 1. Environment Variables

- Use strong, unique passwords
- Store secrets securely (not in version control)
- Use environment-specific config files

### 2. Database Security

- Limit database user permissions
- Use SSL connections
- Regular backups
- Monitor connection pools

### 3. Migration Strategy

- Test migrations in staging environment
- Backup before production migrations
- Use rollback capabilities
- Monitor migration performance

## Support

For database issues:

1. Check the logs in your terminal
2. Verify PostgreSQL is running
3. Test connection manually with `psql`
4. Check environment configuration
5. Review migration status with `npm run db:status`
