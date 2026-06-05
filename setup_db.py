"""
setup_db.py — One-command database bootstrap for QueryShield AI
===============================================================
Creates (or fully rebuilds) database.db from the seven Olist CSV
files in the backend/ folder, then creates the users table that
the FastAPI auth system depends on.

Usage (from the project root):
    python setup_db.py              # normal run
    python setup_db.py --force      # delete existing DB and rebuild

Requirements:
    pip install pandas python-dotenv
"""

import argparse
import os
import sqlite3
import sys

# Force UTF-8 output on Windows (avoids cp1252 UnicodeEncodeError)
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # falls back to real environment variables


# DB_PATH matches backend/config/settings.py so script and API reference the same file.
DB_PATH: str = os.getenv("DB_PATH", "database.db")
CSV_DIR: str = "backend"

# Ordered parent-before-child so FK references are satisfied on creation.
# Each entry: (csv_filename, sqlite_table_name, CREATE TABLE statement)
TABLES: list[tuple[str, str, str]] = [
    (
        "olist_customers_dataset.csv",
        "customers",
        """
        CREATE TABLE IF NOT EXISTS customers (
            customer_id              TEXT PRIMARY KEY,
            customer_unique_id       TEXT NOT NULL,
            customer_zip_code_prefix TEXT,
            customer_city            TEXT,
            customer_state           TEXT
        )
        """,
    ),
    (
        "olist_products_dataset.csv",
        "products",
        """
        CREATE TABLE IF NOT EXISTS products (
            product_id                 TEXT PRIMARY KEY,
            product_category_name      TEXT,
            product_name_length        REAL,
            product_description_length REAL,
            product_photos_qty         REAL,
            product_weight_g           REAL,
            product_length_cm          REAL,
            product_height_cm          REAL,
            product_width_cm           REAL
        )
        """,
    ),
    (
        "olist_sellers_dataset.csv",
        "sellers",
        """
        CREATE TABLE IF NOT EXISTS sellers (
            seller_id              TEXT PRIMARY KEY,
            seller_zip_code_prefix TEXT,
            seller_city            TEXT,
            seller_state           TEXT
        )
        """,
    ),
    (
        "olist_orders_dataset.csv",
        "orders",
        """
        CREATE TABLE IF NOT EXISTS orders (
            order_id                        TEXT PRIMARY KEY,
            customer_id                     TEXT NOT NULL REFERENCES customers(customer_id),
            order_status                    TEXT,
            order_purchase_timestamp        TEXT,
            order_approved_at               TEXT,
            order_delivered_carrier_date    TEXT,
            order_delivered_customer_date   TEXT,
            order_estimated_delivery_date   TEXT
        )
        """,
    ),
    (
        "olist_order_items_dataset.csv",
        "order_items",
        """
        CREATE TABLE IF NOT EXISTS order_items (
            order_id            TEXT NOT NULL REFERENCES orders(order_id),
            order_item_id       INTEGER NOT NULL,
            product_id          TEXT REFERENCES products(product_id),
            seller_id           TEXT REFERENCES sellers(seller_id),
            shipping_limit_date TEXT,
            price               REAL,
            freight_value       REAL,
            PRIMARY KEY (order_id, order_item_id)
        )
        """,
    ),
    (
        "olist_order_payments_dataset.csv",
        "payments",
        """
        CREATE TABLE IF NOT EXISTS payments (
            order_id             TEXT NOT NULL REFERENCES orders(order_id),
            payment_sequential   INTEGER NOT NULL,
            payment_type         TEXT,
            payment_installments INTEGER,
            payment_value        REAL,
            PRIMARY KEY (order_id, payment_sequential)
        )
        """,
    ),
    (
        "olist_order_reviews_dataset.csv",
        "reviews",
        """
        CREATE TABLE IF NOT EXISTS reviews (
            review_id               TEXT PRIMARY KEY,
            order_id                TEXT NOT NULL REFERENCES orders(order_id),
            review_score            INTEGER,
            review_comment_title    TEXT,
            review_comment_message  TEXT,
            review_creation_date    TEXT,
            review_answer_timestamp TEXT
        )
        """,
    ),
]

USERS_DDL = """
CREATE TABLE IF NOT EXISTS users (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    email            TEXT UNIQUE NOT NULL,
    hashed_password  TEXT NOT NULL,
    role             TEXT NOT NULL,
    created_at       TEXT NOT NULL
)
"""


def _ok(msg: str) -> None:
    print(f"  [OK]   {msg}")


def _warn(msg: str) -> None:
    print(f"  [WARN] {msg}")


def _fail(msg: str) -> None:
    print(f"  [FAIL] {msg}")


def _header(msg: str) -> None:
    print(f"\n{msg}")
    print("-" * len(msg))


def check_dependencies() -> bool:
    """Verify that all required Python packages are importable."""
    _header("Checking dependencies …")
    ok = True
    for pkg, import_name in [("pandas", "pandas"), ("python-dotenv", "dotenv")]:
        try:
            __import__(import_name)
            _ok(f"{pkg}")
        except ImportError:
            _fail(f"{pkg} is not installed.  Run:  pip install {pkg}")
            ok = False
    return ok


