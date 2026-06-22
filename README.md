# QueryShield AI

## Live Demo

Frontend: [https://secure-nl2sql-system.vercel.app](https://secure-nl2sql-system.vercel.app/)

Backend API: [https://secure-nl2sql-system.onrender.com](https://secure-nl2sql-system.onrender.com/)

API Documentation: [https://secure-nl2sql-system.onrender.com/docs](https://secure-nl2sql-system.onrender.com/docs)

QueryShield AI is a secure, role-aware **Natural Language to SQL (NL→SQL)** system that enables users to query databases in plain English without exposing raw database access or compromising security. Powered by the Groq LLM (Llama 3) and a FastAPI + React architecture, QueryShield AI implements multi-layered security gates—including **intent validation**, **strict SQL structure checks**, **JWT authentication**, and **Role-Based Access Control (RBAC)**—to deliver safe and controlled database intelligence.

---

## 🚀 Overview
Traditional text-to-SQL systems often trust LLM-generated SQL too early. That introduces serious risk, including prompt injection, unauthorized data exposure, and privilege escalation.

QueryShield AI is designed as a zero-trust intermediary. It validates user intent before the request reaches the model, verifies the generated SQL before execution, and enforces server-side Role-Based Access Control (RBAC) so each user can only access tables and columns aligned with their assigned role.

---

## 🎯 Key Features
*   **Natural language to SQL translation:** Uses the Groq LLM (`llama-3.3-70b-versatile`) with schema-aware prompts and deterministic generation settings.
*   **Zero-trust SQL validation:** Blocks DDL and DML queries so only safe, read-only `SELECT` operations are executed.
*   **Server-side RBAC enforcement:** Validates generated SQL against role permissions so tables and columns stay aligned with each user's access level.
*   **Intent validation gate:** Screens incoming prompts for dangerous instructions, prompt injection attempts, and out-of-scope requests before they reach the model.
*   **Secure JWT sessions:** Uses cryptographic JWT tokens for authenticated sessions and safe client-side rehydration.
*   **Interactive React dashboard:** Shows validation logs, SQL output, query results, and an active security threat meter in one place.
*   **Query history and state:** Maintains session-scoped history with visual status badges for success, blocked, and access-denied actions.

---

## 📐 Architecture

The QueryShield AI pipeline processes each request through a zero-trust model:

```
        User (NL Query Prompt)
                 │
                 ▼
          React Frontend
                 │
                 ▼ (JWT Auth Token Header)
          FastAPI Backend
                 │
                 ▼
       [ Gate 1: Intent Validation ] ─── (Blocks Prompt Injection)
                 │
                 ▼
             Groq LLM ─────────────────── (Generates SQL from Schema)
                 │
                 ▼
       [ Gate 2: SQL Validation ] ────── (Blocks DDL/DML, checks structure)
                 │
                 ▼
       [ Gate 3: RBAC Access Check ] ──── (Checks table/column permissions)
                 │
                 ▼
          SQLite Database ────────────── (Runs safe validated SELECT)
                 │
                 ▼
        Clean JSON Results
                 │
                 ▼
         React UI Output ─────────────── (Populates tables & Threat Meter)
```

---

## 💻 Tech Stack

### Frontend
*   **React (v18)** — Component-driven client UI.
*   **Vite** — High-performance frontend bundler.
*   **Tailwind CSS** — Modern custom utility design system.
*   **Axios** — Centralized client instance with automatic JWT interceptors.

### Backend
*   **FastAPI** — High-performance ASGI Python web framework.
*   **SQLite** — Relational database containing the target Brazilian e-commerce dataset.
*   **Uvicorn** — Lightning-fast ASGI production web server.

### AI & Security
*   **Groq LLM API** — Fast inference using Llama 3.3 for schema-aware text-to-SQL generation.
*   **PyJWT & Passlib** — Secure JWT generation, validation, and password hashing with Bcrypt.
*   **Security Gates** — Custom Python sanitization and SQL abstract syntax tree (AST) scanning.

## Deployment

This project is deployed as a full-stack production application with separate hosting for the frontend, backend, AI inference, and database layer:

*   **Frontend:** Vercel
*   **Backend:** Render
*   **AI Model:** Groq API (Llama 3.3 70B)
*   **Database:** SQLite

---

## 📸 Screenshots

### 1. Login Screen
Secure JWT-based authentication UI allowing user login and registration under different organizational roles.
![Secure authentication with role-aware access control.](screenshots/login.png)

### 2. RBAC Access Denied
Demonstrates the backend RBAC preventing a Sales user from accessing sensitive payments data, resulting in a blocked query and automatic threat rating response.
![Backend RBAC enforcement blocks unauthorized access to restricted tables.](screenshots/rbac-denied.png)

### 3. Successful Query Execution
Shows a natural language query successfully passing all validation gates (Intent validation, SQL structure validation, and RBAC permissions check) with the visual indicators in the security panel.
![Intent validation, SQL validation, and RBAC checks successfully passed.](screenshots/query-success.png)

### 4. Query Results
Displays the successfully generated SQL command alongside tabular query results returned from the database and a conversational explanation.
![Natural language transformed into SQL with real database results.](screenshots/query-results.png)

### 5. Query History
Interactive session history tracker showing the log of all processed, blocked, and denied query attempts for auditing.
![Persistent query history for auditing and analytics.](screenshots/query-history.png)


---

## 🛠️ Installation & Setup

### Prerequisites
*   Python 3.10 or higher
*   Node.js 18 or higher (with npm)

---

### Step 1: Clone and Initialize
```bash
git clone https://github.com/your-username/secure-nl2sql-system.git
cd secure-nl2sql-system
```

If you want to explore the deployed application first, open the live frontend at [https://secure-nl2sql-system.vercel.app](https://secure-nl2sql-system.vercel.app/) and the production API at [https://secure-nl2sql-system.onrender.com](https://secure-nl2sql-system.onrender.com/).

---

### Step 2: Backend Setup & Environment
1.  Navigate to the project directory and create a Python virtual environment:
    ```bash
    python -m venv .venv
    # Activate virtual environment
    # On Windows (PowerShell):
    .venv\Scripts\Activate.ps1
    # On macOS/Linux:
    source .venv/bin/activate
    ```
2.  Install all backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Set up your environment configuration by copying `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
4.  Open the newly created `.env` file and input your Groq API key:
    ```env
    GROQ_API_KEY=your_actual_groq_api_key
    JWT_SECRET_KEY=generate_a_strong_random_key_here
    DB_PATH=database.db
    APP_ENV=development
    ```

---

### Step 3: Seed the Database (Olist Dataset)
QueryShield AI uses the Brazilian E-Commerce Public Dataset by Olist. The source CSVs are excluded from Git due to size (~65MB).

1.  Download the dataset from Kaggle:
    👉 [Kaggle: Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
2.  Extract the ZIP archive.
3.  Copy the following **7 CSV files** into the `backend/` directory of the project:
    *   `olist_customers_dataset.csv`
    *   `olist_products_dataset.csv`
    *   `olist_sellers_dataset.csv`
    *   `olist_orders_dataset.csv`
    *   `olist_order_items_dataset.csv`
    *   `olist_order_payments_dataset.csv`
    *   `olist_order_reviews_dataset.csv`
4.  Run the bootstrap script to parse the CSVs, configure constraints, set up foreign keys, and generate your local SQLite database:
    ```bash
    python setup_db.py
    ```

---

### Step 4: Frontend Setup
1.  Navigate into the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install package dependencies:
    ```bash
    npm install
    ```

---

## 🚦 Running the Project

### Running the Backend
From the **project root directory** (with virtual environment active):
```bash
uvicorn backend.main:app --reload
```
The FastAPI documentation and OpenAPI page will be available locally at `http://127.0.0.1:8000/docs`. For the deployed API documentation, use [https://secure-nl2sql-system.onrender.com/docs](https://secure-nl2sql-system.onrender.com/docs).

### Running the Frontend
From the `frontend/` directory:
```bash
# On Windows (if script execution is restricted):
npm.cmd run dev

# On macOS/Linux/Other:
npm run dev
```
Open your browser and navigate to `http://localhost:5173` for local development, or use the deployed frontend at [https://secure-nl2sql-system.vercel.app](https://secure-nl2sql-system.vercel.app/).

---

## 🛡️ Security Features Under the Hood

### 1. Intent Validation Gate
Before queries hit the LLM, the backend analyzes user prompts against a signature block of dangerous terms and injection patterns (e.g., prompt hijacking, attempts to override system prompts, requests for system configurations, or queries explicitly targeting password tables). Violations trigger an immediate block.

### 2. SQL Syntax & Policy Gate
Once the LLM outputs a SQL query, it is parsed via Python's abstract analysis patterns before execution:
*   **Query Type Restriction:** Ensures the statement starts with `SELECT`. Any presence of `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, or `CREATE` is rejected.
*   **Multi-statement Block:** Rejects queries containing semicolons `;` or union/subquery combinations designed to bypass restrictions.

### 3. Role-Based Access Control (RBAC)
User roles are embedded into cryptographic JWT signatures. When a query is validated:
*   The backend extracts the user's role from the token.
*   The generated SQL is tokenized, and all referenced tables and columns are extracted.
*   The extraction list is cross-referenced with the active role permissions catalog:
    *   `Viewer`: Cannot execute queries.
    *   `Sales`: Restricted to sales-specific tables (e.g., cannot view customer personal addresses or sensitive details).
    *   `Engineer` & `Admin`: Full analytical database reading permissions.

---

## 📈 Future Improvements
*   **Multi-Database Support:** Dynamically swap connection strings to target PostgreSQL or MySQL instances.
*   **Conversational Memory:** Retain query contexts to allow follow-up questions (e.g., "Now filter that by products from São Paulo").
*   **Query Visualization:** Generate chart models (bar charts, line graphs) directly from returned tables in the React frontend.
*   **Audit Logging System:** Save blocked injection requests and validation violations directly to an administrative security logs table.

---

## 📁 Project Structure

```
secure-nl2sql-system/
├── backend/
│   ├── config/            # Settings and configurations (pydantic settings)
│   ├── database/          # SQLite connections and user table creation
│   ├── models/            # Pydantic schemas (requests & responses)
│   ├── routes/            # FastAPI routers (auth, query processing, meta)
│   ├── services/          # Core logic (LLM, SQL execution, RBAC, validations)
│   ├── utils/             # Helper logs and formatted consoles
│   ├── main.py            # FastAPI application entry point
│   └── olist_*.csv        # Brazilian E-Commerce dataset source files (used for local seeding)
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios calls to backend endpoints
│   │   ├── components/    # Reusable modular UI components
│   │   ├── context/       # Auth state management
│   │   ├── hooks/         # Custom query execution hooks
│   │   ├── pages/         # Login and Dashboard pages
│   │   └── index.css      # Core styles & global colors
│   └── package.json       # Frontend dependencies
├── requirements.txt       # Backend dependencies
├── setup_db.py            # Database bootstrapping script
└── README.md              # Project overview, setup, and deployment details
```

---

## 🎓 Resume Highlights & Concepts Demonstrated

*   **Zero-trust security design:** Implemented defense-in-depth controls across intent sanitization, SQL AST validation, and API-level authorization.
*   **Role-based access control (RBAC):** Built a server-side permission engine that extracts table and column nodes from queries and validates them against user-role mappings.
*   **Modern AI integration:** Used the Groq LLM API with structured prompt engineering to deliver reliable Text-to-SQL generation at temperature `0.0`.
*   **Token-based authentication:** Developed a secure authentication flow using JWT tokens, Passlib Bcrypt password hashing, and Axios request interceptors.
*   **Full-stack development:** Connected a React SPA built with Vite and Tailwind CSS to a FastAPI backend serving a SQLite relational database.
*   **Deployment experience:** Deployed the frontend on Vercel and the backend API on Render, with production-ready URLs, environment configuration, and documentation aligned for end-user access and recruiter review.
