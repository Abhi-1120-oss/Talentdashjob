FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/playwright/python:v1.48.0-jammy

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY pyproject.toml .
COPY prisma ./prisma
COPY src ./src
COPY --from=frontend-build /frontend/dist ./frontend/dist

ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

RUN pip install -e . && prisma generate

EXPOSE 8000

CMD ["uvicorn", "talentdash.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
