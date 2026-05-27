#!/usr/bin/env python3
"""
Database migration script for Vasenvolt
Run with: python migrate.py [command]
"""

import sys
import os
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a shell command and handle errors."""
    print(f"{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"{description} completed successfully")
        if result.stdout.strip():
            print(f"Output: {result.stdout.strip()}")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"{description} failed: {e}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return None

def check_venv():
    """Check if virtual environment is activated."""
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("Virtual environment not detected. Please activate it first:")
        print("   Windows: venv\\Scripts\\activate")
        print("   Unix/macOS: source .venv/bin/activate")
        return False
    return True

def get_alembic_cmd():
    """Get the appropriate alembic command based on OS."""
    if os.name == 'nt':  # Windows
        return ".venv\\Scripts\\alembic"
    else:  # Unix/Linux/macOS
        return "venv/bin/alembic"

def create_initial_migration():
    """Create the initial migration."""
    alembic_cmd = get_alembic_cmd()
    return run_command(
        f"{alembic_cmd} revision --autogenerate -m 'Initial schema'",
        "Creating initial migration"
    )

def run_migrations():
    """Run all pending migrations."""
    alembic_cmd = get_alembic_cmd()
    return run_command(
        f"{alembic_cmd} upgrade head",
        "Running database migrations"
    )

def rollback_migration():
    """Rollback the last migration."""
    alembic_cmd = get_alembic_cmd()
    return run_command(
        f"{alembic_cmd} downgrade -1",
        "Rolling back last migration"
    )

def show_migration_history():
    """Show migration history."""
    alembic_cmd = get_alembic_cmd()
    return run_command(
        f"{alembic_cmd} history",
        "Showing migration history"
    )

def show_current_revision():
    """Show current database revision."""
    alembic_cmd = get_alembic_cmd()
    return run_command(
        f"{alembic_cmd} current",
        "Showing current revision"
    )

def initialize_database():
    """Initialize database with tables and initial data."""
    print("Initializing database...")
    
    # Import and run the initialization script
    try:
        from app.database_init import initialize_database as init_db
        success = init_db()
        if success:
            print("Database initialization completed")
        else:
            print("Database initialization failed")
        return success
    except ImportError as e:
        print(f"Failed to import database initialization: {e}")
        return False

def main():
    """Main migration function."""
    if len(sys.argv) < 2:
        print("Vasenvolt Database Migration Tool")
        print("=" * 40)
        print("Usage: python migrate.py [command]")
        print("\nAvailable commands:")
        print("  init        - Initialize database (create tables + initial data)")
        print("  migrate     - Run all pending migrations")
        print("  create      - Create new migration")
        print("  rollback    - Rollback last migration")
        print("  history     - Show migration history")
        print("  current     - Show current revision")
        print("  status      - Show migration status")
        print("\nExamples:")
        print("  python migrate.py init")
        print("  python migrate.py migrate")
        return
    
    command = sys.argv[1].lower()
    
    # Check virtual environment
    if not check_venv():
        return
    
    if command == "init":
        initialize_database()
    
    elif command == "migrate":
        run_migrations()
    
    elif command == "create":
        if len(sys.argv) < 3:
            print("Please provide a migration message: python migrate.py create 'Description'")
            return
        message = sys.argv[2]
        alembic_cmd = get_alembic_cmd()
        run_command(
            f"{alembic_cmd} revision --autogenerate -m '{message}'",
            f"Creating migration: {message}"
        )
    
    elif command == "rollback":
        rollback_migration()
    
    elif command == "history":
        show_migration_history()
    
    elif command == "current":
        show_current_revision()
    
    elif command == "status":
        alembic_cmd = get_alembic_cmd()
        run_command(
            f"{alembic_cmd} show",
            "Showing migration status"
        )
    
    else:
        print(f"Unknown command: {command}")
        print("Run 'python migrate.py' to see available commands")

if __name__ == "__main__":
    main()
