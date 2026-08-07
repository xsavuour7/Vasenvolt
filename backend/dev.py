#!/usr/bin/env python3
"""
Development script for Vasenvolt Backend
Sets up database and runs the FastAPI server
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"{description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"{description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 10):
        print("Python 3.10 or higher is required")
        sys.exit(1)
    print(f"Python {sys.version_info.major}.{sys.version_info.minor} detected")

def setup_virtual_environment():
    """Set up virtual environment if it doesn't exist."""
    venv_path = Path("venv")
    if not venv_path.exists():
        print("Creating virtual environment...")
        run_command("python -m venv venv", "Creating virtual environment")
    else:
        print("Virtual environment already exists")

def install_dependencies():
    """Install Python dependencies."""
    # Activate virtual environment and install dependencies
    if os.name == 'nt':  # Windows
        pip_cmd = "venv\\Scripts\\pip install -r requirements.txt"
    else:  # Unix/Linux/macOS
        pip_cmd = "venv/bin/pip install -r requirements.txt"
    
    run_command(pip_cmd, "Installing dependencies")

def setup_database():
    """Set up database tables."""
    print("Setting up database...")
    
    # Initialize database with tables and initial data
    try:
        from app.database_init import initialize_database
        success = initialize_database()
        if success:
            print("Database setup completed successfully")
        else:
            print("Database setup failed")
            return False
    except ImportError as e:
        print(f"Failed to import database initialization: {e}")
        return False
    
    return True

def start_server():
    """Start the FastAPI development server."""
    print("Starting FastAPI development server...")
    print("API documentation will be available at: http://localhost:8000/docs")
    print("Health check: http://localhost:8000/health")
    print("Press Ctrl+C to stop the server")
    
    if os.name == 'nt':  # Windows
        uvicorn_cmd = "venv\\Scripts\\uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    else:  # Unix/Linux/macOS
        uvicorn_cmd = "venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    
    try:
        subprocess.run(uvicorn_cmd, shell=True, check=True)
    except KeyboardInterrupt:
        print("Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Failed to start server: {e}")

def main():
    """Main development setup function."""
    print("Vasenvolt Backend Development Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Set up virtual environment
    setup_virtual_environment()
    
    # Install dependencies
    install_dependencies()
    
    # Set up database
    if not setup_database():
        print("Database setup failed. Please check your PostgreSQL connection and try again.")
        print("You can also run: npm run db:init")
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
