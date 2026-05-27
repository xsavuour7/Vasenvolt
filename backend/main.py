from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import auth, telemetry, metrics, meters, sites
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.auth.middleware import security_headers_middleware, require_auth, require_admin, require_active_user
from config import settings
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vasenvolt API",
    description="""
    ## Vasenvolt Energy Management API
    
    A comprehensive energy management system built with FastAPI featuring:
    
    * **User Registration & Login** - Secure user account management
    * **JWT Token Authentication** - Access and refresh token system
    * **Password Management** - Change password and reset functionality
    * **Email Verification** - Account verification system
    * **Rate Limiting** - Built-in protection against abuse
    * **Telemetry Ingestion** - Real-time energy consumption data collection
    * **Time-Series Analytics** - Energy data analysis and reporting
    * **OAuth2 Support** - Future integration with Google/Microsoft (coming soon)
    
    ### Authentication
    
    Most endpoints require authentication using Bearer tokens:
    
    ```
    Authorization: Bearer <your_access_token>
    ```
    
    Get your access token by calling the `/auth/login` endpoint.
    
    ### Telemetry Data
    
    The telemetry endpoints allow you to:
    - Submit energy consumption data from IoT devices
    - Query historical telemetry records
    - Get aggregated statistics and analytics
    - Import bulk data from CSV files
    """,
    version="1.0.0",
    contact={
        "name": "Vasenvolt API Support",
        "email": "support@vasenvolt.com",
    },
    license_info={
        "name": "MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.vasenvolt.com",
            "description": "Production server"
        }
    ]
)

# Get CORS settings
cors_settings = settings.get_cors_settings()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
app.middleware("http")(security_headers_middleware)

# Include API routers
app.include_router(auth.router)
app.include_router(telemetry.router)
app.include_router(metrics.router)
app.include_router(meters.router)
app.include_router(sites.router)

@app.get(
    "/",
    summary="API Status",
    description="Check if the API is running",
    tags=["Status"],
    responses={
        200: {
            "description": "API is running",
            "content": {
                "application/json": {
                    "example": {"message": "Vasenvolt API is running"}
                }
            }
        }
    }
)
async def root():
    """Get API status message."""
    return {"message": "Vasenvolt API is running"}

@app.get(
    "/health",
    summary="Health Check",
    description="Basic health check endpoint",
    tags=["Status"],
    responses={
        200: {
            "description": "Service is healthy",
            "content": {
                "application/json": {
                    "example": {"status": "healthy", "service": "vasenvolt-api"}
                }
            }
        }
    }
)
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "service": "vasenvolt-api"}

@app.get(
    "/health/db",
    summary="Database Health Check",
    description="Check database connection and return detailed status",
    tags=["Status"],
    responses={
        200: {
            "description": "Database is healthy",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "database": "connected",
                        "tables": {
                            "users": 5,
                            "tenants": 2,
                            "sites": 10,
                            "meters": 25
                        }
                    }
                }
            }
        },
        503: {
            "description": "Database connection failed",
            "content": {
                "application/json": {
                    "example": {"detail": "Database connection failed: Connection refused"}
                }
            }
        }
    }
)
async def database_health_check(db: Session = Depends(get_db)):
    """Check database connection and return detailed status including table counts."""
    try:
        # Test database connection with a simple query
        result = db.execute("SELECT 1")
        result.fetchone()
        
        # Get table count
        from app.models import User, Tenant, Site, Meter
        user_count = db.query(User).count()
        tenant_count = db.query(Tenant).count()
        site_count = db.query(Site).count()
        meter_count = db.query(Meter).count()
        
        return {
            "status": "healthy",
            "database": "connected",
            "tables": {
                "users": user_count,
                "tenants": tenant_count,
                "sites": site_count,
                "meters": meter_count
            }
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(e)}"
        )

# Protected route examples
@app.get("/protected", dependencies=[require_auth()])
async def protected_route():
    """Example protected route that requires authentication."""
    return {"message": "This is a protected route", "status": "authenticated"}

@app.get("/admin", dependencies=[require_admin()])
async def admin_route():
    """Example admin route that requires admin privileges."""
    return {"message": "This is an admin route", "status": "admin_authenticated"}

@app.get("/user/profile", dependencies=[require_active_user()])
async def user_profile():
    """Example route that requires active user status."""
    return {"message": "User profile route", "status": "active_user_required"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
