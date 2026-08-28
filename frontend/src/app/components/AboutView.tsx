"use client";

import React from "react";

export default function AboutView() {
  return (
    <div className="space-y-8 animate-page-fade">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          ℹ️ About the Project
        </h1>
        <p className="mt-3 text-lg text-zinc-400 max-w-4xl">
          The <strong className="text-white">Silicon Wafer Defect Classification</strong> system is designed to automate the process of quality assurance in semiconductor fabrication. By leveraging state-of-the-art computer vision models, the system can recognize spatial arrangements of defects on wafer maps instantly, assisting yield engineers in fast diagnostics and downtime reduction.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">🛠️ Technical Specifications</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Frontend Framework</span>
              <span className="text-zinc-200">Next.js 16 / React 19 / TypeScript</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Styling Engine</span>
              <span className="text-zinc-200">TailwindCSS 4 (Native PostCSS)</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">API Backend</span>
              <span className="text-zinc-200">FastAPI (Python 3.11)</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Deep Learning Engine</span>
              <span className="text-zinc-200">PyTorch (torchvision)</span>
            </div>
            <div className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-bold">Model Architecture</span>
              <span className="text-zinc-200">EfficientNet-B2 Transfer-learning model</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-zinc-400 font-bold">Dataset Reference</span>
              <span className="text-zinc-200">WM-811K (LSWMD)</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">🎯 Project Goals</h2>
          <ol className="list-decimal pl-5 text-zinc-400 space-y-3 text-sm">
            <li>
              <strong className="text-white">High Precision Classification:</strong> Maximize macro F1 performance on highly imbalanced wafer maps using specialized focal losses and class frequency weighting.
            </li>
            <li>
              <strong className="text-white">Rapid Deployment:</strong> Enable decoupled Web API interfaces allowing remote inspection terminals, mobile monitoring endpoints, and fab-line control rooms to access model inference concurrently.
            </li>
            <li>
              <strong className="text-white">Interactive Visualizations:</strong> Offer clear, hardware-independent responsive charts for operators and yield engineers to analyze defect signatures with statistical confidence.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
