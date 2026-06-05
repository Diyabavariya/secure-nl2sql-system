"""Pydantic request/response schemas for the query API."""

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    """Natural-language question from the frontend. Role comes from the JWT, not here."""

    question: str = Field(
        ...,
        min_length=3,
        description="Natural-language question to translate to SQL",
        example="Show top customers by total orders",
    )


class QueryResponse(BaseModel):
    """Outgoing payload. Shape is always identical — error is None on success."""

    question: str
    generated_sql: str
    results: List[Any]
    explanation: str
    error: Optional[str] = None