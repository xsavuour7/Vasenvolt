from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import auth
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.auth.middleware import security_headers_middleware
from config import settings
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vasenvolt API",
    description="Secure Authentication System API",
    version="1.0.0"
)

# Get CORS settings
cors_settings = settings.get_cors_settings()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
app.middleware("http")(security_headers_middleware)

# Include API routers
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Vasenvolt API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vasenvolt-api"}

@app.get("/health/db")
async def database_health_check(db: Session = Depends(get_db)):
    """Check database connection and return status."""
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
@app.get("/protected", dependencies=[Depends(auth.require_auth())])
async def protected_route():
    """Example protected route that requires authentication."""
    return {"message": "This is a protected route", "status": "authenticated"}

@app.get("/admin", dependencies=[Depends(auth.require_admin())])
async def admin_route():
    """Example admin route that requires admin privileges."""
    return {"message": "This is an admin route", "status": "admin_authenticated"}

@app.get("/user/profile", dependencies=[Depends(auth.require_active_user())])
async def user_profile():
    """Example route that requires active user status."""
    return {"message": "User profile route", "status": "active_user_required"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
