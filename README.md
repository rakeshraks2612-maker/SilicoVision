# SilicoVision 🔬

> **AI-Powered Semiconductor Wafer Defect Classification & Yield Optimization Platform**

SilicoVision is an end-to-end computer vision and deep learning system engineered to classify semiconductor wafer defects from spatial wafer maps (WM-811K benchmark). It delivers real-time defect pattern detection to accelerate root-cause analysis, reduce scrap, and optimize semiconductor fab yield.

---

## 🚀 Key Features

* **Deep Learning Defect Classifier**: PyTorch pipeline using EfficientNet and ResNet-18 architectures with `WeightedFocalLoss` to handle extreme class imbalance across 8 defect categories (*Center, Donut, Edge-Loc, Edge-Ring, Loc, Random, Scratch, Near-full*).
* **Discrete Defect Geometry Preservation**: Custom nearest-neighbor preprocessing preserving the discrete 3-state wafer map representation (background, good die, defective die).
* **FastAPI Backend Service**: High-throughput REST API supporting batch and single-wafer image/numpy matrix inference (`.png`, `.jpg`, `.npy`).
* **Modern Full-Stack Dashboard**: Next.js (App Router), React 19, Tailwind CSS, Lucide icons, Three.js / Canvas particle system, and real-time inference telemetry.
* **Comprehensive Evaluation**: Macro ROC-AUC (~0.984), confusion matrices, and per-class precision/recall metrics.

---

## 📁 Repository Structure

```
SilicoVision/
├── src/                          # Core Machine Learning & Data Pipeline
│   ├── data/                     # WM-811K parsing, EDA, and PyTorch dataset definitions
│   ├── models/                   # Neural network architectures
│   ├── training/                 # Trainer, WeightedFocalLoss, early stopping
│   ├── evaluation/               # ROC-AUC, classification metrics, inference utilities
│   └── utils/                    # Common helpers
├── backend/                      # FastAPI Backend Server
│   ├── main.py                   # App lifecycle & router configuration
│   └── routes/                   # API endpoints (/predict, /metrics, /classes, /health)
├── frontend/                     # Next.js Full-Stack Web Application
│   └── src/app/                  # Interactive wafer dashboard & visualization components
├── checkpoints/                  # Model weight storage
├── evaluation_effnet/            # Precomputed evaluation metrics & plots
├── configs/                      # Model & training configurations
├── tests/                        # Automated PyTest suite
├── app.py                        # Standalone Streamlit interface
├── train.py                      # Model training entrypoint
└── predict.py                    # CLI prediction tool
```

---

## ⚡ Quick Start

### 1. Backend & ML Setup

```bash
# Clone the repository
git clone https://github.com/rakeshraks2612-maker/SilicoVision.git
cd SilicoVision

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the SilicoVision dashboard.

---

## 🧪 Testing

Run the test suite with:
```bash
pytest tests/ -v
```

---

## 📊 Defect Classes Supported

| Class ID | Defect Pattern | Description |
|---|---|---|
| 0 | **Center** | Concentrated defects in the wafer core |
| 1 | **Donut** | Ring-shaped cluster with clear center |
| 2 | **Edge-Loc** | Localized cluster along the wafer edge |
| 3 | **Edge-Ring** | Continuous ring along the outer perimeter |
| 4 | **Loc** | Localized random cluster |
| 5 | **Random** | Dispersed die failures |
| 6 | **Scratch** | Linear physical surface scratch |
| 7 | **Near-full** | Massive whole-wafer yield loss |

---

## 📄 License

MIT [LICENSE](LICENSE). Designed and developed for semiconductor defect inspection and yield optimization research.
