# -----------------------------------------------------------------------------
# Stage 1: Build Next.js 16 Production Frontend Assets
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ENV NEXT_EXPORT=true
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production Python 3.11 Microservice & Static Frontend Server
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS runner

# Install curl for container healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000 \
    KMP_DUPLICATE_LIB_OK=TRUE \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

# Install CPU-optimized PyTorch and headless OpenCV (avoids CUDA 3GB bloat and libGL missing errors)
COPY requirements.txt ./
RUN pip install --no-cache-dir torch torchvision --extra-index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir opencv-python-headless && \
    sed -i '/torch/d' requirements.txt && \
    sed -i '/opencv-python/d' requirements.txt && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code, models, and metadata
COPY config.py ./
COPY src/ ./src/
COPY backend/ ./backend/
COPY evaluation_effnet/ ./evaluation_effnet/
COPY checkpoints/ ./checkpoints/

# Copy compiled frontend static bundle from Stage 1
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Dynamic port for Render ($PORT defaults to 8000 or 10000)
EXPOSE 8000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start unified FastAPI server (serves both API & Next.js dashboard)
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
