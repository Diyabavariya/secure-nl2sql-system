"""Metadata endpoints for frontend synchronisation."""

from fastapi import APIRouter

from backend.services.role_service import get_role_catalog


router = APIRouter(prefix="/meta", tags=["Meta"])


@router.get("/roles")
def read_role_catalog() -> dict:
    """Return the full role catalog so the frontend stays in sync with backend RBAC."""
    return {"roles": get_role_catalog()}