import os
import sys
from pathlib import Path

# Prevent duplicate OpenMP library initialization crashes on Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

# Ensure root of project is in python path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import CHECKPOINT_DIR
from src.evaluation.inference import load_model

# Cached model references stored in global / app state
GLOBAL_MODEL = None
GLOBAL_CLASS_TO_INDEX = None
GLOBAL_DEVICE = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global GLOBAL_MODEL, GLOBAL_CLASS_TO_INDEX, GLOBAL_DEVICE
    
    # Load and cache model weights at startup
    checkpoint_path = CHECKPOINT_DIR / "efficientnet_b2_wm811k" / "best.pt"
    print(f"Loading model checkpoint from {checkpoint_path}...")
    try:
        GLOBAL_MODEL, GLOBAL_CLASS_TO_INDEX, GLOBAL_DEVICE = load_model(checkpoint_path)
        app.state.model = GLOBAL_MODEL
        app.state.class_to_index = GLOBAL_CLASS_TO_INDEX
        app.state.device = GLOBAL_DEVICE
        print(f"Model loaded successfully on device: {GLOBAL_DEVICE}")
    except Exception as e:
        print(f"Warning: Failed to load model weights on startup: {e}")
        app.state.model = None
        app.state.class_to_index = None
        app.state.device = None
        
    yield
    
    # Clean up operations on shutdown if any
    pass

app = FastAPI(
    title="Vision-Based Wafer Yield API",
    description="Backend API serving predictions and metrics for semiconductor yield optimization",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend (on port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from backend.routes.health import router as health_router
from backend.routes.model_info import router as model_info_router
from backend.routes.classes import router as classes_router
from backend.routes.metrics import router as metrics_router
from backend.routes.predict import router as predict_router

# Include routes
app.include_router(health_router, tags=["Health"])
app.include_router(model_info_router, tags=["Model Info"])
app.include_router(classes_router, tags=["Classes"])
app.include_router(metrics_router, tags=["Metrics"])
app.include_router(predict_router, tags=["Prediction"])

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