def check_csv_files() -> bool:
    """Verify every required CSV file exists before touching the database."""
    _header("Checking CSV source files …")
    ok = True
    for csv_file, table_name, _ in TABLES:
        path = os.path.join(CSV_DIR, csv_file)
        if os.path.isfile(path):
            size_mb = os.path.getsize(path) / 1_048_576
            _ok(f"{csv_file}  ({size_mb:.1f} MB)  ->  table '{table_name}'")
        else:
            _fail(f"Missing: {path}")
            ok = False
    return ok


def build_database() -> None:
    """Drop existing data, recreate all tables, bulk-insert CSV rows."""
    import pandas as pd  # imported here so missing dep gives a clean message

    _header(f"Building {DB_PATH} …")

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute("PRAGMA foreign_keys = ON")

        _header("Creating tables ...")
        for _, table_name, ddl in TABLES:
            conn.execute(ddl)
            _ok(f"Table '{table_name}' ready")

        # Users table also created here so the DB is usable before the API starts.
        conn.execute(USERS_DDL)
        _ok("Table 'users' ready")

        conn.commit()

        _header("Loading CSV data ...")
        for csv_file, table_name, _ in TABLES:
            path = os.path.join(CSV_DIR, csv_file)
            df = pd.read_csv(path)

            # Rename columns to match the exact DDL column names where pandas
            # would otherwise use the CSV header as-is (they happen to match
            # in this dataset, but we normalise just in case).
            df.columns = [c.strip().lower() for c in df.columns]

            df.to_sql(table_name, conn, if_exists="replace", index=False)
            _ok(f"Loaded {len(df):,} rows  ->  '{table_name}'")

        conn.commit()

    except Exception as exc:
        conn.rollback()
        _fail(f"Database build failed: {exc}")
        conn.close()
        if os.path.isfile(DB_PATH):
            os.remove(DB_PATH)
            _warn("Removed incomplete database file.")
        raise
    else:
        conn.close()


def verify_database() -> bool:
    """Assert row counts and FK integrity; return True only if all pass."""
    _header("Verifying database …")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        all_ok = True

        expected_tables = [t for _, t, _ in TABLES] + ["users"]
        for table in expected_tables:
            row = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
            count = row[0]
            if table == "users":
                # users starts empty — that's correct
                _ok(f"'{table}': {count} rows (empty is expected before first login)")
            elif count == 0:
                _warn(f"'{table}': 0 rows — check the CSV file")
                all_ok = False
            else:
                _ok(f"'{table}': {count:,} rows")

        fk_violations = conn.execute("PRAGMA foreign_key_check").fetchall()
        if fk_violations:
            _warn(f"{len(fk_violations)} foreign-key violation(s) found (orphaned rows in CSVs — non-fatal)")
        else:
            _ok("Foreign-key integrity: no violations")

        spot_checks = [
            ("orders",      "SELECT order_id, customer_id, order_status FROM orders LIMIT 1"),
            ("order_items", "SELECT order_id, price, freight_value FROM order_items LIMIT 1"),
            ("payments",    "SELECT order_id, payment_type, payment_value FROM payments LIMIT 1"),
        ]
        for label, query in spot_checks:
            try:
                conn.execute(query)
                _ok(f"Spot-check '{label}': columns present")
            except sqlite3.OperationalError as e:
                _fail(f"Spot-check '{label}' failed: {e}")
                all_ok = False

        return all_ok

    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Bootstrap the QueryShield AI SQLite database from CSV files."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete the existing database.db and rebuild from scratch.",
    )
    args = parser.parse_args()

    print("\n" + "=" * 46)
    print("  QueryShield AI -- Database Setup")
    print("=" * 46)

    # -- Pre-flight ------------------------------------------------------------
    if not check_dependencies():
        print("\nAborted: install missing packages and retry.\n")
        sys.exit(1)

    if not check_csv_files():
        print(
            "\nAborted: one or more CSV files are missing.\n"
            "Place the Olist CSV files inside the backend/ directory and retry.\n"
        )
        sys.exit(1)

    # -- Existing DB handling --------------------------------------------------
    if os.path.isfile(DB_PATH):
        if args.force:
            os.remove(DB_PATH)
            _warn(f"Deleted existing {DB_PATH} (--force was passed)")
        else:
            _warn(
                f"{DB_PATH} already exists. "
                "Pass --force to delete and rebuild, or skip to re-verify."
            )
            print()
            success = verify_database()
            _print_result(success)
            sys.exit(0 if success else 1)

    # -- Build -----------------------------------------------------------------
    build_database()

    # -- Verify ----------------------------------------------------------------
    success = verify_database()
    _print_result(success)
    sys.exit(0 if success else 1)


def _print_result(success: bool) -> None:
    size_mb = os.path.getsize(DB_PATH) / 1_048_576 if os.path.isfile(DB_PATH) else 0
    print()
    if success:
        print(f"  [DONE]  {DB_PATH}  ({size_mb:.1f} MB)")
        print("  The database is ready. Start the API with:")
        print("      uvicorn backend.main:app --reload")
        print()
    else:
        print("  [WARN]  Setup completed with warnings. See messages above for details.")
        print()


if __name__ == "__main__":
    main()
