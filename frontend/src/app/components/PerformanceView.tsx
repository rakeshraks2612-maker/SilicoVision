"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface KPI {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
}

interface CMItem {
  actual: string;
  predicted: string;
  value: number;
}

interface ROCPoint {
  fpr: number;
  [key: string]: number;
}

interface DistItem {
  class: string;
  count: number;
  percentage: number;
}

interface ReportItem {
  class: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
}

interface MetricsResponse {
  kpi: KPI;
  confusion_matrix: CMItem[];
  roc_data: ROCPoint[];
  distribution: DistItem[];
  report: ReportItem[];
}

export default function PerformanceView() {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const classes = ["Center", "Donut", "Edge-Loc", "Edge-Ring", "Loc", "Random", "Scratch", "Near-full"];

  useEffect(() => {
    fetch("http://localhost:8000/metrics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch model metrics");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to connect to the backend server");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-zinc-400 text-sm">Loading performance analytics from server...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 border-red-500/30 text-center space-y-4">
        <p className="text-red-400 font-medium">⚠️ Connection Refused: Backend Offline</p>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          Could not fetch real-time performance analytics. Please verify the FastAPI backend server is running on <code className="text-white bg-black/40 px-1 py-0.5 rounded">http://localhost:8000</code>.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary hover:bg-primary/95 text-black font-bold text-xs rounded transition-all focus:outline-none"
        >
          Try Reconnecting
        </button>
      </div>
    );
  }

  // Nvidia theme color palette
  const chartColors = [
    "#99FF33",
    "#76B900",
    "#55A600",
    "#3E7A00",
    "#8EE500",
    "#A6FF00",
    "#7CFC00",
    "#ADFF2F",
  ];

  // Helper to restructure the 1D confusion matrix array back to a 2D matrix
  const getCMValue = (actual: string, predicted: string): number => {
    const found = data.confusion_matrix.find(
      (item) => item.actual === actual && item.predicted === predicted
    );
    return found ? found.value : 0;
  };

  return (
    <div className="space-y-8 animate-page-fade">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          📊 Model Performance Analytics
        </h1>
        <p className="mt-3 text-lg text-zinc-400 max-w-4xl">
          Explore detailed statistical performance and classification metrics of the trained{" "}
          <strong className="text-primary">EfficientNet-B2</strong> model on the{" "}
          <strong className="text-white">WM-811K</strong> test partition.
        </p>
      </div>

      <hr className="border-zinc-800" />

      {/* KPI Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">📈 Key Performance Indicators (KPIs)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="glass-card p-4">
            <p className="text-xs text-zinc-400">Accuracy</p>
            <p className="text-2xl font-black text-primary mt-1">{data.kpi.accuracy.toFixed(2)}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-zinc-400">Macro Precision</p>
            <p className="text-2xl font-black text-primary mt-1">{data.kpi.precision.toFixed(2)}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-zinc-400">Macro Recall</p>
            <p className="text-2xl font-black text-primary mt-1">{data.kpi.recall.toFixed(2)}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-zinc-400">Macro F1-Score</p>
            <p className="text-2xl font-black text-primary mt-1">{data.kpi.f1_score.toFixed(2)}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-zinc-400">ROC AUC</p>
            <p className="text-2xl font-black text-primary mt-1">{data.kpi.roc_auc.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <hr className="border-zinc-800" />

      {/* Confusion Matrix and ROC Curve Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Confusion Matrix Heatmap */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">🧩 Confusion Matrix Heatmap</h3>
            <p className="text-xs text-zinc-500 mt-1">Normalized counts of true vs. predicted defect classes.</p>
          </div>
          <div className="overflow-x-auto py-2">
            <div className="min-w-[420px] select-none">
              {/* Header Row */}
              <div className="grid grid-cols-9 gap-1 text-center font-bold text-[10px] text-zinc-500 pb-1">
                <div className="text-left font-normal text-zinc-600">True / Pred</div>
                {classes.map((cls) => (
                  <div key={cls} className="truncate">{cls}</div>
                ))}
              </div>
              
              {/* Matrix Rows */}
              <div className="space-y-1">
                {classes.map((actual) => (
                  <div key={actual} className="grid grid-cols-9 gap-1 text-center items-center">
                    <div className="text-left text-[10px] font-bold text-zinc-400 truncate pr-1">
                      {actual}
                    </div>
                    {classes.map((pred) => {
                      const val = getCMValue(actual, pred);
                      // Calculate opacity based on value
                      const opacity = val === 0 ? 0.05 : 0.1 + val * 0.9;
                      const isDiagonal = actual === pred;
                      
                      return (
                        <div
                          key={pred}
                          style={{
                            backgroundColor: isDiagonal
                              ? `rgba(118, 185, 0, ${opacity})`
                              : `rgba(0, 229, 255, ${opacity * 0.8})`,
                            border: `1px solid ${
                              isDiagonal ? "rgba(118, 185, 0, 0.15)" : "rgba(0, 229, 255, 0.05)"
                            }`,
                          }}
                          className="h-10 flex items-center justify-center text-xs font-bold text-white rounded transition-transform hover:scale-105 cursor-help"
                          title={`True: ${actual} | Predicted: ${pred} | Value: ${val.toFixed(2)}`}
                        >
                          {val > 0 ? val.toFixed(2) : "0"}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Class ROC Curves */}
        <div className="glass-card p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">📈 Multi-Class ROC Curves</h3>
            <p className="text-xs text-zinc-500 mt-1">One-vs-Rest ROC curve comparison for all 8 categories.</p>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.roc_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="fpr" stroke="#888" type="number" domain={[0, 1]} tickFormatter={(v) => v.toFixed(1)} />
                <YAxis stroke="#888" type="number" domain={[0, 1.05]} tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 10, 10, 0.9)",
                    border: "1px solid rgba(118, 185, 0, 0.3)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ fontSize: "11px" }}
                  labelFormatter={(v) => `FPR: ${Number(v).toFixed(2)}`}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px", marginTop: "10px" }} />
                
                {classes.map((cls, i) => (
                  <Line
                    key={cls}
                    type="monotone"
                    dataKey={cls}
                    stroke={chartColors[i % chartColors.length]}
                    strokeWidth={1}
                    dot={false}
                    name={cls}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="Macro"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Macro Average"
                />
                <Line
                  type="monotone"
                  dataKey="Chance"
                  stroke="#666666"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Chance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <hr className="border-zinc-800" />

      {/* Classification Report details */}
      <div className="glass-card p-5 space-y-4">
        <h3 className="text-lg font-bold text-white">📋 Classification Report Details</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-zinc-400">
            <thead className="bg-black/30 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Defect Class</th>
                <th className="px-6 py-3 font-semibold">Precision</th>
                <th className="px-6 py-3 font-semibold">Recall</th>
                <th className="px-6 py-3 font-semibold">F1-Score</th>
                <th className="px-6 py-3 font-semibold">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {data.report.map((row) => (
                <tr key={row.class} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-6 py-3 font-bold text-white">{row.class}</td>
                  <td className="px-6 py-3 text-primary font-medium">{row.precision.toFixed(2)}</td>
                  <td className="px-6 py-3 text-primary font-medium">{row.recall.toFixed(2)}</td>
                  <td className="px-6 py-3 text-primary font-bold">{row.f1.toFixed(2)}</td>
                  <td className="px-6 py-3 text-zinc-300 font-mono">{row.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <hr className="border-zinc-800" />

      {/* Dataset Distribution (Pie and Bar) */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">📊 Dataset Class Distribution (Test Split)</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Pie Chart */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-base font-bold text-white text-center">Class Proportions (%)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="class"
                  >
                    {data.distribution.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 10, 0.9)",
                      border: "1px solid rgba(118, 185, 0, 0.3)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ fontSize: "11px", color: "#fff" }}
                    formatter={(val, name, props) => [`Count: ${val} (${props.payload.percentage.toFixed(1)}%)`, name]}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: "9px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-base font-bold text-white text-center">Class Support Counts</h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.distribution} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="class" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 10, 0.9)",
                      border: "1px solid rgba(118, 185, 0, 0.3)",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "#76B900" }}
                  />
                  <Bar dataKey="count" fill="#76B900" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-zinc-800" />

      {/* Specs and Summary Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">🧠 Model Specifications</h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-zinc-400 font-bold">Architecture:</span>
            <span className="text-zinc-200">EfficientNet-B2</span>
            <span className="text-zinc-400 font-bold">Defect Classes:</span>
            <span className="text-zinc-200">8 distinct categories</span>
            <span className="text-zinc-400 font-bold">Training Dataset:</span>
            <span className="text-zinc-200">WM-811K (LSWMD)</span>
            <span className="text-zinc-400 font-bold">Image Dimensions:</span>
            <span className="text-zinc-200">224 x 224 pixels</span>
            <span className="text-zinc-400 font-bold">Framework:</span>
            <span className="text-zinc-200">PyTorch (torchvision)</span>
            <span className="text-zinc-400 font-bold">Active Device:</span>
            <span className="text-primary font-bold">CUDA / GPU Accelerated (Auto)</span>
          </div>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">📝 Performance Summary</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The fine-tuned <strong className="text-primary">EfficientNet-B2</strong> classifier demonstrates solid results on wafer classification with an overall <strong className="text-white">Accuracy of 85.81%</strong> and a <strong className="text-white">Macro F1-Score of 84.40%</strong>.
          </p>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The exceptionally high <strong className="text-white">ROC AUC of 98.70%</strong> indicates outstanding discrimination capabilities, showing that the network correctly ranks defect probabilities. The minor divergence between Accuracy and Macro F1 is primarily driven by class imbalance (e.g., <strong className="text-white">Edge-Loc</strong> having 480 wafer maps in comparison to <strong className="text-white">Near-full</strong> with only 60). Distinct patterns like <strong className="text-white">Edge-Ring</strong> are classified with high precision (0.94) and F1-score (0.93), showing the model is highly capable of identifying systemic machinery failures.
          </p>
        </div>
      </div>
    </div>
  );
}
