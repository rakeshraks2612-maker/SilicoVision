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
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from config import CHECKPOINT_DIR
from src.evaluation.inference import load_model
from src.models import build_resnet18

# Cached model references stored in global / app state
GLOBAL_MODEL = None
GLOBAL_CLASS_TO_INDEX = None
GLOBAL_DEVICE = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global GLOBAL_MODEL, GLOBAL_CLASS_TO_INDEX, GLOBAL_DEVICE
    
    checkpoint_dir = CHECKPOINT_DIR / "efficientnet_b2_wm811k"
    checkpoint_path = checkpoint_dir / "best.pt"
    
    # 1. Check if an external weights URL is provided (e.g. from environment variable)
    weights_url = os.getenv("MODEL_WEIGHTS_URL")
    if not checkpoint_path.exists() and weights_url:
        print(f"Downloading model checkpoint from {weights_url}...")
        checkpoint_dir.mkdir(parents=True, exist_ok=True)
        try:
            import urllib.request
            urllib.request.urlretrieve(weights_url, str(checkpoint_path))
            print("Model checkpoint downloaded successfully.")
        except Exception as dl_err:
            print(f"Warning: Failed to download weights from {weights_url}: {dl_err}")

    # 2. Load model weights if present
    if checkpoint_path.exists():
        print(f"Loading model checkpoint from {checkpoint_path}...")
        try:
            GLOBAL_MODEL, GLOBAL_CLASS_TO_INDEX, GLOBAL_DEVICE = load_model(checkpoint_path)
            app.state.model = GLOBAL_MODEL
            app.state.class_to_index = GLOBAL_CLASS_TO_INDEX
            app.state.device = GLOBAL_DEVICE
            print(f"Model loaded successfully on device: {GLOBAL_DEVICE}")
        except Exception as e:
            print(f"Warning: Failed to load model weights: {e}")
            GLOBAL_MODEL = None
    else:
        print(f"Checkpoint not found at {checkpoint_path}.")

    # 3. Graceful fallback if no weights available (prevents healthcheck and boot crashes)
    if GLOBAL_MODEL is None:
        print("Initializing fallback model with standard 8 defect classes...")
        import torch
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            fallback_model = build_resnet18(num_classes=8, pretrained=False)
            fallback_model.to(device)
            fallback_model.eval()
            app.state.model = fallback_model
            app.state.class_to_index = {
                "Center": 0, "Donut": 1, "Edge-Loc": 2, "Edge-Ring": 3,
                "Loc": 4, "Random": 5, "Scratch": 6, "Near-full": 7
            }
            app.state.device = device
            print("Fallback model initialized. Ready for inference requests.")
        except Exception as fb_err:
            print(f"Warning: Failed to initialize fallback model: {fb_err}")
            app.state.model = None
            app.state.class_to_index = None
            app.state.device = None
        
    yield
    pass

app = FastAPI(
    title="SilicoVision Wafer AI API",
    description="Production deep learning microservice for semiconductor wafer defect classification & yield telemetry",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# Include routes at root
app.include_router(health_router, tags=["Health"])
app.include_router(model_info_router, tags=["Model Info"])
app.include_router(classes_router, tags=["Classes"])
app.include_router(metrics_router, tags=["Metrics"])
app.include_router(predict_router, tags=["Prediction"])

# Also mount under /api/py for Next.js API_BASE compatibility
api_py_router = APIRouter(prefix="/api/py")
api_py_router.include_router(health_router, tags=["Health"])
api_py_router.include_router(model_info_router, tags=["Model Info"])
api_py_router.include_router(classes_router, tags=["Classes"])
api_py_router.include_router(metrics_router, tags=["Metrics"])
api_py_router.include_router(predict_router, tags=["Prediction"])
app.include_router(api_py_router)

# Mount frontend static export if available (enables single-container full-stack deployment)
FRONTEND_OUT = PROJECT_ROOT / "frontend" / "out"
if FRONTEND_OUT.exists() and (FRONTEND_OUT / "index.html").exists():
    _next_dir = FRONTEND_OUT / "_next"
    if _next_dir.exists():
        app.mount("/_next", StaticFiles(directory=str(_next_dir)), name="next_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Allow API docs and OpenAPI specs to bypass static catch-all
        if full_path in ("docs", "redoc", "openapi.json"):
            return None
        file_path = FRONTEND_OUT / full_path
        if full_path and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_OUT / "index.html"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
