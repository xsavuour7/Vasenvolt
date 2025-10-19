from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User email address", example="user@example.com")
    username: str = Field(..., min_length=3, max_length=50, description="Username (3-50 characters)", example="johndoe")
    first_name: Optional[str] = Field(None, max_length=100, description="First name", example="John")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name", example="Doe")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number", example="+1234567890")
    avatar_url: Optional[str] = Field(None, description="Avatar image URL", example="https://example.com/avatar.jpg")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)", example="SecurePass123!")
    
    @validator('password')
    def validate_password_strength(cls, v):
        from app.auth.security import is_password_strong
        is_strong, message = is_password_strong(v)
        if not is_strong:
            raise ValueError(message)
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, description="User email address")
    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    first_name: Optional[str] = Field(None, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    avatar_url: Optional[str] = Field(None, description="Avatar image URL")
    is_active: Optional[bool] = Field(None, description="User active status")
    is_verified: Optional[bool] = Field(None, description="Email verification status")
    is_admin: Optional[bool] = Field(None, description="Admin privileges")

class UserInDB(UserBase):
    id: int = Field(..., description="User ID")
    is_active: bool = Field(..., description="User active status")
    is_verified: bool = Field(..., description="Email verification status")
    is_admin: bool = Field(..., description="Admin privileges")
    tenant_id: Optional[int] = Field(None, description="Associated tenant ID")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        from_attributes = True

class User(UserInDB):
    pass
