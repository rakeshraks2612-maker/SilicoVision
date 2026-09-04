# SilicoVision 🔬

> **AI-Powered Semiconductor Wafer Defect Classification & Yield Optimization Platform**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-SilicoVision-blue?logo=github)](https://github.com/rakeshraks2612-maker/SilicoVision)

SilicoVision is an enterprise-grade computer vision and deep learning system engineered to classify semiconductor wafer defects from spatial wafer maps (**WM-811K benchmark**). It delivers real-time defect pattern detection to accelerate root-cause isolation, reduce scrap wafers, and optimize semiconductor fab yield.

---

## 🌐 Live Access & Deployment

| Service | Endpoint / URL | Description |
|---|---|---|
| **Live Web Dashboard** | [Dashboard](https://expand-premier-flex-ira.trycloudflare.com) | Public live HTTPS dashboard with interactive 3D particle canvas & Playground |
| **Local Dashboard** | `http://localhost:3000` | Next.js 16 full-stack production dashboard |
| **FastAPI Backend** | `http://localhost:8000` | High-performance Python PyTorch inference server |
| **Interactive Swagger API Docs** | `http://localhost:8000/docs` | OpenAPI documentation and interactive endpoint testing |
| **GitHub Repository** | [rakeshraks2612-maker/SilicoVision](https://github.com/rakeshraks2612-maker/SilicoVision) | Source code, models, and evaluation pipelines |

---

## 🚀 Key Features

* **Deep Learning Defect Classifier**: PyTorch pipeline using EfficientNet-B2 (7.7M parameters) and ResNet-18 architectures trained with `WeightedFocalLoss` to overcome extreme 90:1 class imbalance across 8 defect categories (*Center, Donut, Edge-Loc, Edge-Ring, Loc, Random, Scratch, Near-full*).
* **Discrete Defect Geometry Preservation**: Custom nearest-neighbor preprocessing preserving the discrete 3-state categorical wafer map representation (`0=Background`, `1=Pass Die`, `2=Defective Die`) without interpolation blurring.
* **Interactive Wafer Playground**: 
  - Real-time simulation across all 8 failure archetypes.
  - Drag-and-drop support for raw `.npy` 2D numpy arrays and wafer map imagery (`.png`, `.jpg`).
  - Real-time AI classification with top candidate probabilities, confidence scores, and inference latency telemetry.
* **3D Interactive Particle & Silicon Terrain Canvas**:
  - 3 switchable visual physics themes: **Quantum 3D Silicon Terrain Mesh**, **3D Spiral Galaxy Cluster**, and **Bioluminescent Fluid Flow**.
  - Dynamic mouse cursor halo magnetism, undulating wave ripples, and animated data packet streams.
* **Fab Telemetry & Financial Yield Impact**:
  - Interactive Recharts confusion matrix and multi-class ROC-AUC curves (~98.4% Macro ROC-AUC).
  - Configurable Fab Yield Savings Calculator computing prevented scrap costs in USD ($).
* **Next.js API Proxy Routing**: Reverse proxy routing (`/api/py/*` → `127.0.0.1:8000/*`) allowing zero-CORS deployment across localhost, public tunneling (Cloudflare/Ngrok), and cloud deployments (Vercel/Render).

---

## 📁 Repository Structure

```
SilicoVision/
├── backend/                      # FastAPI Microservice
│   ├── main.py                   # App lifecycle, CORS & router registration
│   └── routes/                   # REST API Endpoints
│       ├── health.py             # GET  /health (Service status & device telemetry)
│       ├── model_info.py         # GET  /model-info (Architecture & FLOPs metadata)
│       ├── classes.py            # GET  /classes (Defect archetypes & descriptions)
│       ├── metrics.py            # GET  /metrics (Confusion matrix & ROC-AUC data)
│       └── predict.py            # POST /predict (Wafer map inference)
├── frontend/                     # Next.js Full-Stack Application
│   ├── src/app/                  # App Router & UI Views
│   │   ├── page.tsx              # Main application shell, sticky navigation & modals
│   │   ├── layout.tsx            # Global HTML layout & typography
│   │   ├── globals.css           # Tailwind CSS styles & animations
│   │   └── components/           # Modular Dashboard Components
│   │       ├── BackgroundCanvas.tsx # 3D Silicon terrain & particle physics canvas
│   │       ├── HomeView.tsx      # Landing hero & architecture overview
│   │       ├── ModelsView.tsx    # Neural network catalog & parameter comparison
│   │       ├── PredictView.tsx   # Interactive wafer playground & defect testing
│   │       ├── PerformanceView.tsx # Confusion matrix & ROC-AUC fab telemetry
│   │       ├── DatasetView.tsx   # WM-811K benchmark dataset breakdown
│   │       └── ApiDocsView.tsx   # Developer API documentation & curl examples
│   ├── next.config.ts            # Next.js rewrites & backend proxy rules
│   └── package.json              # Frontend dependencies
├── src/                          # Machine Learning & Data Pipeline
│   ├── data/                     # WM-811K parsing, dataset loaders & augmentation
│   ├── models/                   # EfficientNet & ResNet model definitions
│   ├── training/                 # WeightedFocalLoss & model trainer
│   └── evaluation/               # Inference utilities & metric evaluators
├── checkpoints/                  # Trained PyTorch Model Weights
│   └── efficientnet_b2_wm811k/   # Best checkpoint (best.pt)
├── evaluation_effnet/            # Precomputed benchmark metrics & confusion matrix
├── configs/                      # Training YAML configuration files
├── tests/                        # Automated PyTest unit tests
├── train.py                      # Model training entrypoint
└── predict.py                    # CLI prediction tool
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18.0+
- **npm** or **pnpm**

---

### 2. Backend Setup (FastAPI & PyTorch)

```bash
# Clone the repository
git clone https://github.com/rakeshraks2612-maker/SilicoVision.git
cd SilicoVision

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend is accessible at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.*

---

### 3. Frontend Setup (Next.js Dashboard)

```bash
cd frontend

# Install Node dependencies
npm install

# Option A: Run in development mode
npm run dev

# Option B: Run in optimized production mode (Recommended)
npm run build
npm run start -- -p 3000
```
*Dashboard will be available at `http://localhost:3000`.*

---

### 4. Running a Public Live URL (Cloudflare Tunnel)

To share the running dashboard publicly on a live HTTPS link:
```bash
cloudflared tunnel --url http://localhost:3000
```

---

## 📡 REST API Usage Examples

### Wafer Classification (`POST /predict`)

#### Example with cURL:
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_wafer.png"
```

#### Example Response:
```json
{
  "predicted_class": "Center",
  "confidence": 0.9423,
  "top_predictions": [
    { "class_name": "Center", "probability": 0.9423 },
    { "class_name": "Donut", "probability": 0.0381 },
    { "class_name": "Loc", "probability": 0.0112 }
  ],
  "device": "cpu",
  "inference_time_ms": 4.2
}
```

#### Example with Python `requests`:
```python
import io
import requests
import numpy as np

# In-memory 2D wafer array (0=Background, 1=Pass, 2=Defect)
buffer = io.BytesIO()
np.save(buffer, wafer_matrix_2d)
buffer.seek(0)

response = requests.post(
    "http://localhost:8000/predict",
    files={"file": ("wafer.npy", buffer.getvalue())}
)
print("Predicted Defect:", response.json()["predicted_class"])
print("Confidence:", response.json()["confidence"])
```

---

## 📊 Defect Classes Supported

| Class ID | Defect Pattern | Description | Common Root Cause |
|---|---|---|---|
| 0 | **Center** | Concentrated failure cluster in wafer core | CMP over-polishing, spin-coating center anomaly |
| 1 | **Donut** | Ring-shaped cluster with intact center | Thermal gradient unevenness during rapid annealing |
| 2 | **Edge-Loc** | Localized cluster along wafer perimeter | Edge-bead removal (EBR) solvent splash |
| 3 | **Edge-Ring** | Continuous ring along outer perimeter | Chuck clamping ring stress or gas flow turbulence |
| 4 | **Loc** | Localized random cluster | Particulate contamination or lithography mask defect |
| 5 | **Random** | Dispersed die failures | Substrate crystal dislocations or airborne dust |
| 6 | **Scratch** | Linear physical surface scratch | Robotic arm handling contact or polishing debris |
| 7 | **Near-full** | Massive whole-wafer yield loss | Complete etching breakdown or gross photoresist failure |

---

## 🧪 Testing

Execute automated unit and integration tests with PyTest:
```bash
pytest tests/ -v
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Designed and developed for semiconductor defect inspection and yield optimization research.
