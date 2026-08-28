"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  DollarSign,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function PerformanceView() {
  const [waferVolume, setWaferVolume] = useState<number>(50000);
  const [waferCost, setWaferCost] = useState<number>(1200);

  // Per-class metrics from WM-811K benchmark evaluation (evaluation_effnet/metrics.json)
  const classMetrics = [
    { class: "Center", precision: 88.2, recall: 87.0, f1: 87.6, auc: 99.3, support: 832 },
    { class: "Donut", precision: 63.5, recall: 85.6, f1: 72.9, auc: 99.4, support: 146 },
    { class: "Edge-Loc", precision: 79.8, recall: 93.0, f1: 85.9, auc: 96.6, support: 2772 },
    { class: "Edge-Ring", precision: 95.8, recall: 67.1, f1: 78.9, auc: 99.0, support: 1126 },
    { class: "Loc", precision: 85.6, recall: 76.1, f1: 80.6, auc: 95.5, support: 1973 },
    { class: "Random", precision: 70.4, recall: 87.9, f1: 78.2, auc: 99.3, support: 257 },
    { class: "Scratch", precision: 81.9, recall: 80.5, f1: 81.2, auc: 98.4, support: 693 },
    { class: "Near-full", precision: 92.9, recall: 96.8, f1: 94.8, auc: 99.9, support: 95 },
  ];

  // Confusion matrix labels & matrix values (WM-811K test set)
  const matrixLabels = ["Center", "Donut", "Edge-Loc", "Edge-Ring", "Loc", "Random", "Scratch", "Near-full"];
  const confusionData = [
    [724, 8, 14, 2, 58, 12, 14, 0],
    [4, 125, 3, 0, 10, 3, 1, 0],
    [12, 6, 2579, 18, 110, 24, 23, 0],
    [3, 4, 308, 755, 34, 12, 10, 0],
    [52, 28, 260, 11, 1502, 65, 55, 0],
    [5, 8, 8, 0, 8, 226, 2, 0],
    [21, 18, 59, 2, 32, 3, 558, 0],
    [0, 0, 0, 0, 0, 0, 3, 92],
  ];

  // Simulated ROC curve thresholds
  const rocCurvePoints = [
    { fpr: 0.0, Center: 0.0, "Edge-Loc": 0.0, Scratch: 0.0, "Near-full": 0.0 },
    { fpr: 0.02, Center: 0.82, "Edge-Loc": 0.78, Scratch: 0.74, "Near-full": 0.95 },
    { fpr: 0.05, Center: 0.91, "Edge-Loc": 0.88, Scratch: 0.85, "Near-full": 0.99 },
    { fpr: 0.1, Center: 0.96, "Edge-Loc": 0.94, Scratch: 0.92, "Near-full": 1.0 },
    { fpr: 0.2, Center: 0.98, "Edge-Loc": 0.97, Scratch: 0.96, "Near-full": 1.0 },
    { fpr: 0.5, Center: 0.99, "Edge-Loc": 0.99, Scratch: 0.99, "Near-full": 1.0 },
    { fpr: 1.0, Center: 1.0, "Edge-Loc": 1.0, Scratch: 1.0, "Near-full": 1.0 },
  ];

  // Yield impact financial calculations
  const baselineDefectRate = 0.065; // 6.5% wafer defect rate
  const aiDefectCatchRate = 0.842; // Macro recall
  const preventedScrapWafers = Math.round(waferVolume * baselineDefectRate * aiDefectCatchRate * 0.42); // 42% rework recovery
  const estimatedSavingsUSD = preventedScrapWafers * waferCost;

  return (
    <div className="space-y-10 animate-page-fade">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#76B900] uppercase tracking-wider mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Fab Telemetry & Benchmarks</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Production Quality & Model Metrics
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Comprehensive evaluation of the EfficientNet-B2 classifier evaluated on the 7,894-wafer test split of WM-811K.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Macro ROC-AUC</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#76B900]">98.42%</p>
          <p className="text-[11px] text-zinc-500">One-vs-Rest class discrimination</p>
        </div>
        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Macro F1-Score</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#00E5FF]">82.52%</p>
          <p className="text-[11px] text-zinc-500">Harmonic mean across rare classes</p>
        </div>
        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Weighted Precision</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">84.15%</p>
          <p className="text-[11px] text-zinc-500">False-positive suppression rate</p>
        </div>
        <div className="glass-card p-5 space-y-1">
          <span className="text-xs font-mono text-zinc-400">Test Set Accuracy</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#76B900]">83.11%</p>
          <p className="text-[11px] text-zinc-500">Evaluated on 7,894 test wafers</p>
        </div>
      </div>

      {/* Per-Class Precision & Recall Bar Chart */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Per-Class Precision, Recall & F1 Breakdown</h3>
            <p className="text-xs text-zinc-400">Evaluating robustness on severe class imbalance</p>
          </div>
          <span className="text-xs font-mono text-[#76B900] bg-[rgba(118,185,0,0.1)] px-2 py-0.5 rounded border border-[rgba(118,185,0,0.2)]">
            WM-811K Test Split
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={classMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f242d" />
              <XAxis dataKey="class" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <YAxis stroke="#6b7280" domain={[50, 100]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d0f14",
                  borderColor: "rgba(118,185,0,0.3)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="precision" name="Precision (%)" fill="#76B900" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" name="Recall (%)" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" name="F1-Score (%)" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Class ROC Curves & Confusion Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Multi-Class ROC Curve (6 cols) */}
        <div className="lg:col-span-6 glass-card p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Multi-Class ROC-AUC Curves</h3>
            <p className="text-xs text-zinc-400">One-vs-Rest True Positive vs False Positive Tradeoff</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocCurvePoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f242d" />
                <XAxis dataKey="fpr" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <YAxis stroke="#6b7280" domain={[0, 1]} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d0f14",
                    borderColor: "rgba(118,185,0,0.3)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Line type="monotone" dataKey="Near-full" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Center" stroke="#76B900" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Edge-Loc" stroke="#00E5FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Scratch" stroke="#eab308" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix Interactive Grid (6 cols) */}
        <div className="lg:col-span-6 glass-card p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Confusion Matrix Heatmap</h3>
            <p className="text-xs text-zinc-400">Actual vs Predicted Distribution on 7,894 Wafers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10px] font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-1 text-left text-zinc-500 font-normal">Act \ Pred</th>
                  {matrixLabels.map((label) => (
                    <th key={label} className="p-1 text-zinc-400 font-semibold truncate max-w-[40px]">
                      {label.substring(0, 4)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusionData.map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="p-1 text-left text-zinc-400 font-semibold whitespace-nowrap">
                      {matrixLabels[rIdx]}
                    </td>
                    {row.map((val, cIdx) => {
                      const isDiagonal = rIdx === cIdx;
                      const intensity = isDiagonal ? Math.min(val / 2600, 1) : Math.min(val / 100, 0.8);
                      return (
                        <td
                          key={cIdx}
                          style={{
                            backgroundColor: isDiagonal
                              ? `rgba(118, 185, 0, ${0.15 + intensity * 0.7})`
                              : val > 20
                              ? `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`
                              : "transparent",
                          }}
                          className={`p-1 border border-zinc-900 rounded ${
                            isDiagonal ? "text-white font-bold" : val > 0 ? "text-zinc-400" : "text-zinc-700"
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fab Yield Scrap Reduction Estimator */}
      <div className="glass-card p-8 space-y-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-[#76B900]" />
          <h2 className="text-xl font-bold text-white">Fab Yield Scrap Reduction Simulator</h2>
        </div>
        <p className="text-xs text-zinc-400">
          Simulate annual cost recovery by integrating SilicoVision real-time defect classification into your fab inline inspection line.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Controls */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Annual Wafer Production Volume:</span>
                <span className="text-[#76B900] font-bold">{waferVolume.toLocaleString()} wafers/yr</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={waferVolume}
                onChange={(e) => setWaferVolume(Number(e.target.value))}
                className="w-full accent-[#76B900] bg-zinc-800"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-300">Average Finished Wafer Value:</span>
                <span className="text-[#00E5FF] font-bold">${waferCost.toLocaleString()} USD</span>
              </div>
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={waferCost}
                onChange={(e) => setWaferCost(Number(e.target.value))}
                className="w-full accent-[#00E5FF] bg-zinc-800"
              />
            </div>
          </div>

          {/* Results Display */}
          <div className="p-6 rounded-xl bg-black/60 border border-[rgba(118,185,0,0.3)] space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs text-zinc-400">Prevented Scrap Wafers:</span>
              <span className="text-lg font-bold font-mono text-white">
                {preventedScrapWafers.toLocaleString()} wafers
              </span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 block mb-1">Estimated Annual Yield Savings:</span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#76B900] tracking-tight">
                ${estimatedSavingsUSD.toLocaleString()}
              </p>
              <p className="text-[10px] text-zinc-500 mt-1">
                Based on 84.2% AI detection recall and 42% rework yield recovery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
