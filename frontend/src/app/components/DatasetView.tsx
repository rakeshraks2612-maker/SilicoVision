"use client";

import React from "react";
import {
  Boxes,
  Database,
  Layers,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DatasetView() {
  const classDistData = [
    { name: "Edge-Loc", count: 2772, pct: "35.1%", color: "#76B900" },
    { name: "Loc", count: 1973, pct: "25.0%", color: "#00E5FF" },
    { name: "Edge-Ring", count: 1126, pct: "14.3%", color: "#a855f7" },
    { name: "Center", count: 832, pct: "10.5%", color: "#3b82f6" },
    { name: "Scratch", count: 693, pct: "8.8%", color: "#eab308" },
    { name: "Random", count: 257, pct: "3.3%", color: "#f97316" },
    { name: "Donut", count: 146, pct: "1.9%", color: "#ec4899" },
    { name: "Near-full", count: 95, pct: "1.2%", color: "#ef4444" },
  ];

  const datasetStats = [
    { label: "Total Wafers in WM-811K", value: "811,457", sub: "Collected from 46,393 lots" },
    { label: "Labeled Defect Wafers", value: "172,950", sub: "Domain-annotated failure maps" },
    { label: "Evaluation Test Split", value: "7,894", sub: "Strict held-out validation set" },
    { label: "Class Imbalance Ratio", value: "29.2 : 1", sub: "Edge-Loc vs Near-full" },
  ];

  const defectArchetypes = [
    {
      name: "Center",
      rootCause: "Plasma etch uniformity, gas distribution unevenness in CVD chamber.",
      remedy: "Calibrate showerhead gas injector flow rate and wafer pedestal heating.",
    },
    {
      name: "Donut",
      rootCause: "Thermal gradient during rapid thermal annealing (RTA) or spin-coating puddle.",
      remedy: "Inspect lamp bank heating profile and photoresist dispense nozzles.",
    },
    {
      name: "Edge-Loc",
      rootCause: "Edge clamp finger friction, robotic end-effector misplacement.",
      remedy: "Re-align robotic arm blade and inspect wafer bevel gripping pressure.",
    },
    {
      name: "Edge-Ring",
      rootCause: "Edge bead removal (EBR) solvent overshoot or peripheral temperature drop.",
      remedy: "Adjust EBR nozzle distance and edge ring heating jacket.",
    },
    {
      name: "Loc",
      rootCause: "Localized particulate contamination from chamber wall flaking.",
      remedy: "Trigger vacuum chamber wet clean and replace particulate exhaust trap.",
    },
    {
      name: "Random",
      rootCause: "Airborne airborne particle deposition or raw silicon ingot crystal defects.",
      remedy: "Verify cleanroom ISO Class 1 air filtration and incoming boule purity.",
    },
    {
      name: "Scratch",
      rootCause: "Mechanical tweezers contact or surface dragging during wafer transfer.",
      remedy: "Replace wafer carrier cassettes and re-zero robotic transfer stages.",
    },
    {
      name: "Near-full",
      rootCause: "Catastrophic chemical mechanical planarization (CMP) pad failure or power surge.",
      remedy: "Immediate tool interlock shutdown and polish head overhaul.",
    },
  ];

  return (
    <div className="space-y-10 animate-page-fade">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-[#76B900] uppercase tracking-wider mb-1">
          <Boxes className="w-3.5 h-3.5" />
          <span>Semiconductor Benchmark Data</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          WM-811K (LSWMD) Dataset Hub
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          The worldwide standard benchmark dataset for silicon wafer defect pattern recognition in semiconductor manufacturing.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {datasetStats.map((stat, idx) => (
          <div key={idx} className="glass-card p-5 space-y-1">
            <span className="text-xs font-mono text-zinc-400">{stat.label}</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</p>
            <p className="text-[11px] text-zinc-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Class Distribution Chart & Encoding Standard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Test Split Class Distribution</h3>
              <p className="text-xs text-zinc-400">Extreme class imbalance across the 8 defect patterns</p>
            </div>
            <span className="text-xs font-mono text-[#00E5FF]">7,894 Wafers</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 10 }} />
                <YAxis stroke="#6b7280" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d0f14",
                    borderColor: "rgba(118,185,0,0.3)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {classDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3-State Discrete Encoding Standard (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Discrete Wafer Map Encoding</h3>
            <p className="text-xs text-zinc-400">3-State Categorical Tensor Representation</p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-black border border-zinc-700" />
                <div>
                  <p className="text-xs font-bold text-white">Value 0 — Background</p>
                  <p className="text-[10px] text-zinc-500">Outer void / beyond wafer perimeter</p>
                </div>
              </div>
              <span className="font-mono text-xs text-zinc-400">Pixel = 0</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-[#272e39]" />
                <div>
                  <p className="text-xs font-bold text-white">Value 1 — Good Die (Pass)</p>
                  <p className="text-[10px] text-zinc-500">Functional integrated circuit die</p>
                </div>
              </div>
              <span className="font-mono text-xs text-zinc-400">Pixel = 127</span>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-[rgba(118,185,0,0.3)] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-[#76B900] shadow-[0_0_8px_#76B900]" />
                <div>
                  <p className="text-xs font-bold text-[#76B900]">Value 2 — Defective Die (Fail)</p>
                  <p className="text-[10px] text-zinc-400">Electrical test failure die</p>
                </div>
              </div>
              <span className="font-mono text-xs text-[#76B900]">Pixel = 255</span>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Root Causes & Corrective Actions Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Defect Archetypes & Fab Root-Cause Library</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defectArchetypes.map((defect, idx) => (
            <div key={idx} className="glass-card p-4 space-y-2.5">
              <span className="font-mono text-xs font-bold text-[#76B900] bg-[rgba(118,185,0,0.1)] px-2 py-0.5 rounded border border-[rgba(118,185,0,0.2)]">
                {defect.name}
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Root Cause</span>
                <p className="text-xs text-zinc-300 leading-snug">{defect.rootCause}</p>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <span className="text-[10px] font-mono uppercase text-[#00E5FF] block">Fab Remedy</span>
                <p className="text-[11px] text-zinc-400 leading-snug">{defect.remedy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
