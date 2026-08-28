"use client";

import React, { useState } from "react";
import {
  Cpu,
  Zap,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Code2,
  ArrowRight,
  ShieldAlert,
  Server,
  Flame,
} from "lucide-react";

interface ModelsViewProps {
  onSelectModel?: (modelId: string) => void;
}

export default function ModelsView({ onSelectModel }: ModelsViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);

  const models = [
    {
      id: "effnet-b2",
      name: "SilicoVision EfficientNet-B2",
      badge: "Production Recommended",
      category: "Production",
      architecture: "EfficientNet-B2 (Compound Scaled)",
      params: "7.7M",
      vram: "420 MB",
      gpu: "1x NVIDIA T4 / RTX 4090 / A100",
      latency: "4.2 ms",
      accuracy: "83.1%",
      macroAuc: "98.7%",
      f1: "82.5%",
      loss: "WeightedFocalLoss (γ=2.0)",
      desc: "Our primary flagship classifier tuned for severe class imbalances across WM-811K wafer datasets. Delivers high sensitivity on rare defect archetypes like Donut, Scratch, and Near-full.",
      code: `import torch
from src.evaluation.inference import load_model, preprocess_wafer_array

# Load SilicoVision EfficientNet-B2
model, class_to_index, device = load_model("checkpoints/efficientnet_b2_wm811k/best.pt")

# Run inference on 2D wafer array
tensor = preprocess_wafer_array(wafer_numpy_2d).to(device)
with torch.no_grad():
    probabilities = torch.softmax(model(tensor), dim=1)
    print("Top Defect Class:", probabilities.argmax(dim=1))`,
    },
    {
      id: "resnet-18",
      name: "SilicoVision ResNet-18 Edge",
      badge: "Ultra-Low Latency",
      category: "Edge",
      architecture: "ResNet-18 (Residual CNN)",
      params: "11.2M",
      vram: "280 MB",
      gpu: "NVIDIA Jetson / Edge TensorRT",
      latency: "1.8 ms",
      accuracy: "81.4%",
      macroAuc: "97.8%",
      f1: "80.6%",
      loss: "CrossEntropyLoss + Focal",
      desc: "Optimized for in-line high-throughput fab scanning tools requiring sub-2 millisecond processing per silicon wafer map.",
      code: `import torch
from src.models import build_resnet18

# Initialize Edge-Optimized ResNet-18
model = build_resnet18(num_classes=8, pretrained=False)
model.eval()
print("Model initialized for edge wafer inspection pipeline.")`,
    },
    {
      id: "focalnet-wm811k",
      name: "SilicoVision FocalNet-811K",
      badge: "Imbalance Specialist",
      category: "Specialist",
      architecture: "EfficientNet-B0 + Dynamic Focal Head",
      params: "4.0M",
      vram: "310 MB",
      gpu: "1x NVIDIA RTX / Tensor Core",
      latency: "2.9 ms",
      accuracy: "82.3%",
      macroAuc: "98.4%",
      f1: "82.9%",
      loss: "Adaptive Inverse Frequency Focal",
      desc: "Specially calibrated to maximize recall on minority failure classes (Donut at 0.856 recall, Random at 0.879 recall).",
      code: `from src.training.losses import WeightedFocalLoss, inverse_frequency_class_weights

# Adaptive inverse frequency focal loss configuration
criterion = WeightedFocalLoss(gamma=2.0)`,
    },
    {
      id: "wafer-vit",
      name: "SilicoVision Wafer-ViT (Vision Transformer)",
      badge: "Research Preview",
      category: "Research",
      architecture: "Vision Transformer (ViT-Small / Patch 16)",
      params: "22.1M",
      vram: "850 MB",
      gpu: "1x NVIDIA A100 / H100",
      latency: "8.4 ms",
      accuracy: "84.9%",
      macroAuc: "99.1%",
      f1: "84.8%",
      loss: "Focal Label Smoothing",
      desc: "Self-attention transformer modeling long-range spatial correlations across large wafer diameters.",
      code: `# Vision Transformer for Global Wafer Attention
# Patch Size: 16x16, 8 Attention Heads`,
    },
  ];

  const filters = ["All", "Production", "Edge", "Specialist", "Research"];

  const filteredModels =
    activeFilter === "All"
      ? models
      : models.filter((m) => m.category === activeFilter);

  return (
    <div className="space-y-8 animate-page-fade">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#76B900] uppercase tracking-wider mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>NIM Model Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Semiconductor Defect Microservices
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Select a deep learning architecture optimized for your fab throughput and accuracy tolerances.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 p-1 rounded-lg bg-black/60 border border-zinc-800 self-start">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeFilter === filter
                  ? "bg-[#76B900] text-black shadow-[0_0_12px_rgba(118,185,0,0.4)]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="glass-card glow-card p-6 flex flex-col justify-between space-y-6"
          >
            {/* Card Top */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#76B900] bg-[rgba(118,185,0,0.12)] px-2 py-0.5 rounded border border-[rgba(118,185,0,0.3)]">
                    {model.badge}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-2 tracking-tight">
                    {model.name}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs text-zinc-500 block">Latency</span>
                  <span className="font-mono text-sm font-bold text-[#00E5FF]">
                    {model.latency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{model.desc}</p>

              {/* Specs Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 block">Parameters</span>
                  <span className="text-xs font-bold text-white font-mono">{model.params}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 block">VRAM</span>
                  <span className="text-xs font-bold text-white font-mono">{model.vram}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 block">Macro AUC</span>
                  <span className="text-xs font-bold text-[#76B900] font-mono">{model.macroAuc}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-zinc-800/80">
                  <span className="text-[10px] font-mono text-zinc-500 block">Macro F1</span>
                  <span className="text-xs font-bold text-[#00E5FF] font-mono">{model.f1}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono">
                <Server className="w-3.5 h-3.5 text-[#76B900]" />
                <span>Target: {model.gpu}</span>
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedSnippet(selectedSnippet === model.id ? null : model.id)}
                className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-[#76B900]" />
                <span>{selectedSnippet === model.id ? "Hide Code" : "Code Snippet"}</span>
              </button>

              <button
                onClick={() => onSelectModel?.(model.id)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg font-semibold text-xs bg-[#76B900] text-black hover:bg-[#86d400] transition-all shadow-[0_0_15px_rgba(118,185,0,0.35)] cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Test in Playground</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Code Snippet Drawer */}
            {selectedSnippet === model.id && (
              <div className="pt-2">
                <pre className="p-3 code-block text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
                  <code>{model.code}</code>
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
