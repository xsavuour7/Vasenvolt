# Vasenvolt Environment Configuration Guide

This guide covers setting up environment variables and secrets for the Vasenvolt system across different environments.

## Quick Start

1. **Copy the appropriate environment file:**
   ```bash
   # For development
   cp backend/env.development backend/.env.development
   
   # For production
   cp backend/env.production backend/.env.production
   
   # For testing
   cp backend/env.test backend/.env.test
   ```

2. **Set the environment:**
   ```bash
   # Development (default)
   export APP_ENV=development
   
   # Production
   export APP_ENV=production
   
   # Testing
   export APP_ENV=test
   ```

3. **Update the copied file with your values**

## Environment Files

### Development (`.env.development`)
- Local development with debug enabled
- Local database and Redis
- Optional external services

### Production (`.env.production`)
- Production deployment settings
- Secure defaults
- External service integrations

### Testing (`.env.test`)
- Isolated test environment
- Test database
- Mock external services

## Required Environment Variables

### Core Configuration
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `ENVIRONMENT` | ✅ | Environment name | `development`, `production`, `test` |
| `DEBUG` | ✅ | Debug mode | `true`, `false` |

### Database
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Main database URL | `postgresql://user:pass@host:5432/db` |
| `DATABASE_TEST_URL` | ✅ | Test database URL | `postgresql://user:pass@host:5432/test_db` |
| `DB_POOL_SIZE` | ❌ | Connection pool size | `10` |
| `DB_MAX_OVERFLOW` | ❌ | Max overflow connections | `20` |
| `DB_POOL_TIMEOUT` | ❌ | Pool timeout (seconds) | `30` |
| `DB_POOL_RECYCLE` | ❌ | Pool recycle time (seconds) | `3600` |

### Security
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SECRET_KEY` | ✅ | JWT secret key (min 32 chars) | `your-super-secret-key-here` |
| `ALGORITHM` | ❌ | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | Access token expiry | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | ❌ | Refresh token expiry | `7` |

### Redis
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `REDIS_URL` | ✅ | Redis connection URL | `redis://localhost:6379` |

### CORS
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FRONTEND_URL` | ✅ | Frontend application URL | `http://localhost:3000` |
| `ALLOWED_ORIGINS` | ✅ | Allowed CORS origins | `["http://localhost:3000"]` |

### SMTP (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SMTP_HOST` | ❌ | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | ❌ | SMTP server port | `587` |
| `SMTP_USERNAME` | ❌ | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | ❌ | SMTP password/app password | `your-app-password` |
| `SMTP_USE_TLS` | ❌ | Use TLS | `true` |
| `SMTP_FROM_EMAIL` | ❌ | From email address | `noreply@yourdomain.com` |
| `SMTP_FROM_NAME` | ❌ | From name | `VasenVolt` |

### External APIs (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GOOGLE_MAPS_API_KEY` | ❌ | Google Maps API key | `your-google-maps-key` |
| `WEATHER_API_KEY` | ❌ | Weather API key | `your-weather-key` |

### Monitoring (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `LOG_LEVEL` | ❌ | Logging level | `DEBUG`, `INFO`, `WARNING`, `ERROR` |
| `SENTRY_DSN` | ❌ | Sentry DSN for error tracking | `https://...@sentry.io/...` |
| `PROMETHEUS_ENABLED` | ❌ | Enable Prometheus metrics | `true`, `false` |

### Rate Limiting (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RATE_LIMIT_REQUESTS` | ❌ | Requests per window | `1000` |
| `RATE_LIMIT_WINDOW` | ❌ | Window in seconds | `900` |

### Storage (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `STORAGE_TYPE` | ❌ | Storage type | `local`, `s3` |
| `STORAGE_PATH` | ❌ | Local storage path | `./storage` |
| `AWS_ACCESS_KEY_ID` | ❌ | AWS access key | `your-aws-access-key` |
| `AWS_SECRET_ACCESS_KEY` | ❌ | AWS secret key | `your-aws-secret-key` |
| `AWS_REGION` | ❌ | AWS region | `us-east-1` |
| `AWS_S3_BUCKET` | ❌ | AWS S3 bucket | `your-s3-bucket` |

## 🔧 Environment Setup by Platform

### Windows
```cmd
# Set environment variable
set APP_ENV=development

# Or in PowerShell
$env:APP_ENV="development"
```

### macOS/Linux
```bash
# Set environment variable
export APP_ENV=development

# Add to shell profile (~/.bashrc, ~/.zshrc)
echo 'export APP_ENV=development' >> ~/.bashrc
source ~/.bashrc
```

