"""
Database initialization script for Vasenvolt
Creates tables and inserts initial data
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.models import Tenant, User, Site, Meter, MeterType, MeterStatus, RefreshToken
from app.auth.security import get_password_hash
from config import settings
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    """Create all database tables."""
    try:
        engine = create_engine(settings.database_url)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to create tables: {e}")
        return False

def insert_initial_data():
    """Insert initial data into the database."""
    try:
        # Get database session
        engine = create_engine(settings.database_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Check if data already exists
        existing_tenant = db.query(Tenant).first()
        if existing_tenant:
            logger.info("ℹ️  Initial data already exists, skipping...")
            return True
        
        # Create default tenant
        default_tenant = Tenant(
            name="VasenVolt Default",
            slug="vasenvolt-default",
            description="Default tenant for VasenVolt system",
            is_active=True
        )
        db.add(default_tenant)
        db.commit()
        db.refresh(default_tenant)
        
        # Create admin user
        admin_user = User(
            email="admin@vasenvolt.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            first_name="System",
            last_name="Administrator",
            is_active=True,
            is_verified=True,
            is_admin=True,
            tenant_id=default_tenant.id
        )
        db.add(admin_user)
        
        # Create demo site
        demo_site = Site(
            name="Demo Site",
            slug="demo-site",
            description="Demonstration site for testing",
            address="123 Demo Street",
            city="Demo City",
            state="Demo State",
            country="Demo Country",
            postal_code="12345",
            latitude=40.7128,
            longitude=-74.0060,
            site_type="commercial",
            total_area=1000.0,
            is_active=True,
            tenant_id=default_tenant.id
        )
        db.add(demo_site)
        
        # Create demo meter
        demo_meter = Meter(
            name="Demo Electricity Meter",
            serial_number="DEMO-ELEC-001",
            model="SmartMeter Pro",
            manufacturer="VasenVolt",
            meter_type=MeterType.ELECTRICITY,
            status=MeterStatus.ACTIVE,
            voltage_rating=240.0,
            current_rating=100.0,
            power_rating=24000.0,
            accuracy_class="0.5",
            communication_protocol="MQTT",
            ip_address="192.168.1.100",
            port=1883,
            site_id=demo_site.id
        )
        db.add(demo_meter)
        
        db.commit()
        logger.info("✅ Initial data inserted successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to insert initial data: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def test_database_connection():
    """Test database connection and basic operations."""
    try:
        engine = create_engine(settings.database_url)
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            logger.info("✅ Database connection successful")
            
            # Test if tables exist
            tables = engine.table_names()
            logger.info(f"📋 Found tables: {', '.join(tables)}")
            
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        return False

def initialize_database():
    """Main function to initialize the database."""
    logger.info("🚀 Starting database initialization...")
    
    # Test connection first
    if not test_database_connection():
        return False
    
    # Create tables
    if not create_tables():
        return False
    
    # Insert initial data
    if not insert_initial_data():
        return False
    
    logger.info("🎉 Database initialization completed successfully!")
    return True

if __name__ == "__main__":
    initialize_database()
