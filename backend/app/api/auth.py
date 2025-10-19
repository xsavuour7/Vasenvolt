from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone, timedelta
from app.database import get_db
from app.models import User, RefreshToken
from app.schemas.auth import (
    LoginRequest, SignupRequest, TokenResponse, RefreshTokenRequest,
    RefreshTokenResponse, LogoutRequest, LogoutResponse,
    PasswordChangeRequest, PasswordResetRequest, PasswordResetConfirm
)
from app.schemas.user import UserCreate, User as UserSchema
from app.auth.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, verify_token, generate_refresh_token_id
)
from app.auth.middleware import get_current_user, rate_limit_middleware
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post(
    "/signup", 
    response_model=TokenResponse,
    summary="User Registration",
    description="Create a new user account and receive authentication tokens",
    responses={
        201: {
            "description": "User successfully created",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "expires_in": 3600,
                        "refresh_expires_in": 2592000,
                        "user_id": 123,
                        "email": "newuser@example.com",
                        "username": "johndoe"
                    }
                }
            }
        },
        400: {
            "description": "Bad Request - Email already registered or username taken",
            "content": {
                "application/json": {
                    "example": {"detail": "Email already registered"}
                }
            }
        },
        422: {
            "description": "Validation Error - Invalid input data",
            "content": {
                "application/json": {
                    "example": {
                        "detail": [
                            {
                                "loc": ["body", "password"],
                                "msg": "Password must contain uppercase, lowercase, number, and special character",
                                "type": "value_error"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def signup(
    user_data: SignupRequest, 
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Create a new user account and return authentication tokens.
    
    **Requirements:**
    - Password must be at least 8 characters
    - Password must contain uppercase, lowercase, number, and special character
    - Email must be unique
    - Username must be unique (3-50 characters)
    
    **Returns:**
    - Access token (expires in 1 hour)
    - Refresh token (expires in 30 days)
    - User information
    """
    # Rate limiting
    if request:
        await rate_limit_middleware(request)
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        is_active=True,
        is_verified=False,  # Email verification required
        is_admin=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(db_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(db_user.id)})
    
    # Store refresh token in database
    token_id = generate_refresh_token_id()
    refresh_token_record = RefreshToken(
        token_id=token_id,
        user_id=db_user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    db.add(refresh_token_record)
    db.commit()
    
    logger.info(f"New user registered: {db_user.email}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=3600,  # 1 hour
        refresh_expires_in=2592000,  # 30 days
        user_id=db_user.id,
        email=db_user.email,
        username=db_user.username
    )

@router.post(
    "/login", 
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticate user and receive authentication tokens",
    responses={
        200: {
            "description": "Login successful",
            "content": {
                "application/json": {
                    "example": {
                        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        "token_type": "bearer",
                        "expires_in": 3600,
                        "refresh_expires_in": 2592000,
                        "user_id": 123,
                        "email": "user@example.com",
                        "username": "johndoe"
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized - Invalid credentials",
            "content": {
                "application/json": {
                    "example": {"detail": "Incorrect email or password"}
                }
            }
        },
        400: {
            "description": "Bad Request - Account deactivated",
            "content": {
                "application/json": {
                    "example": {"detail": "User account is deactivated"}
                }
            }
        }
    }
)
async def login(
    login_data: LoginRequest, 
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Authenticate user and return access and refresh tokens.
    
    **Requirements:**
    - Valid email and password
    - User account must be active
    
    **Returns:**
    - Access token (expires in 1 hour)
    - Refresh token (expires in 30 days)
    - User information
    """
    # Rate limiting
    if request:
        await rate_limit_middleware(request)
    
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Store refresh token in database
    token_id = generate_refresh_token_id()
    refresh_token_record = RefreshToken(
        token_id=token_id,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    db.add(refresh_token_record)
    db.commit()
    
    logger.info(f"User logged in: {user.email}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=3600,  # 1 hour
        refresh_expires_in=2592000,  # 30 days
        user_id=user.id,
        email=user.email,
        username=user.username
    )

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Generate new access token from refresh token.
    
    Requirements:
    - Valid refresh token
    - Token not expired or revoked
    """
    # Rate limiting
    if request:
        await rate_limit_middleware(request)
    
    # Verify refresh token
    payload = verify_token(refresh_data.refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Check if user exists and is active
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    logger.info(f"Token refreshed for user: {user.email}")
    
    return RefreshTokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=3600  # 1 hour
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout user and revoke refresh token.
    
    Requirements:
    - Valid access token
    - Valid refresh token to revoke
    """
    # Find and revoke refresh token
    refresh_token_record = db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.is_revoked == False
    ).first()
    
    if refresh_token_record:
        refresh_token_record.revoke()
        db.commit()
    
    logger.info(f"User logged out: {current_user.email}")
    
    return LogoutResponse(
        message="Successfully logged out"
    )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password.
    
    Requirements:
    - Valid access token
    - Correct current password
    - Strong new password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash new password
    new_hashed_password = get_password_hash(password_data.new_password)
    current_user.hashed_password = new_hashed_password
    
    # Revoke all refresh tokens (force re-login)
    refresh_tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == current_user.id,
        RefreshToken.is_revoked == False
    ).all()
    
    for token in refresh_tokens:
        token.revoke()
    
    db.commit()
    
    logger.info(f"Password changed for user: {current_user.email}")
    
    return {"message": "Password changed successfully"}

@router.post("/request-password-reset")
async def request_password_reset(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Request password reset (sends email with reset token).
    
    Requirements:
    - Valid email address
    - User account exists
    """
    # Rate limiting
    if request:
        await rate_limit_middleware(request)
    
    # Find user by email
    user = db.query(User).filter(User.email == reset_data.email).first()
    if not user:
        # Don't reveal if user exists
        return {"message": "If the email exists, a reset link has been sent"}
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated"
        )
    
    # TODO: Implement email sending with reset token
    # For now, just return success message
    
    logger.info(f"Password reset requested for user: {user.email}")
    
    return {"message": "If the email exists, a reset link has been sent"}

@router.post("/confirm-password-reset")
async def confirm_password_reset(
    confirm_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm password reset with token.
    
    Requirements:
    - Valid reset token
    - Strong new password
    """
    # TODO: Implement token verification
    # For now, just return success message
    
    return {"message": "Password reset successful"}

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information.
    
    Requirements:
    - Valid access token
    """
    return current_user

@router.get("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify user email address.
    
    Requirements:
    - Valid verification token
    """
    # TODO: Implement email verification
    # For now, just return success message
    
    return {"message": "Email verified successfully"}

# OAuth2 endpoints for future implementation
@router.get("/oauth2/authorize")
async def oauth2_authorize():
    """
    OAuth2 authorization endpoint.
    Future implementation for Google/Microsoft login.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="OAuth2 not yet implemented"
    )

@router.post("/oauth2/token")
async def oauth2_token():
    """
    OAuth2 token endpoint.
    Future implementation for Google/Microsoft login.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="OAuth2 not yet implemented"
    )
