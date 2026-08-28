"use client";

import React, { useState } from "react";
import {
  Terminal,
  Copy,
  Check,
  Server,
  Code2,
  ShieldCheck,
  Send,
  Boxes,
  Cpu,
} from "lucide-react";

export default function ApiDocsView() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/predict",
      desc: "Upload a wafer map image (.png, .jpg) or 2D numpy matrix (.npy) to get real-time defect classification and candidate probabilities.",
      requestExample: `curl -X POST "http://localhost:8000/predict" \\
  -H "accept: application/json" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@wafer_map.png"`,
      responseExample: `{
  "predicted_class": "Center",
  "confidence": 0.9423,
  "top_predictions": [
    { "class_name": "Center", "probability": 0.9423 },
    { "class_name": "Loc", "probability": 0.0381 },
    { "class_name": "Random", "probability": 0.0196 }
  ]
}`,
    },
    {
      method: "GET",
      path: "/metrics",
      desc: "Fetch current model benchmark metrics, per-class precision/recall, and macro ROC-AUC.",
      requestExample: `curl -X GET "http://localhost:8000/metrics" \\
  -H "accept: application/json"`,
      responseExample: `{
  "accuracy": 0.8311,
  "macro_roc_auc": 0.9842,
  "macro_f1": 0.8252,
  "classes": ["Center", "Donut", "Edge-Loc", "Edge-Ring", "Loc", "Random", "Scratch", "Near-full"]
}`,
    },
    {
      method: "GET",
      path: "/classes",
      desc: "List all 8 supported semiconductor defect archetypes and their corresponding index encodings.",
      requestExample: `curl -X GET "http://localhost:8000/classes"`,
      responseExample: `{
  "classes": [
    "Center", "Donut", "Edge-Loc", "Edge-Ring", 
    "Loc", "Random", "Scratch", "Near-full"
  ]
}`,
    },
    {
      method: "GET",
      path: "/health",
      desc: "FastAPI health check probe to monitor microservice availability and inference model load status.",
      requestExample: `curl -X GET "http://localhost:8000/health"`,
      responseExample: `{
  "status": "healthy",
  "model_loaded": true,
  "device": "cuda:0",
  "version": "1.0.0"
}`,
    },
  ];

  return (
    <div className="space-y-10 animate-page-fade">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#76B900] uppercase tracking-wider mb-1">
          <Terminal className="w-3.5 h-3.5" />
          <span>Developer API & Deployment</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          SilicoVision API Reference
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Integrate SilicoVision inference microservices into your manufacturing execution systems (MES) and fab yield pipelines.
        </p>
      </div>

      {/* Deployment Quickstart (Docker & Python SDK) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Docker Container */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-[#76B900]" />
              <h3 className="text-sm font-bold text-white">Docker Vision Microservice</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">GPU Accelerated</span>
          </div>
          <p className="text-xs text-zinc-400">
            Spin up a self-contained container with GPU TensorRT acceleration:
          </p>
          <div className="relative">
            <pre className="p-3 code-block text-[11px] text-zinc-300 overflow-x-auto">
              <code>{`# Pull & Launch SilicoVision Container
docker run --gpus all -d \\
  --name silicovision-api \\
  -p 8000:8000 \\
  -v $(pwd)/checkpoints:/app/checkpoints \\
  ghcr.io/rakeshraks2612-maker/silicovision:latest`}</code>
            </pre>
            <button
              onClick={() =>
                handleCopy(
                  `docker run --gpus all -d --name silicovision-api -p 8000:8000 -v $(pwd)/checkpoints:/app/checkpoints ghcr.io/rakeshraks2612-maker/silicovision:latest`,
                  "docker"
                )
              }
              className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-zinc-400 hover:text-white"
            >
              {copiedId === "docker" ? <Check className="w-3.5 h-3.5 text-[#76B900]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Python Client Integration */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-sm font-bold text-white">Python In-Line Ingestion</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Python 3.10+</span>
          </div>
          <p className="text-xs text-zinc-400">
            Directly classify in-memory numpy wafer arrays without disk I/O:
          </p>
          <div className="relative">
            <pre className="p-3 code-block text-[11px] text-zinc-300 overflow-x-auto">
              <code>{`import io, requests, numpy as np

# In-memory 2D wafer array (0=bg, 1=pass, 2=fail)
buffer = io.BytesIO()
np.save(buffer, wafer_matrix_2d)
buffer.seek(0)

res = requests.post(
    "http://localhost:8000/predict",
    files={"file": ("wafer.npy", buffer.getvalue())}
)
print("Defect:", res.json()["predicted_class"])`}</code>
            </pre>
            <button
              onClick={() =>
                handleCopy(
                  `import io, requests, numpy as np\nbuffer = io.BytesIO()\nnp.save(buffer, wafer_matrix_2d)\nbuffer.seek(0)\nres = requests.post("http://localhost:8000/predict", files={"file": ("wafer.npy", buffer.getvalue())})\nprint("Defect:", res.json()["predicted_class"])`,
                  "python"
                )
              }
              className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-zinc-400 hover:text-white"
            >
              {copiedId === "python" ? <Check className="w-3.5 h-3.5 text-[#76B900]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* REST API Endpoints Reference */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">REST API Endpoints Specification</h3>

        <div className="space-y-4">
          {endpoints.map((ep, idx) => (
            <div key={idx} className="glass-card p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                      ep.method === "POST"
                        ? "bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40"
                        : "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">{ep.path}</span>
                </div>
                <span className="text-xs text-zinc-400">Content-Type: application/json</span>
              </div>

              <p className="text-xs text-zinc-300">{ep.desc}</p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                {/* Request */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                    Example Request
                  </span>
                  <div className="relative">
                    <pre className="p-3 code-block text-[11px] text-zinc-300 overflow-x-auto">
                      <code>{ep.requestExample}</code>
                    </pre>
                    <button
                      onClick={() => handleCopy(ep.requestExample, `req-${idx}`)}
                      className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-zinc-400 hover:text-white"
                    >
                      {copiedId === `req-${idx}` ? (
                        <Check className="w-3 h-3 text-[#76B900]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Response */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[#76B900] block">
                    Example Response (200 OK)
                  </span>
                  <pre className="p-3 code-block text-[11px] text-[#76B900]/90 overflow-x-auto">
                    <code>{ep.responseExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
