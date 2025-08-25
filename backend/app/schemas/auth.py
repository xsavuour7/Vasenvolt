from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

class SignupRequest(BaseModel):
    email: str = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username (3-50 characters)")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    @validator('password')
    def validate_password_strength(cls, v):
        from app.auth.security import is_password_strong
        is_strong, message = is_password_strong(v)
        if not is_strong:
            raise ValueError(message)
        return v

class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Access token expiry in seconds")
    refresh_expires_in: int = Field(..., description="Refresh token expiry in seconds")
    user_id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    username: str = Field(..., description="Username")

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="JWT refresh token")

class RefreshTokenResponse(BaseModel):
    access_token: str = Field(..., description="New JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Access token expiry in seconds")

class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., description="JWT refresh token to revoke")

class LogoutResponse(BaseModel):
    message: str = Field(..., description="Logout confirmation message")

class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")
    
    @validator('new_password')
    def validate_new_password_strength(cls, v):
        from app.auth.security import is_password_strong
        is_strong, message = is_password_strong(v)
        if not is_strong:
            raise ValueError(message)
        return v

class PasswordResetRequest(BaseModel):
    email: str = Field(..., description="User email address for password reset")

class PasswordResetConfirm(BaseModel):
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")
    
    @validator('new_password')
    def validate_new_password_strength(cls, v):
        from app.auth.security import is_password_strong
        is_strong, message = is_password_strong(v)
        if not is_strong:
            raise ValueError(message)
        return v

# OAuth2 schemas for future implementation
class OAuth2AuthorizationRequest(BaseModel):
    response_type: str = Field(..., description="OAuth2 response type (code, token)")
    client_id: str = Field(..., description="OAuth2 client ID")
    redirect_uri: str = Field(..., description="OAuth2 redirect URI")
    scope: Optional[str] = Field(None, description="OAuth2 scopes")
    state: Optional[str] = Field(None, description="OAuth2 state parameter")

class OAuth2TokenRequest(BaseModel):
    grant_type: str = Field(..., description="OAuth2 grant type")
    client_id: str = Field(..., description="OAuth2 client ID")
    client_secret: str = Field(..., description="OAuth2 client secret")
    code: Optional[str] = Field(None, description="Authorization code")
    redirect_uri: Optional[str] = Field(None, description="OAuth2 redirect URI")
    refresh_token: Optional[str] = Field(None, description="OAuth2 refresh token")

class OAuth2TokenResponse(BaseModel):
    access_token: str = Field(..., description="OAuth2 access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiry in seconds")
    refresh_token: Optional[str] = Field(None, description="OAuth2 refresh token")
    scope: Optional[str] = Field(None, description="OAuth2 scopes")
