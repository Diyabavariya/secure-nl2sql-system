"""Groq LLM integration — natural-language to SQL generation."""

import re
import requests

from backend.config.settings import settings
from backend.services.role_service import normalize_role


def _fallback_keyword_sql(question: str) -> str:
    """Keyword-based SQL fallback used when the Groq API is unreachable."""
    q = question.lower()
    numbers = re.findall(r'\b(\d+)\b', q)
    limit = int(numbers[0]) if numbers else 10

    if "customer" in q:
        return f"SELECT * FROM customers LIMIT {limit};"
    elif "order" in q:
        return f"SELECT * FROM orders LIMIT {limit};"
    elif "product" in q:
        return f"SELECT * FROM products LIMIT {limit};"
    else:
        return "SELECT 'Sorry, I could not understand the question.' AS message;"


def generate_sql_with_ai(question: str, role: str = "user") -> str:
    """Send a natural-language question to Groq and return the generated SQL.

    Falls back to keyword-based SQL on any API error.
    """
    normalized_role = normalize_role(role) or role.strip().lower() or "user"

    system_message = f"""You are an expert SQL assistant for a {normalized_role} user.
You are connected to a SQLite database with the following schema:

{settings.DB_SCHEMA}

The current user's role is: {normalized_role}

Rules you MUST follow:
- Output ONLY a valid SQL query. No explanations, no markdown, no code fences.
- Use only the tables and columns listed in the schema above.
- Always end the query with a semicolon.
- Generate queries appropriate for a {normalized_role} — keep them focused and relevant.
- If the question cannot be answered with the available tables, return:
  SELECT 'I cannot answer that with the available data.' AS message;
"""

    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type":  "application/json",
    }

    payload = {
        "model":    settings.LLM_MODEL,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user",   "content": question},
        ],
        "temperature": settings.LLM_TEMPERATURE,
    }

    try:
        response = requests.post(
            settings.LLM_API_URL,
            headers=headers,
            json=payload,
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )
        print(response.text)
        response.raise_for_status()

        sql = response.json()["choices"][0]["message"]["content"].strip()

        # Strip markdown fences some models add despite instructions.
        sql = re.sub(r"^```sql\s*", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"^```\s*",    "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"\s*```$",    "", sql)

        return sql.strip()

    except Exception as e:
        print(f"[WARN] LLM API call failed: {e}. Falling back to keyword matcher.")
        return _fallback_keyword_sql(question)
