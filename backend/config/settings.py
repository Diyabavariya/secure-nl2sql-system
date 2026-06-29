"""Application configuration — loaded from environment / .env file."""

import os
from datetime import timedelta

try:
    from dotenv import load_dotenv
    load_dotenv()   # loads .env from the project root (or CWD)
except ImportError:
    pass  # python-dotenv not installed; rely on real env vars


class Settings:
    # ── App metadata ──────────────────────────────────────────────────────────
    APP_TITLE: str = "QueryShield AI"
    APP_DESCRIPTION: str = (
        "A secure, role-aware Natural Language to SQL system "
        "powered by Groq LLM and FastAPI."
    )
    APP_VERSION: str = "2.0.0"

    # ── Database ──────────────────────────────────────────────────────────────
    DB_PATH: str = os.path.join(
        os.path.dirname(__file__), "..", "..", "database.db"
    )

    # ── Groq LLM ──────────────────────────────────────────────────────────────
    # Set GROQ_API_KEY in your .env file (see .env.example).
    LLM_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    LLM_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    LLM_MODEL = "openai/gpt-oss-120b"
    LLM_TEMPERATURE: float = 0       # 0 = deterministic SQL output
    LLM_TIMEOUT_SECONDS: int = 15

    # ── JWT Authentication ────────────────────────────────────────────────────
    # Override JWT_SECRET_KEY via environment variable in production.
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "queryshield-dev-secret-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 8   # 8-hour sessions

    # ── Database Schema ───────────────────────────────────────────────────────
    # Injected verbatim into every LLM system prompt.
    # PK/FK annotations + Relationships block prevent hallucinated columns/JOINs.
    # Analytical patterns act as few-shot examples embedded in the schema.
    DB_SCHEMA: str = """
Table: customers
Columns: customer_id (PK), customer_unique_id, customer_zip_code_prefix,
         customer_city, customer_state
Business meaning: One row per customer order-address combination.
                  customer_unique_id deduplicates repeat buyers across orders.

Table: orders
Columns: order_id (PK), customer_id (FK → customers), order_status,
         order_purchase_timestamp, order_approved_at,
         order_delivered_carrier_date, order_delivered_customer_date,
         order_estimated_delivery_date
Business meaning: Central fact table linking customers to their purchases.
                  order_status values: 'delivered', 'shipped', 'canceled',
                  'processing', 'invoiced', 'unavailable'.
                  Use order_purchase_timestamp for time-based filtering.

Table: order_items
Columns: order_id (FK → orders), order_item_id, product_id (FK → products),
         seller_id (FK → sellers), shipping_limit_date, price, freight_value
Primary Key: (order_id, order_item_id)
Business meaning: Line-item bridge between orders, products, and sellers.
                  price = item sale price; freight_value = per-item shipping cost.
                  SUM(price) grouped by order_id gives per-order revenue.
                  SUM(price) grouped by product_id gives product revenue.

Table: products
Columns: product_id (PK), product_category_name, product_name_length,
         product_description_length, product_photos_qty,
         product_weight_g, product_length_cm, product_height_cm, product_width_cm
Business meaning: Product catalog. product_category_name is the primary
                  grouping dimension for category-level sales analysis.

Table: sellers
Columns: seller_id (PK), seller_zip_code_prefix, seller_city, seller_state
Business meaning: Merchant registry. Join to order_items on seller_id
                  to compute per-seller revenue, order count, or ratings.

Table: payments
Columns: order_id (FK → orders), payment_sequential, payment_type,
         payment_installments, payment_value
Primary Key: (order_id, payment_sequential)
Business meaning: Payment breakdown per order. payment_type values:
                  'credit_card', 'boleto', 'voucher', 'debit_card'.
                  One order may have multiple payment rows (split payments).
                  SUM(payment_value) per order_id = total amount paid.

Table: reviews
Columns: review_id (PK), order_id (FK → orders), review_score,
         review_comment_title, review_comment_message,
         review_creation_date, review_answer_timestamp
Business meaning: Customer satisfaction per order. review_score is 1–5
                  (5 = best). AVG(review_score) measures quality for any
                  grouping — product, category, seller, or time period.

Relationships:
-- Follow ONLY these join paths. Do not invent columns or shortcuts.
--
-- Customer → Orders:
--   customers JOIN orders ON customers.customer_id = orders.customer_id
--
-- Order → Line items:
--   orders JOIN order_items ON orders.order_id = order_items.order_id
--
-- Line item → Product detail:
--   order_items JOIN products ON order_items.product_id = products.product_id
--
-- Line item → Seller:
--   order_items JOIN sellers ON order_items.seller_id = sellers.seller_id
--
-- Order → Payment info:
--   orders JOIN payments ON orders.order_id = payments.order_id
--
-- Order → Review:
--   orders JOIN reviews ON orders.order_id = reviews.order_id
--
-- Analytical query patterns (chain these joins for complex questions):
--   Top customers by revenue    → customers → orders → order_items, SUM(price)
--   Best-selling products       → products → order_items, COUNT(*) or SUM(price)
--   Seller performance          → sellers → order_items → orders → reviews
--   Payment type breakdown      → orders → payments, GROUP BY payment_type
--   Review / satisfaction score → reviews → orders → order_items → products
--   Category revenue            → products → order_items, GROUP BY product_category_name
"""


settings = Settings()
