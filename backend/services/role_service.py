"""RBAC source of truth — roles, table permissions, and metadata."""

from __future__ import annotations

from typing import Any


ROLE_ORDER: tuple[str, ...] = (
    "admin",
    "finance",
    "sales",
    "marketing",
    "inventory",
)

# Table whitelist per role. "*" grants unrestricted access (admin only).
# Olist tables: customers, orders, order_items, payments, products, sellers, reviews
ROLE_TABLE_PERMISSIONS: dict[str, list[str] | str] = {
    "admin":     "*",

    # Revenue performance: customer behaviour, order trends, product-level breakdown.
    "sales":     ["customers", "orders", "order_items", "products"],

    # Customer engagement: segmentation, RFM analysis, satisfaction scores, campaigns.
    "marketing": ["customers", "orders", "reviews", "products"],

    # Payment analytics: transaction volume, payment mix, customer lifetime value.
    "finance":   ["payments", "orders", "customers"],

    # Supply-side analytics: stock, seller performance, fulfilment, freight.
    "inventory": ["products", "sellers", "order_items", "orders"],
}

ROLE_METADATA: dict[str, dict[str, Any]] = {
    "admin": {
        "label": "Admin",
        "description": "Full operational access across dashboards, security, and account tools.",
        "badge_class": "bg-rose-500/15 text-rose-300 border-rose-500/30",
        "pages": ["dashboard", "security", "history", "connections", "apikeys"],
        "can_execute_query": True,
        "sql_operations": ["SELECT"],
    },
    "finance": {
        "label": "Finance",
        "description": "Financial reporting and payment analysis.",
        "badge_class": "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
        "pages": ["dashboard", "history"],
        "can_execute_query": True,
        "sql_operations": ["SELECT"],
    },
    "sales": {
        "label": "Sales",
        "description": "Pipeline and revenue analysis for sales operations.",
        "badge_class": "bg-sky-500/15 text-sky-200 border-sky-500/30",
        "pages": ["dashboard", "history"],
        "can_execute_query": True,
        "sql_operations": ["SELECT"],
    },
    "marketing": {
        "label": "Marketing",
        "description": "Campaign and performance analysis for customer-facing decisions.",
        "badge_class": "bg-cyan-500/15 text-cyan-200 border-cyan-500/30",
        "pages": ["dashboard", "history"],
        "can_execute_query": True,
        "sql_operations": ["SELECT"],
    },
    "inventory": {
        "label": "Inventory",
        "description": "Product catalogue, seller data, and order item management.",
        "badge_class": "bg-amber-500/15 text-amber-200 border-amber-500/30",
        "pages": ["dashboard", "history"],
        "can_execute_query": True,
        "sql_operations": ["SELECT"],
    },
}

# Case-insensitive lookup: "Sales" -> "sales", "ADMIN" -> "admin"
ROLE_ALIASES: dict[str, str] = {role.lower(): role for role in ROLE_ORDER}


def normalize_role(role: str | None) -> str | None:
    """Return the canonical lowercase role key, or None if unrecognised."""
    if role is None:
        return None
    normalized = role.strip()
    return ROLE_ALIASES.get(normalized.lower()) if normalized else None


def get_allowed_tables(role: str | None) -> list[str] | str | None:
    """Return allowed tables for the role: "*" (admin), list, or None (unknown)."""
    normalized_role = normalize_role(role)
    if normalized_role is None:
        return None
    return ROLE_TABLE_PERMISSIONS.get(normalized_role)


def has_role(role: str | None, expected_role: str) -> bool:
    return normalize_role(role) == normalize_role(expected_role)


def can_access(role: str | None, page_key: str) -> bool:
    normalized_role = normalize_role(role)
    if normalized_role is None:
        return False
    return page_key in ROLE_METADATA[normalized_role]["pages"]


def can_execute_query(role: str | None) -> bool:
    normalized_role = normalize_role(role)
    if normalized_role is None:
        return False
    return bool(ROLE_METADATA[normalized_role]["can_execute_query"])


def is_role_allowed(role: str | None, sql: str) -> bool:
    """Return True if the role may execute the SQL operation type (SELECT/INSERT/…).

    Note: checks operation type only — table-level RBAC is in check_table_access().
    """
    normalized_role = normalize_role(role)
    if normalized_role is None:
        return False
    operation = sql.strip().upper().split()[0] if sql.strip() else ""
    return operation in ROLE_METADATA[normalized_role]["sql_operations"]


def get_role_info(role: str | None) -> dict[str, Any]:
    normalized_role = normalize_role(role)
    if normalized_role is None:
        return {
            "role": role, "label": role, "description": None,
            "pages": [], "can_execute_query": False,
            "sql_operations": [],
            "badge_class": "bg-slate-500/15 text-slate-200 border-slate-500/30",
        }
    return {"role": normalized_role, **ROLE_METADATA[normalized_role]}


def get_role_catalog() -> list[dict[str, Any]]:
    return [get_role_info(role) for role in ROLE_ORDER]
