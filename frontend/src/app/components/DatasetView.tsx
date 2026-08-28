"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export default function DatasetView() {
  const [showDetails, setShowDetails] = useState(false);

  const stats = [
    { label: "Total Wafers", value: "811,110", desc: "Total wafers in the dataset (labeled + unlabeled)." },
    { label: "Labeled Wafers", value: "172,950", desc: "Wafers with verified defect/normal labels." },
    { label: "Defect Classes", value: "8 Types", desc: "Distinct defect signature classes." },
    { label: "Normal Wafers", value: "147,435", desc: "Wafers with no spatial defect patterns." },
  ];

  const classesInfo = [
    {
      name: "Center",
      emoji: "🎯",
      pattern: "⬤ Clustered in middle",
      desc: "Defects form a concentrated cluster in the center area of the wafer. Often caused by spinner or chemical delivery issues.",
    },
    {
      name: "Donut",
      emoji: "🍩",
      pattern: "◯ Concentric ring",
      desc: "Defects form a circular band or ring shape away from the edges, resembling a torus. Typically caused by gas flow or heating loops.",
    },
    {
      name: "Edge-Loc",
      emoji: "🌅",
      pattern: "◑ Clustered at edge",
      desc: "Defects form a cluster located along the outer periphery of the wafer. Usually associated with handling issues or edge deposition.",
    },
    {
      name: "Edge-Ring",
      emoji: "⭕",
      pattern: "⭕ Complete outer ring",
      desc: "Defects cover the entire outer rim or circumference of the wafer. Often related to etching chamber boundary effects.",
    },
    {
      name: "Loc",
      emoji: "📍",
      pattern: "⚬ Localized cluster",
      desc: "A dense cluster of defects located anywhere on the wafer map, excluding the edge and center. Points to local contamination.",
    },
    {
      name: "Random",
      emoji: "🎲",
      pattern: "░ Widespread noise",
      desc: "Individual defect pixels scattered across the wafer without a clear spatial structure. Associated with random particulate noise.",
    },
    {
      name: "Scratch",
      emoji: "➖",
      pattern: "✏️ Linear/Curved lines",
      desc: "Defects align in thin linear or curved scratches across the wafer. Caused by mechanical handling arm scratches or friction.",
    },
    {
      name: "Near-full",
      emoji: "🚨",
      pattern: "██ Almost entire wafer",
      desc: "Wafer shows high defect densities spread over almost the entire surface area. Indicates systemic process failure.",
    },
  ];

  return (
    <div className="space-y-8 animate-page-fade">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          📦 WM-811K Dataset Overview
        </h1>
        <p className="mt-3 text-lg text-zinc-400 max-w-4xl">
          The <strong className="text-white">WM-811K (LSWMD)</strong> dataset is an industry-standard benchmark dataset for wafer map defect analysis. It consists of 811,110 wafer maps collected from 46,393 lots in real-world fabrication plants. Out of these, 172,950 wafer maps are labeled with specific failure types.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">📊 Dataset Distribution Statistics</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card p-6">
              <p className="text-sm font-medium text-zinc-400 truncate">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{stat.value}</p>
              <p className="mt-2 text-xs text-zinc-500">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-2">🧩 The Eight Wafer Defect Classes</h2>
        <p className="text-zinc-400 text-sm mb-4">Below is a breakdown of the spatial defect patterns categorized in the dataset:</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {classesInfo.map((c, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="glass-card p-5 space-y-3 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-xl">{c.emoji}</span> {c.name}
                </h3>
                <div className="mt-2 font-mono text-xs bg-black/40 border border-zinc-800 rounded px-2 py-1 text-primary inline-block">
                  {c.pattern}
                </div>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex justify-between items-center w-full text-left font-bold text-white hover:text-primary transition-colors focus:outline-none"
        >
          <span>🔍 Dataset Format & Bin Mapping Detail</span>
          <span className="text-lg">{showDetails ? "▲" : "▼"}</span>
        </button>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-400 space-y-3"
          >
            <p>In the raw data, wafer maps are represented as 2D integer grids where:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-white">0</strong> represents the blank space outside the wafer circle.</li>
              <li><strong className="text-white">1</strong> represents the normal silicon wafer area (background).</li>
              <li><strong className="text-white">2</strong> represents a failing bin or defect point.</li>
            </ul>
            <p>
              Deep learning preprocessing extracts these maps, resizes them to <code className="text-white bg-black/40 px-1 py-0.5 rounded">224x224</code> pixels using nearest-neighbor interpolation (which preserves the discrete wafer-bin values instead of blurring them), and feeds them to the EfficientNet-B2 neural network as normalized 3-channel images.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
