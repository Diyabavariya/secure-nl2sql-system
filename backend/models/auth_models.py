"""Pydantic schemas for the authentication endpoints."""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Payload for POST /auth/register."""

    email: str = Field(..., description="User e-mail address", example="alice@example.com")
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    role: str = Field(..., description="Role key (admin, finance, sales, marketing, inventory)", example="sales")


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    email: str = Field(..., example="alice@example.com")
    password: str = Field(..., example="supersecret")


class UserInfo(BaseModel):
    """Minimal user data returned inside token responses and /auth/me."""

    email: str
    role: str


class TokenResponse(BaseModel):
    """Returned on successful login."""

    access_token: str
    token_type: str = "bearer"
    user: UserInfo