### Docker
```dockerfile
# In Dockerfile
ENV APP_ENV=production

# Or in docker-compose.yml
environment:
  - APP_ENV=production
```

## 🚨 Validation and Error Handling

The system validates environment variables on startup:

- **Missing required variables** cause startup failure with clear error messages
- **Invalid values** (e.g., short SECRET_KEY) trigger validation errors
- **Type conversion** happens automatically (strings to integers, booleans)
- **JSON parsing** for complex values like `ALLOWED_ORIGINS`

### Example Error Messages
```
❌ Configuration Error: 1 validation error for Settings
database_url
  field required (type=value_error.missing)

💡 Please check your .env.development file and ensure all required variables are set.
📖 See ENVIRONMENT.md for required environment variables.
```

## 🔒 Security Best Practices

### 1. Secret Management
- **Never commit** `.env` files to version control
- Use **strong, random** SECRET_KEY (min 32 characters)
- **Rotate secrets** regularly in production
- Use **environment-specific** keys

### 2. Production Security
- Set `DEBUG=false` in production
- Use **HTTPS** for all external URLs
- **Limit CORS origins** to production domains
- **Enable monitoring** and error tracking

### 3. Database Security
- Use **strong passwords** for database users
- **Limit database permissions** to minimum required
- Use **SSL connections** in production
- **Regular backups** and monitoring

### 4. API Key Security
- Store API keys in **environment variables**
- **Rotate keys** regularly
- Use **least privilege** access
- **Monitor usage** for anomalies

## 📋 Environment Checklist

### Development Setup
- [ ] Copy `env.development` to `.env.development`
- [ ] Set `APP_ENV=development`
- [ ] Update database credentials
- [ ] Set `SECRET_KEY` (min 32 chars)
- [ ] Configure Redis URL
- [ ] Set frontend URL and CORS origins
- [ ] Test configuration with `npm run db:init`

### Production Setup
- [ ] Copy `env.production` to `.env.production`
- [ ] Set `APP_ENV=production`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set production CORS origins
- [ ] Configure SMTP settings
- [ ] Set external API keys
- [ ] Enable monitoring
- [ ] Test configuration

### Testing Setup
- [ ] Copy `env.test` to `.env.test`
- [ ] Set `APP_ENV=test`
- [ ] Configure test database
- [ ] Set test-specific values
- [ ] Run tests to verify

## 🧪 Testing Configuration

### 1. Validate Configuration
```bash
# Test configuration loading
cd backend
python -c "from config import settings; print('✅ Configuration loaded successfully')"
```

### 2. Test Database Connection
```bash
# Test database health
curl http://localhost:8000/health/db
```

### 3. Run Tests
```bash
# Run backend tests
npm run test

# Run with specific environment
APP_ENV=test npm run test
```

## Deployment Considerations

### 1. Environment Variables
- Use **platform-specific** environment variable management
- **Never hardcode** secrets in deployment scripts
- Use **secrets management** services (AWS Secrets Manager, Azure Key Vault)

### 2. Configuration Files
- **Don't deploy** `.env` files to production servers
- Use **environment variables** or **configuration services**
- **Validate configuration** on startup

### 3. Monitoring
- **Log configuration** errors clearly
- **Monitor** environment variable usage
- **Alert** on configuration issues

## 🆘 Troubleshooting

### Common Issues

#### 1. Configuration Not Loading
```
❌ Configuration Error: [Errno 2] No such file or directory: '.env.development'
```
**Solution**: Copy the environment file and set `APP_ENV`

#### 2. Missing Required Variables
```
❌ Configuration Error: 1 validation error for Settings
database_url
  field required (type=value_error.missing)
```
**Solution**: Check your `.env` file for missing variables

#### 3. Invalid Values
```
❌ Configuration Error: 1 validation error for Settings
secret_key
  SECRET_KEY must be at least 32 characters long
```
**Solution**: Generate a longer secret key

#### 4. JSON Parsing Errors
```
❌ Configuration Error: Expecting value: line 1 column 1 (char 0)
```
**Solution**: Check JSON format in `ALLOWED_ORIGINS`

### Getting Help

1. **Check the logs** for specific error messages
2. **Verify environment file** exists and is readable
3. **Validate variable values** match expected format
4. **Test configuration** with minimal setup
5. **Review this guide** for required variables

## 📚 Additional Resources

- [Pydantic Settings Documentation](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [Python Environment Variables](https://docs.python.org/3/library/os.html#os.environ)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Redis Connection URLs](https://redis.io/docs/connect/cli/)
- [SMTP Configuration](https://docs.python.org/3/library/smtplib.html)
