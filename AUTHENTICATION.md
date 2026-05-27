# Vasenvolt Authentication System

This document describes the comprehensive authentication system implemented in Vasenvolt, including JWT tokens, password security, and OAuth2-ready scaffolding.

## Overview

The authentication system provides:
- **Secure user registration** with strong password requirements
- **JWT-based authentication** with access and refresh tokens
- **Password security** using bcrypt with minimum cost factor 12
- **Protected routes** with role-based access control
- **Rate limiting** to prevent abuse
- **OAuth2 scaffolding** for future Google/Microsoft integration

## Security Features

### Password Requirements
- **Minimum length**: 8 characters
- **Must contain**: Uppercase letter, lowercase letter, number, special character
- **Hashing**: bcrypt with minimum cost factor 12 (configurable)
- **Validation**: Server-side validation with clear error messages

### JWT Token Security
- **Access tokens**: 1 hour expiry (configurable)
- **Refresh tokens**: 30 days expiry (configurable)
- **Token types**: Separate validation for access vs refresh tokens
- **Database storage**: Refresh tokens stored and tracked in database
- **Revocation**: Tokens can be revoked on logout or password change

### Rate Limiting
- **Default limit**: 60 requests per minute per IP address
- **Configurable**: Per-endpoint rate limiting available
- **Protection**: Prevents brute force attacks and abuse

## API Endpoints

### Authentication Endpoints

#### 1. User Registration
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "StrongPass123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_expires_in": 2592000,
  "user_id": 1,
  "email": "user@example.com",
  "username": "username"
}
```

#### 2. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Response:** Same as signup response

#### 3. Token Refresh
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 4. User Logout
```http
POST /auth/logout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

#### 5. Get Current User
```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "is_active": true,
  "is_verified": false,
  "is_admin": false,
  "tenant_id": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

#### 6. Change Password
```http
POST /auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "current_password": "StrongPass123!",
  "new_password": "NewStrongPass456!"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

#### 7. Request Password Reset
```http
POST /auth/request-password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If the email exists, a reset link has been sent"
}
```

#### 8. Confirm Password Reset
```http
POST /auth/confirm-password-reset
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "NewStrongPass456!"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

### Protected Routes

#### 1. Basic Protected Route
```http
GET /protected
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "This is a protected route",
  "status": "authenticated"
}
```

#### 2. Admin Route
```http
GET /admin
Authorization: Bearer <admin_access_token>
```

**Response:**
```json
{
  "message": "This is an admin route",
  "status": "admin_authenticated"
}
```

#### 3. User Profile Route
```http
GET /user/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "User profile route",
  "status": "active_user_required"
}
```

## Middleware and Security

### Authentication Middleware

The system provides several levels of authentication middleware:

```python
from app.auth.middleware import (
    get_current_user,
    get_current_active_user,
    get_current_verified_user,
    get_current_admin_user,
    require_auth,
    require_active_user,
    require_verified_user,
    require_admin
)

# Basic authentication
@app.get("/protected", dependencies=[Depends(require_auth())])
async def protected_route():
    return {"message": "Protected route"}

# Active user required
@app.get("/active", dependencies=[Depends(require_active_user())])
async def active_route():
    return {"message": "Active user route"}

# Admin privileges required
@app.get("/admin", dependencies=[Depends(require_admin())])
async def admin_route():
    return {"message": "Admin route"}
```

### Security Headers

The system automatically adds security headers to all responses:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy`: Comprehensive CSP policy

### CORS Configuration

CORS is configured to allow frontend communication:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_settings().allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Configuration

### Environment Variables

Key authentication configuration:

```env
# JWT Configuration
SECRET_KEY=your-super-secret-production-key-here-make-it-very-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# Security
DEBUG=false
ENVIRONMENT=production

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=900
```

### Database Models

#### User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Profile fields
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)
    
    # Status fields
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
```

#### RefreshToken Model
```python
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(String(32), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Token metadata
    is_revoked = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # OAuth2 support
    client_id = Column(String(100), nullable=True)
    scope = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="refresh_tokens")
```

## Testing

### Running Tests

```bash
# Run all authentication tests
cd backend
pytest tests/test_auth.py -v

# Run specific test class
pytest tests/test_auth.py::TestUserRegistration -v

