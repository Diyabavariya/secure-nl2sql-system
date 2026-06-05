"""Authentication routes — POST /auth/register, POST /auth/login, GET /auth/me."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from backend.database.db import get_db_connection
from backend.models.auth_models import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserInfo,
)
from backend.services.auth_service import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from backend.services.role_service import normalize_role

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest) -> dict:
    """Create a new user account. Passwords are stored as bcrypt hashes."""
    canonical_role = normalize_role(body.role)
    if canonical_role is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Role '{body.role}' is not recognised. "
                   f"Valid roles: admin, finance, sales, marketing, inventory.",
        )

    hashed = hash_password(body.password)
    now = datetime.now(timezone.utc).isoformat()

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO users (email, hashed_password, role, created_at) VALUES (?, ?, ?, ?)",
            (body.email.strip().lower(), hashed, canonical_role, now),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )
    finally:
        conn.close()

    return {"message": "Account created successfully. You can now log in."}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    """Verify credentials and return a signed JWT.

    Both 'user not found' and 'wrong password' return 401 — intentionally
    ambiguous to prevent user enumeration attacks.
    """
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT email, hashed_password, role FROM users WHERE email = ?",
            (body.email.strip().lower(),),
        ).fetchone()
    finally:
        conn.close()

    # Single shared exception prevents timing-based user enumeration.
    _invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if row is None or not verify_password(body.password, row["hashed_password"]):
        raise _invalid

    token = create_access_token(email=row["email"], role=row["role"])
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserInfo(email=row["email"], role=row["role"]),
    )


@router.get("/me", response_model=UserInfo)
def me(current_user: Annotated[dict, Depends(get_current_user)]) -> UserInfo:
    """Return the authenticated user's email and role."""
    return UserInfo(email=current_user["email"], role=current_user["role"])
