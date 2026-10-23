# Warehouse Management System

FastAPI + MongoDB backend · Vite/React frontend · Docker Compose for one-command start.

---

## 🐳 Quickstart with Docker (recommended)

```bash
cd app
docker compose up
```

| Service | URL |
|---|---|
| React frontend (Vite hot-reload) | http://localhost:5173 |
| FastAPI backend | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |
| MongoDB | localhost:27017 |

Login with **`admin / admin123`** or **`staff / staff123`**.  
Change these before production!

---

## 🔧 Local dev (without Docker)

### Backend
```bash
cd app/backend
cp .env.example .env          # then edit JWT_SECRET and optionally GROQ_API_KEY
pip install -r requirements.txt
uvicorn server:app --reload
```

### Frontend
```bash
cd app/frontend
cp .env.example .env
npm install
npm run dev
```

---

## 🚀 Production

```bash
# Build production images and start with nginx serving the compiled SPA
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Set these environment variables (via `.env` in the `app/` root or your secrets manager):

| Variable | Description |
|---|---|
| `JWT_SECRET` | Long random secret — **never use the default** |
| `GROQ_API_KEY` | Groq API key for bill OCR (optional) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

---

## 📁 Project layout

```
app/
├── backend/         FastAPI application (Python)
│   ├── server.py    Entrypoint
│   ├── auth.py      JWT auth
│   ├── masterdata.py
│   ├── catalog.py   Parties, products, designs
│   ├── purchase.py  Orders + goods receipts + inventory ledger
│   ├── sales.py     Sales with kaccha/pakka split
│   ├── dashboard.py
│   └── seed.py      Idempotent seed on startup
├── frontend/        React + Vite (JSX)
│   └── src/
│       ├── App.jsx          Router + auth guard
│       ├── index.css        Indigo Vat design system
│       ├── lib/             API client, auth context
│       ├── components/      Shell, DynamicForm, DataGrid, LookupSelect
│       └── pages/           Dashboard, Orders, Receive, Inventory, Sales, MasterData
├── nginx/
│   └── nginx.conf   Production reverse proxy
├── docker-compose.yml       Dev stack
└── docker-compose.prod.yml  Production override
```

---

## Seeded accounts

| Username | Password | Role |
|---|---|---|
| admin | admin123 | ADMIN — sees profit, kaccha bills, can adjust stock |
| staff | staff123 | STAFF — standard operations |