# SilicoVision Frontend 🔬

Next.js 16 (React 19 + Turbopack) production dashboard for semiconductor wafer map defect classification and fab yield telemetry.

---

## 🚀 Features

* **3D Perspective Silicon Terrain**: Interactive undulating wafer terrain mesh with real-time cursor physics and multiple theme presets.
* **Interactive Wafer Playground**: Draw, simulate, or upload `.npy` / image wafer maps with instant AI inference.
* **Fab Yield Analytics**: Interactive Recharts confusion matrices, ROC-AUC curves, and financial scrap savings model.
* **Reverse Proxy Integration**: Dynamic API routing to FastAPI (`/api/py/*` → `127.0.0.1:8000/*`).

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or build and run production server (Recommended)
npm run build
npm run start -- -p 3000
```

Dashboard is available at [http://localhost:3000](http://localhost:3000).
