"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface HistoryItem {
  time: string;
  filename: string;
  predictedClass: string;
  confidence: string;
}

interface TopPrediction {
  class_name: string;
  probability: number;
}

interface PredictionResult {
  predicted_class: string;
  confidence: number;
  top_predictions: TopPrediction[];
}

export default function PredictView() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);
    setError(null);

    if (selected.name.endsWith(".npy")) {
      setPreviewUrl(null); // No standard image preview for numpy array files
    } else {
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handlePredict = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.detail || "Prediction request failed");
      }

      const json: PredictionResult = await res.json();
      setResult(json);

      // Append to local session history
      const now = new Date();
      const newHistoryItem: HistoryItem = {
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        filename: file.name,
        predictedClass: json.predicted_class,
        confidence: `${(json.confidence * 100).toFixed(2)}%`,
      };
      setHistory((prev) => [newHistoryItem, ...prev]);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to the backend server");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  // Convert top-3 list to format suitable for Recharts horizontal bar chart (which needs values sorted ascending)
  const getChartData = () => {
    if (!result) return [];
    return [...result.top_predictions]
      .reverse()
      .map((pred) => ({
        name: pred.class_name,
        percentage: Number((pred.probability * 100).toFixed(1)),
      }));
  };

  return (
    <div className="space-y-8 animate-page-fade">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          🔍 Wafer Defect Predictor
        </h1>
        <p className="mt-3 text-lg text-zinc-400 max-w-4xl">
          Upload a single wafer map image (PNG, JPG, or JPEG) or a raw <code className="text-white bg-black/40 px-1 py-0.5 rounded">.npy</code> wafer array file to run real-time inference using the pre-loaded <strong className="text-primary">EfficientNet-B2</strong> model.
        </p>
      </div>

      <hr className="border-zinc-800" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upload Container */}
        <div className="glass-card p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">📥 Upload Wafer Map</h3>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-zinc-700 hover:border-primary/50 transition-colors rounded-xl bg-black/30">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-zinc-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-zinc-400">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-bold text-primary hover:text-primary/80 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".png,.jpg,.jpeg,.npy"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-zinc-500">PNG, JPG, JPEG, or NPY up to 5MB</p>
              </div>
            </div>

            {file && (
              <div className="mt-4 p-3 bg-black/40 border border-zinc-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-zinc-500 text-lg">📄</span>
                  <span className="text-sm text-zinc-200 truncate font-mono">{file.name}</span>
                </div>
                <span className="text-xs text-zinc-500 font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 focus:outline-none shadow-lg ${
              !file || loading
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                : "bg-primary text-black hover:bg-primary/90 hover:shadow-primary/20 hover:scale-[1.01]"
            }`}
          >
            {loading ? "⏳ Running Inference..." : "🚀 Run Predictor"}
          </button>
        </div>

        {/* Prediction Results & Preview */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">🖥️ Inference Results & Preview</h3>

          {/* Image Preview Area */}
          <div className="h-64 border border-zinc-800 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Wafer map preview"
                className="max-h-full max-w-full object-contain p-2"
              />
            ) : file ? (
              <div className="text-center space-y-2 p-4">
                <span className="text-4xl block">📊</span>
                <p className="text-sm font-bold text-zinc-300">Raw Numpy Array Loaded</p>
                <p className="text-xs text-zinc-500 font-mono">{file.name}</p>
              </div>
            ) : (
              <p className="text-zinc-500 text-xs">🖼️ Upload a wafer map to view preview.</p>
            )}
          </div>

          {/* Results Block */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center space-x-3 py-6"
              >
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-zinc-400 text-sm font-medium">Model evaluating patterns...</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg space-y-1 text-sm"
              >
                <p className="text-red-400 font-bold">❌ Prediction Failure</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{error}</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-1 text-sm text-zinc-300">
                  <p className="text-primary font-bold">🎉 Predictive Classification Complete!</p>
                  <p className="text-xs">
                    Detected Defect Signature: <strong className="text-white">{result.predicted_class}</strong>
                  </p>
                  <p className="text-xs">
                    Probability Confidence: <strong className="text-white">{(result.confidence * 100).toFixed(2)}%</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/20 p-4 border border-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-400">Predicted Class</span>
                    <p className="text-lg font-bold text-white mt-1">{result.predicted_class}</p>
                  </div>
                  <div className="bg-black/20 p-4 border border-zinc-800 rounded-lg">
                    <span className="text-xs text-zinc-400">Confidence</span>
                    <p className="text-lg font-bold text-primary mt-1">{(result.confidence * 100).toFixed(2)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    📊 Top-3 Class Probability Distribution
                  </h4>
                  <div className="h-28 w-full text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getChartData()}
                        layout="vertical"
                        margin={{ top: 0, right: 35, left: -25, bottom: 0 }}
                      >
                        <XAxis type="number" domain={[0, 110]} hide />
                        <YAxis dataKey="name" type="category" stroke="#888" width={60} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(10, 10, 10, 0.9)",
                            border: "1px solid rgba(118, 185, 0, 0.3)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                          {getChartData().map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={idx === 2 ? "#76B900" : "rgba(118,185,0,0.5)"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {!result && !loading && !error && (
              <div className="py-12 text-center">
                <span className="text-2xl text-zinc-600 block mb-2">🎯</span>
                <p className="text-zinc-500 text-xs">Run prediction to see outputs.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <hr className="border-zinc-800" />

      {/* Prediction Session History */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">📋 Session Prediction History</h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs font-bold text-zinc-500 hover:text-red-400 transition-colors focus:outline-none"
            >
              🗑️ Clear History
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-zinc-400">
                <thead className="bg-black/30 font-semibold text-zinc-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Filename</th>
                    <th className="px-6 py-3">Predicted Class</th>
                    <th className="px-6 py-3">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {history.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-6 py-3 text-zinc-500 font-mono">{item.time}</td>
                      <td className="px-6 py-3 text-zinc-300 font-mono truncate max-w-xs">{item.filename}</td>
                      <td className="px-6 py-3 font-bold text-white">{item.predictedClass}</td>
                      <td className="px-6 py-3 text-primary font-bold">{item.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 text-center text-zinc-500 text-xs">
            💡 No predictions have been recorded in this session yet.
          </div>
        )}
      </div>
    </div>
  );
}
