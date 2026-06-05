"""Executes validated SQL queries against the SQLite database."""

from backend.database.db import get_db_connection


def run_sql_query(sql: str) -> tuple[list, str | None]:
    """Execute a SQL SELECT query and return (rows, error).

    Converts sqlite3.Row objects to plain dicts for JSON serialisation.
    The connection is always closed in the finally block, even on error.

    Returns:
        (list[dict], None)  — success
        ([], "error msg")   — failure
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(sql)
        rows = cursor.fetchall()
        return [dict(row) for row in rows], None
    except Exception as e:
        return [], str(e)
    finally:
        conn.close()
