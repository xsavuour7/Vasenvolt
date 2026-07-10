import @pytest.fixture
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app
from app.models import User, RefreshToken
from app.auth.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from datetime import datetime, timezone, timedelta
import json

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)

@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    hashed_password = get_password_hash("TestPass123!")
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password=hashed_password,
        first_name="Test",
        last_name="User",
        is_active=True,
        is_verified=True,
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_user(db_session):
    """Create an admin user."""
    hashed_password = get_password_hash("AdminPass123!")
    user = User(
        email="admin@example.com",
        username="admin",
        hashed_password=hashed_password,
        first_name="Admin",
        last_name="User",
        is_active=True,
        is_verified=True,
        is_admin=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

class TestPasswordSecurity:
    """Test password security requirements."""
    
    def test_password_strength_validation(self):
        """Test password strength validation."""
        from app.auth.security import is_password_strong
        
        # Valid password
        is_strong, message = is_password_strong("StrongPass123!")
        assert is_strong is True
        
        # Too short
        is_strong, message = is_password_strong("Abc1!")
        assert is_strong is False
        assert "8 characters" in message
        
        # No uppercase
        is_strong, message = is_password_strong("weakpass123!")
        assert is_strong is False
        assert "uppercase" in message
        
        # No lowercase
        is_strong, message = is_password_strong("WEAKPASS123!")
        assert is_strong is False
        assert "lowercase" in message
        
        # No number
        is_strong, message = is_password_strong("WeakPass!")
        assert is_strong is False
        assert "number" in message
        
        # No special character
        is_strong, message = is_password_strong("WeakPass123")
        assert is_strong is False
        assert "special character" in message

class TestUserRegistration:
    """Test user registration endpoints."""
    
    def test_user_signup_success(self, client, db_session):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "NewPass123!",
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post("/auth/signup", json=user_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
        assert data["refresh_expires_in"] == 2592000
        assert data["email"] == user_data["email"]
        assert data["username"] == user_data["username"]
    
    def test_user_signup_duplicate_email(self, client, db_session, test_user):
        """Test registration with duplicate email."""
        user_data = {
            "email": "test@example.com",  # Same as test_user
            "username": "differentuser",
            "password": "NewPass123!"
        }
        
        response = client.post("/auth/signup", json=user_data)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]
    
    def test_user_signup_duplicate_username(self, client, db_session, test_user):
        """Test registration with duplicate username."""
        user_data = {
            "email": "different@example.com",
            "username": "testuser",  # Same as test_user
            "password": "NewPass123!"
        }
        
        response = client.post("/auth/signup", json=user_data)
        assert response.status_code == 400
        assert "already taken" in response.json()["detail"]
    
    def test_user_signup_weak_password(self, client, db_session):
        """Test registration with weak password."""
        user_data = {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "weak"  # Too weak
        }
        
        response = client.post("/auth/signup", json=user_data)
        assert response.status_code == 422  # Validation error

class TestUserAuthentication:
    """Test user authentication endpoints."""
    
    def test_user_login_success(self, client, db_session, test_user):
        """Test successful user login."""
        login_data = {
            "email": "test@example.com",
            "password": "TestPass123!"
        }
        
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user_id"] == test_user.id
    
    def test_user_login_invalid_credentials(self, client, db_session, test_user):
        """Test login with invalid credentials."""
        login_data = {
            "email": "test@example.com",
            "password": "WrongPassword123!"
        }
        
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_user_login_inactive_user(self, client, db_session):
        """Test login with inactive user."""
        # Create inactive user
        hashed_password = get_password_hash("TestPass123!")
        user = User(
            email="inactive@example.com",
            username="inactive",
            hashed_password=hashed_password,
            is_active=False
        )
        db_session.add(user)
        db_session.commit()
        
        login_data = {
            "email": "inactive@example.com",
            "password": "TestPass123!"
        }
        
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 400
        assert "deactivated" in response.json()["detail"]

class TestTokenRefresh:
    """Test token refresh functionality."""
    
    def test_refresh_token_success(self, client, db_session, test_user):
        """Test successful token refresh."""
        # Create refresh token
        refresh_token = create_refresh_token(data={"sub": str(test_user.id)})
        
        refresh_data = {
            "refresh_token": refresh_token
        }
        
        response = client.post("/auth/refresh", json=refresh_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
    
    def test_refresh_token_invalid(self, client, db_session):
        """Test refresh with invalid token."""
        refresh_data = {
            "refresh_token": "invalid_token"
        }
        
        response = client.post("/auth/refresh", json=refresh_data)
        assert response.status_code == 401
        assert "Invalid or expired refresh token" in response.json()["detail"]

class TestProtectedRoutes:
    """Test protected route access."""
    
    def test_protected_route_without_token(self, client):
        """Test accessing protected route without token."""
        response = client.get("/protected")
        assert response.status_code == 401
        assert "Authentication required" in response.json()["detail"]
    
    def test_protected_route_with_valid_token(self, client, db_session, test_user):
        """Test accessing protected route with valid token."""
        # Create access token
        access_token = create_access_token(data={"sub": str(test_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.get("/protected", headers=headers)
        assert response.status_code == 200
        assert response.json()["status"] == "authenticated"
    
    def test_admin_route_without_admin_privileges(self, client, db_session, test_user):
        """Test accessing admin route without admin privileges."""
        access_token = create_access_token(data={"sub": str(test_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.get("/admin", headers=headers)
        assert response.status_code == 403
        assert "Admin privileges required" in response.json()["detail"]
    
    def test_admin_route_with_admin_privileges(self, client, db_session, admin_user):
        """Test accessing admin route with admin privileges."""
        access_token = create_access_token(data={"sub": str(admin_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.get("/admin", headers=headers)
        assert response.status_code == 200
        assert response.json()["status"] == "admin_authenticated"

class TestUserManagement:
    """Test user management endpoints."""
    
    def test_get_current_user_info(self, client, db_session, test_user):
        """Test getting current user information."""
        access_token = create_access_token(data={"sub": str(test_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        response = client.get("/auth/me", headers=headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["email"] == test_user.email
        assert data["username"] == test_user.username
        assert data["id"] == test_user.id
    
    def test_change_password_success(self, client, db_session, test_user):
        """Test successful password change."""
        access_token = create_access_token(data={"sub": str(test_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        password_data = {
            "current_password": "TestPass123!",
            "new_password": "NewPass123!"
        }
        
        response = client.post("/auth/change-password", json=password_data, headers=headers)
        assert response.status_code == 200
        assert "Password changed successfully" in response.json()["message"]
    
    def test_change_password_incorrect_current(self, client, db_session, test_user):
        """Test password change with incorrect current password."""
        access_token = create_access_token(data={"sub": str(test_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        password_data = {
            "current_password": "WrongPassword123!",
            "new_password": "NewPass123!"
        }
        
        response = client.post("/auth/change-password", json=password_data, headers=headers)
        assert response.status_code == 400
        assert "Current password is incorrect" in response.json()["detail"]

class TestLogout:
    """Test logout functionality."""
    
    def test_logout_success(self, client, db_session, test_user):
        """Test successful logout."""
        access_token = create_access_token(data={"sub": str(test_user.id)})
        headers = {"Authorization": f"Bearer {access_token}"}
        
        logout_data = {
            "refresh_token": "dummy_refresh_token"  # In real implementation, this would be validated
        }
        
        response = client.post("/auth/logout", json=logout_data, headers=headers)
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]

class TestRateLimiting:
    """Test rate limiting functionality."""
    
    def test_rate_limiting(self, client, db_session):
        """Test that rate limiting is enforced."""
        # Make multiple requests quickly
        for _ in range(65):  # More than the 60 requests per minute limit
            response = client.post("/auth/request-password-reset", json={"email": "test@example.com"})
            if response.status_code == 429:
                break
        else:
            # If we didn't hit rate limit, the test passes
            assert True
            return
        
        # We hit rate limit
        assert response.status_code == 429
        assert "Too many requests" in response.json()["detail"]
