"use client";

import React from "react";
import { motion } from "framer-motion";

export default function HomeView() {
  const kpis = [
    {
      label: "Test Accuracy",
      value: "85.81%",
      desc: "Overall accuracy of the EfficientNet-B2 classifier on the test split.",
    },
    {
      label: "Macro F1 Score",
      value: "84.40%",
      desc: "Macro-average F1 score, representing robust performance across all 8 classes.",
    },
    {
      label: "ROC AUC",
      value: "98.70%",
      desc: "Area Under the Receiver Operating Characteristic Curve, showing excellent class separation.",
    },
    {
      label: "Defect Classes",
      value: "8",
      desc: "Number of spatial defect patterns identified by the classifier.",
    },
  ];

  return (
    <div className="space-y-8 animate-page-fade">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          🔬 Silicon Wafer Defect Classification Dashboard
        </h1>
        <p className="mt-3 text-lg text-zinc-400 max-w-4xl">
          An advanced Deep Learning platform powered by <strong className="text-primary">EfficientNet-B2</strong> and trained on the industry-standard{" "}
          <strong className="text-white">WM-811K (LSWMD)</strong> dataset. This application classifies spatial defect patterns on silicon semiconductor wafers to optimize manufacturing yield and enable automated quality control.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">📊 Key Performance Metrics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-card glow-card p-6"
            >
              <p className="text-sm font-medium text-zinc-400 truncate">{kpi.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{kpi.value}</p>
              <p className="mt-2 text-xs text-zinc-500">{kpi.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">📝 Project Overview</h3>
          <p className="text-zinc-400 leading-relaxed text-sm">
            Semiconductor manufacturing processes are highly sensitive. Spatial defect patterns on silicon wafers frequently occur due to specific equipment issues or process variations. Automatically classifying these defect patterns is crucial for:
          </p>
          <ul className="list-disc pl-5 text-zinc-400 space-y-2 text-sm">
            <li>
              <strong className="text-white">Root-Cause Analysis:</strong> Linking pattern types to faulty machine components.
            </li>
            <li>
              <strong className="text-white">Yield Management:</strong> Taking immediate corrective action to minimize manufacturing waste.
            </li>
            <li>
              <strong className="text-white">Process Optimization:</strong> Reducing human inspection errors and cycle times.
            </li>
          </ul>
          <p className="text-zinc-400 text-sm">
            This dashboard offers clean visual navigation and predictive capabilities to analyze wafer map bin files using modern artificial intelligence.
          </p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">🧠 Model Information</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Architecture:</span>
              <span className="text-zinc-200">EfficientNet-B2</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Parameter Count:</span>
              <span className="text-zinc-200">~7.7M parameters (lightweight edge-friendly size)</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Input Shape:</span>
              <span className="text-zinc-200">224 x 224 px, 3 channels</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Optimizer:</span>
              <span className="text-zinc-200">AdamW with Cosine Annealing scheduler</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Loss Function:</span>
              <span className="text-zinc-200">Weighted Focal Loss & Smoothing</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-zinc-400 font-medium">Training Strategy:</span>
              <span className="text-zinc-200">Transfer learning & fine-tuning on wafer maps</span>
            </li>
          </ul>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">🛠️ Technologies Used</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Python 3.11",
              "PyTorch 2.2+",
              "FastAPI",
              "Next.js 16 (App Router)",
              "React 19",
              "TailwindCSS 4",
              "Framer Motion",
              "Recharts",
              "OpenCV",
            ].map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-300"
              >
                {tech}
              </span>
            ))}
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            By shifting from Streamlit to Next.js + FastAPI, this application decouples data visualization from ML execution, maximizing speed, security, and component reusability.
          </p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">💾 Dataset Information</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Dataset Name:</span>
              <span className="text-zinc-200">WM-811K (LSWMD)</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Total Wafer Maps:</span>
              <span className="text-zinc-200">811,037 wafers from real fab lots</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Labeled Wafers:</span>
              <span className="text-zinc-200">172,950 domain-categorized maps</span>
            </li>
            <li className="flex justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-400 font-medium">Defect Categories:</span>
              <span className="text-zinc-200">8 defect types (+1 normal class)</span>
            </li>
            <li className="flex justify-between pb-1">
              <span className="text-zinc-400 font-medium">Class Imbalance:</span>
              <span className="text-red-400 font-medium">Highly severe (0.3% - 30% bounds)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
