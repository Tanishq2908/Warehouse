# ── Backend: FastAPI + Python ──────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# System deps for bcrypt / motor compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Install Python deps first (layer cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8000

# Dev: hot-reload. Override in prod compose.
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
