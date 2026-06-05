"""SQLite connection factory."""

import sqlite3
from backend.config.settings import settings


def get_db_connection() -> sqlite3.Connection:
    """Open and return a SQLite connection with column-name row access."""
    conn = sqlite3.connect(settings.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_users_table() -> None:
    """Create the users table if it does not already exist. Idempotent."""
    conn = get_db_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                email            TEXT UNIQUE NOT NULL,
                hashed_password  TEXT NOT NULL,
                role             TEXT NOT NULL,
                created_at       TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()