# Run with coverage
pytest tests/test_auth.py --cov=app.auth --cov-report=html
```

### Test Coverage

The test suite covers:
-  Password strength validation
-  User registration and validation
-  User authentication and login
-  Token refresh functionality
-  Protected route access
-  Role-based access control
-  Password change functionality
-  Rate limiting
-  Error handling

## OAuth2 Integration (Future)

### Planned OAuth2 Providers
- **Google OAuth2**: Sign in with Google accounts
- **Microsoft OAuth2**: Sign in with Microsoft accounts
- **GitHub OAuth2**: Sign in with GitHub accounts

### OAuth2 Endpoints (Placeholder)
```http
GET /auth/oauth2/authorize
POST /auth/oauth2/token
```

### OAuth2 Flow
1. User initiates OAuth2 flow
2. Redirect to provider (Google/Microsoft)
3. User authenticates with provider
4. Provider redirects back with authorization code
5. Exchange code for access token
6. Create or link local user account
7. Return JWT tokens

## Security Best Practices

### 1. Token Management
- **Store securely**: Never store tokens in localStorage (use httpOnly cookies)
- **Rotate regularly**: Refresh tokens automatically
- **Revoke on logout**: Always revoke refresh tokens
- **Monitor usage**: Track token usage for anomalies

### 2. Password Security
- **Strong requirements**: Enforce password complexity
- **Secure hashing**: Use bcrypt with appropriate cost factor
- **No plaintext**: Never log or store plaintext passwords
- **Regular updates**: Encourage password changes

### 3. Rate Limiting
- **Per-endpoint limits**: Different limits for different operations
- **IP-based tracking**: Track requests by client IP
- **Configurable windows**: Adjustable time windows
- **Graceful degradation**: Return 429 with retry-after header

### 4. Error Handling
- **Generic messages**: Don't reveal user existence
- **Proper status codes**: Use appropriate HTTP status codes
- **Logging**: Log security events for monitoring
- **User feedback**: Clear, actionable error messages

## Usage Examples

### Frontend Integration

#### React/Next.js Example
```typescript
import { useState } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTokens(data);
        setUser({ id: data.user_id, email: data.email, username: data.username });
        
        // Store tokens securely (httpOnly cookies recommended)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.detail };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens?.access_token}`,
        },
        body: JSON.stringify({ refresh_token: tokens?.refresh_token }),
      });
    } finally {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: tokens?.refresh_token }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setTokens(prev => ({ ...prev, access_token: data.access_token }));
        localStorage.setItem('access_token', data.access_token);
        return { success: true };
      } else {
        // Refresh failed, redirect to login
        logout();
        return { success: false };
      }
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  return { user, login, logout, refreshToken };
};
```

#### Protected Route Component
```typescript
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, refreshToken } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        // Try to refresh token
        const result = await refreshToken();
        if (!result.success) {
          window.location.href = '/login';
          return;
        }
      }
      
      if (requireAdmin && user && !user.is_admin) {
        window.location.href = '/unauthorized';
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [user, requireAdmin, refreshToken]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
};
```

### API Client Example

#### Python Requests Example
```python
import requests
import json

class VasenvoltAPI:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
    
    def login(self, email, password):
        """Login and get tokens."""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
            self.refresh_token = data["refresh_token"]
            return True
        return False
    
    def get_headers(self):
        """Get headers with authentication."""
        if not self.access_token:
            raise Exception("Not authenticated")
        return {"Authorization": f"Bearer {self.access_token}"}
    
    def get_user_info(self):
        """Get current user information."""
        response = requests.get(
            f"{self.base_url}/auth/me",
            headers=self.get_headers()
        )
        return response.json()
    
    def change_password(self, current_password, new_password):
        """Change user password."""
        response = requests.post(
            f"{self.base_url}/auth/change-password",
            headers=self.get_headers(),
            json={
                "current_password": current_password,
                "new_password": new_password
            }
        )
        return response.json()

# Usage
api = VasenvoltAPI()
if api.login("user@example.com", "password123"):
    user_info = api.get_user_info()
    print(f"Logged in as: {user_info['username']}")
```

## Troubleshooting

### Common Issues

#### 1. Token Expired
**Error**: `Invalid or expired access token`
**Solution**: Use refresh token to get new access token

#### 2. Invalid Password
**Error**: `Password must be at least 8 characters long`
**Solution**: Ensure password meets all requirements

#### 3. Rate Limited
**Error**: `Too many requests. Please try again later.`
**Solution**: Wait before making more requests

#### 4. CORS Issues
**Error**: CORS policy blocking requests
**Solution**: Check CORS configuration in settings

### Debug Mode

Enable debug mode for detailed error messages:

```env
DEBUG=true
ENVIRONMENT=development
```

### Logging

Check logs for authentication events:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Performance Considerations

### Database Optimization
- **Indexes**: Ensure proper indexes on email, username, and token fields
- **Connection pooling**: Configure appropriate pool sizes
- **Query optimization**: Use efficient queries for token validation

### Token Validation
- **Caching**: Cache user information to reduce database queries
- **Async processing**: Use async/await for non-blocking operations
- **Batch operations**: Group database operations where possible

### Rate Limiting
- **Redis backend**: Use Redis for distributed rate limiting
- **Sliding windows**: Implement sliding window rate limiting
- **Per-user limits**: Consider per-user rate limiting for sensitive operations

## Future Enhancements

### Planned Features
- **Multi-factor authentication** (MFA)
- **Social login integration** (Google, Microsoft, GitHub)
- **Single sign-on** (SSO) support
- **API key management** for service accounts
- **Audit logging** for security events
- **Advanced role-based access control** (RBAC)

### Security Improvements
- **Token rotation**: Automatic token rotation
- **Device tracking**: Track and manage device sessions
- **Geolocation restrictions**: Limit access by location
- **Behavioral analysis**: Detect suspicious login patterns

---

## Support

For questions or issues with the authentication system:

1. **Check the logs** for detailed error messages
2. **Review this documentation** for usage examples
3. **Run the test suite** to verify functionality
4. **Check configuration** for environment variables
5. **Verify database** connection and schema

The authentication system is designed to be secure, scalable, and easy to use. Follow the security best practices and test thoroughly before deploying to production.
