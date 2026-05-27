#!/usr/bin/env python3
"""
Configuration validation script for Vasenvolt
Run this script to validate your environment configuration before starting the server
"""

import os
import sys
from pathlib import Path

def print_header(title):
    """Print a formatted header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_section(title):
    """Print a formatted section."""
    print(f"\n{'-'*40}")
    print(f"  {title}")
    print(f"{'-'*40}")

def check_environment_file():
    """Check if environment file exists."""
    app_env = os.getenv("APP_ENV", "development")
    env_file = f".env.{app_env}"
    
    print_section("Environment File Check")
    print(f"Looking for: {env_file}")
    
    if Path(env_file).exists():
        print(f"Found: {env_file}")
        return True
    else:
        print(f"Missing: {env_file}")
        print(f"Copy from: env.{app_env}")
        return False

def check_environment_variable():
    """Check if APP_ENV is set."""
    print_section("Environment Variable Check")
    
    app_env = os.getenv("APP_ENV", "development")
    print(f"APP_ENV: {app_env}")
    
    if app_env in ["development", "production", "test"]:
        print(f"Valid environment: {app_env}")
        return True
    else:
        print(f"Unknown environment: {app_env}")
        print("Valid values: development, production, test")
        return False

def validate_configuration():
    """Validate the configuration by importing it."""
    print_section("Configuration Validation")
    
    try:
        # Add current directory to Python path
        sys.path.insert(0, os.getcwd())
        
        # Try to import and validate configuration
        from config import settings
        print("Configuration loaded successfully")
        
        # Test specific settings
        print(f"Environment: {settings.environment}")
        print(f"Debug mode: {settings.debug}")
        print(f"Database: {settings.database_url[:50]}...")
        print(f"Secret key length: {len(settings.secret_key)}")
        print(f"Frontend URL: {settings.frontend_url}")
        print(f"CORS origins: {len(settings.allowed_origins)} origins")
        
        return True
        
    except ImportError as e:
        print(f"Import error: {e}")
        return False
    except Exception as e:
        print(f"Configuration error: {e}")
        return False

def check_database_connection():
    """Test database connection."""
    print_section("Database Connection Test")
    
    try:
        from config import settings
        from sqlalchemy import create_engine
        
        # Test connection
        engine = create_engine(settings.database_url)
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            result.fetchone()
            print("Database connection successful")
            return True
            
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False

def check_redis_connection():
    """Test Redis connection."""
    print_section("Redis Connection Test")
    
    try:
        from config import settings
        import redis
        
        # Test connection
        r = redis.from_url(settings.redis_url)
        r.ping()
        print("Redis connection successful")
        return True
        
    except ImportError:
        print("Redis not installed (optional)")
        return True
    except Exception as e:
        print(f"Redis connection failed: {e}")
        return False

def generate_secret_key():
    """Generate a secure secret key."""
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits + string.punctuation
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(64))
    return secret_key

def suggest_improvements():
    """Suggest configuration improvements."""
    print_section("Configuration Suggestions")
    
    try:
        from config import settings
        
        suggestions = []
        
        # Check secret key strength
        if len(settings.secret_key) < 64:
            suggestions.append("Consider using a longer SECRET_KEY (64+ characters)")
        
        # Check debug mode in production
        if settings.environment == "production" and settings.debug:
            suggestions.append("Disable DEBUG mode in production")
        
        # Check CORS origins
        if len(settings.allowed_origins) > 5:
            suggestions.append("Limit CORS origins for security")
        
        # Check database pool settings
        if settings.db_pool_size < 5:
            suggestions.append("Consider increasing database pool size for production")
        
        if suggestions:
            print("Suggestions for improvement:")
            for suggestion in suggestions:
                print(f"   {suggestion}")
        else:
            print("Configuration looks good!")
            
    except Exception as e:
        print(f"Could not analyze configuration: {e}")

def main():
    """Main validation function."""
    print_header("VasenVolt Configuration Validator")
    
    # Track validation results
    results = []
    
    # Check environment file
    results.append(check_environment_file())
    
    # Check environment variable
    results.append(check_environment_variable())
    
    # Validate configuration
    results.append(validate_configuration())
    
    # Test connections if configuration is valid
    if all(results):
        print_section("Connection Tests")
        
        # Test database
        results.append(check_database_connection())
        
        # Test Redis
        results.append(check_redis_connection())
    
    # Suggest improvements
    if all(results):
        suggest_improvements()
    
    # Summary
    print_header("Validation Summary")
    
    if all(results):
        print("All checks passed! Your configuration is ready.")
        print("You can now start the server with: npm run dev:backend")
    else:
        print("Some checks failed. Please fix the issues above.")
        print("Quick fixes:")
        print("   1. Copy env.development to .env.development")
        print("   2. Set APP_ENV=development")
        print("   3. Update database credentials")
        print("   4. Generate a strong SECRET_KEY")
        print("See ENVIRONMENT.md for detailed setup instructions.")
        
        # Offer to generate secret key
        print(f"Need a secret key? Here's a secure one:")
        print(f"   SECRET_KEY={generate_secret_key()}")
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
