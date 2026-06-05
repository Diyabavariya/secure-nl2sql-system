"""Three-gate validation pipeline: NL intent → SQL structure → RBAC."""

import re
import logging

from backend.services.role_service import is_role_allowed, get_allowed_tables

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


# DDL and admin keywords blocked regardless of role.
BLOCKED_KEYWORDS = [
    "DROP", "TRUNCATE", "ALTER", "CREATE",
    "ATTACH", "DETACH", "PRAGMA",
]

# Matched against the raw question BEFORE the LLM call — deterministic and
# immune to prompt injection (cannot be bypassed by rephrasing the question
# as an instruction to the model).
DANGEROUS_INTENT_PHRASES: list[str] = [
    # Deletion
    "delete all", "delete every", "delete the",
    "remove all", "remove every",
    "erase all", "erase every",
    "wipe all", "wipe the",
    "clear all", "clear the table",
    "purge all", "purge the",

    # Schema destruction
    "drop the table", "drop all tables", "drop table", "drop database",
    "truncate the", "truncate table",
    "destroy the", "destroy all",

    # Data modification
    "update all rows", "update every row",
    "set all", "overwrite all", "replace all",

    # Prompt injection / jailbreak
    "ignore previous instructions", "ignore all rules",
    "forget your instructions", "bypass security",
    "ignore the schema", "act as a different",
    "pretend you are", "you are now",
]


def validate_question_intent(question: str) -> tuple[bool, str | None]:
    """Gate 1: scan raw NL question for dangerous intent before calling the LLM.

    Case-insensitive substring match against DANGEROUS_INTENT_PHRASES.
    Returns (True, None) if safe, or (False, reason) on match.
    """
    if not question or not question.strip():
        return False, "Question is empty. Please provide a valid question."

    question_lower = question.strip().lower()

    for phrase in DANGEROUS_INTENT_PHRASES:
        if phrase in question_lower:
            return False, (
                f"Dangerous intent detected in your question: '{phrase}'. "
                f"QueryShield AI is a read-only analytics tool and cannot "
                f"perform destructive or administrative operations. "
                f"Please rephrase your question to retrieve data only."
            )

    return True, None


def validate_sql(sql: str) -> tuple[bool, str | None]:
    """Gate 2: structural safety check on generated SQL.

    Checks: non-empty → no blocked DDL keywords → starts with SELECT.
    Returns (True, None) on pass or (False, reason) on failure.
    """
    if not sql or not sql.strip():
        return False, "SQL query is empty."

    sql_upper = sql.strip().upper()

    for keyword in BLOCKED_KEYWORDS:
        # \b prevents partial matches (e.g. DROPDOWN should not match DROP).
        if re.search(rf"\b{keyword}\b", sql_upper):
            return False, f"SQL contains a blocked keyword: {keyword}"

    first_word = sql_upper.split()[0]
    if first_word != "SELECT":
        return False, f"Only SELECT queries are allowed. Received: {first_word}"

    return True, None


def extract_tables_from_sql(sql: str) -> list[str]:
    """Return de-duplicated lowercase table names referenced in FROM/JOIN clauses.

    Handles multi-table JOINs, schema-qualified names (public.payments → payments),
    and nested subqueries.
    """
    sql_upper = re.sub(r"\s+", " ", sql.strip().upper())
    table_pattern = re.compile(r"\b(?:FROM|JOIN)\s+([\w\.]+)", re.IGNORECASE)
    matches = table_pattern.findall(sql_upper)

    seen: set[str] = set()
    tables: list[str] = []
    for match in matches:
        table_name = match.split(".")[-1].lower()  # strip schema prefix
        if table_name and table_name not in seen:
            seen.add(table_name)
            tables.append(table_name)

    return tables


def check_table_access(role: str, sql: str) -> tuple[bool, str | None]:
    """Enforce table-level RBAC: every table in sql must be in the role's whitelist.

    Admin wildcard ("*") bypasses table checks entirely.
    Returns (True, None) if all tables are permitted, or (False, denial_reason).
    """
    allowed_tables = get_allowed_tables(role)
    detected_tables = extract_tables_from_sql(sql)

    logger.debug("[RBAC] Role          : %s", role)
    logger.debug("[RBAC] Detected tables: %s", detected_tables)
    logger.debug("[RBAC] Allowed tables : %s", allowed_tables)

    if allowed_tables == "*":
        logger.debug("[RBAC] GRANTED – admin wildcard")
        return True, None

    if allowed_tables is None:
        logger.debug("[RBAC] DENIED – unrecognised role")
        return False, f"Access denied: role '{role}' is not recognised."

    for table in detected_tables:
        if table not in allowed_tables:
            logger.debug("[RBAC] DENIED – table '%s' not in %s", table, allowed_tables)
            return False, f"Access denied: role '{role}' cannot access table '{table}'"

    logger.debug("[RBAC] GRANTED – all tables permitted")
    return True, None


def validate_role_permissions(role: str, sql: str) -> tuple[bool, str | None]:
    """Gate 3: RBAC check — operation type then table-level access."""
    if not is_role_allowed(role=role, sql=sql):
        operation = sql.strip().upper().split()[0] if sql.strip() else "UNKNOWN"
        return False, f"Role '{role}' is not authorised to run {operation} statements."

    return check_table_access(role=role, sql=sql)
