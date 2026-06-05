"""Shared utility functions used across the backend."""

from datetime import datetime


def log_request(question: str, role: str = "user") -> None:
    """Print a structured audit log line for each incoming query."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [QUERY] role={role} | question={question}")


def clean_sql_output(sql: str) -> str:
    """Strip leading/trailing whitespace and trailing semicolons from a SQL string."""
    return sql.strip().rstrip(";").strip()


def format_error(message: str) -> dict:
    """Wrap an error message in a standard {error, timestamp} dict."""
    return {
        "error":     message,
        "timestamp": datetime.now().isoformat(),
    }
