"""NL-to-SQL pipeline — POST /query/

Pipeline (each gate must pass before the next runs):
  1. JWT auth       — get_current_user dependency; 401 if missing/invalid
  2. Role from JWT  — never trusted from request body
  3. Intent check   — blocks dangerous NL questions before the LLM call
  4. LLM generation — Groq API
  5. SQL validation — structural safety check on generated output
  6. RBAC check     — table-level access per role
  7. SQL execution  — SQLite
"""

from typing import Annotated

from fastapi import APIRouter, Depends

from backend.models.request_models import QueryRequest, QueryResponse
from backend.services.auth_service import get_current_user
from backend.services.llm_service import generate_sql_with_ai
from backend.services.role_service import normalize_role
from backend.services.sql_service import run_sql_query
from backend.services.validation_service import (
    validate_question_intent,
    validate_sql,
    validate_role_permissions,
)
from backend.utils.helpers import log_request


router = APIRouter(prefix="/query", tags=["Query"])


@router.post("/", response_model=QueryResponse)
def nl_to_sql_query(
    request: QueryRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> QueryResponse:
    # Role comes exclusively from the verified JWT — request body role is ignored.
    jwt_role: str = current_user.get("role", "")
    role: str = normalize_role(jwt_role) or jwt_role.strip().lower() or jwt_role

    log_request(question=request.question, role=role)  # audit before any gate

    # Gate 1: intent — deterministic phrase scan, immune to prompt injection
    intent_valid, intent_error = validate_question_intent(request.question)
    if not intent_valid:
        return QueryResponse(
            question=request.question,
            generated_sql="",
            results=[],
            explanation="Request blocked at intent validation before SQL generation.",
            error=f"Dangerous intent detected: {intent_error}",
        )

    # Gate 2: LLM generation
    generated_sql: str = generate_sql_with_ai(request.question, role)

    # Gate 3: SQL structural validation
    is_sql_valid, sql_error = validate_sql(generated_sql)
    if not is_sql_valid:
        return QueryResponse(
            question=request.question,
            generated_sql=generated_sql,
            results=[],
            explanation="",
            error=f"SQL validation failed: {sql_error}",
        )

    # Gate 4: RBAC — table-level access
    is_permitted, rbac_error = validate_role_permissions(role=role, sql=generated_sql)
    if not is_permitted:
        return QueryResponse(
            question=request.question,
            generated_sql=generated_sql,
            results=[],
            explanation="",
            error=f"Access denied for role '{role}': {rbac_error}",
        )

    # Execute
    results, db_error = run_sql_query(generated_sql)
    return QueryResponse(
        question=request.question,
        generated_sql=generated_sql,
        results=results,
        explanation="Query generated and executed successfully." if db_error is None else "",
        error=db_error,
    )
