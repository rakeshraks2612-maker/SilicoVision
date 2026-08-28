"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Boxes,
  Database,
  Layers,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  ArrowRight,
  Info,
  Wrench,
  Microscope,
  Flame,
  Cpu,
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
import { TabName } from "../page";

interface DefectDetails {
  name: string;
  count: number;
  pct: string;
  color: string;
  severity: "Catastrophic" | "High Yield Risk" | "Moderate Yield Risk" | "Process Drift";
  equipment: string;
  geometry: string;
  rootCause: string;
  remedy: string;
  physicsDesc: string;
  typicalYieldImpact: string;
}

interface DatasetViewProps {
  onNavigate?: (tab: TabName) => void;
}

export default function DatasetView({ onNavigate }: DatasetViewProps) {
  const [selectedDefect, setSelectedDefect] = useState<DefectDetails | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement>(null);

  const defectList: DefectDetails[] = [
    {
      name: "Edge-Loc",
      count: 2772,
      pct: "35.1%",
      color: "#76B900",
      severity: "High Yield Risk",
      equipment: "Wafer Robot End-Effector & FOUP Cassette Handler",
      geometry: "Dense cluster of failed dies localized along the circular outer bevel perimeter.",
      rootCause: "Mechanical gripper pressure, robotic arm blade misalignment, or bevel edge cassette rubbing.",
      remedy: "Re-zero robotic end-effector coordinates, calibrate vacuum chuck clamping pressure, and replace warped FOUP carriers.",
      physicsDesc: "Excess mechanical stress along the wafer perimeter creates micro-cracks and shear dislocations that degrade gate oxide integrity on peripheral ICs.",
      typicalYieldImpact: "15% – 35% localized die loss",
    },
    {
      name: "Loc",
      count: 1973,
      pct: "25.0%",
      color: "#00E5FF",
      severity: "Moderate Yield Risk",
      equipment: "Plasma Etcher / PECVD Deposition Chamber",
      geometry: "Isolated concentrated spatial cluster of defective dies located in an internal wafer region.",
      rootCause: "Particulate flaking from chamber sidewalls or gas showerhead nozzle blockage.",
      remedy: "Execute in-situ plasma chamber clean (NF3/SF6), replace particle exhaust traps, and inspect showerhead injector orifices.",
      physicsDesc: "Sub-micron polymer flaking deposited during etching creates shadow-masking, preventing complete trench formation or causing electrical interconnect bridging.",
      typicalYieldImpact: "10% – 25% clustered die loss",
    },
    {
      name: "Edge-Ring",
      count: 1126,
      pct: "14.3%",
      color: "#a855f7",
      severity: "Process Drift",
      equipment: "Spin Coater Track & Chemical Mechanical Polishing (CMP)",
      geometry: "Continuous or semi-continuous concentric ring of failed dies running along the wafer periphery.",
      rootCause: "Edge Bead Removal (EBR) solvent overshoot, photoresist boundary thinning, or CMP edge roll-off.",
      remedy: "Calibrate EBR dispense nozzle distance, adjust edge-ring thermal jacket, and tune CMP retaining ring pressure profile.",
      physicsDesc: "Radially non-uniform fluid dynamic shear forces cause critical dimension (CD) variations and severe dielectric layer thickness gradient at the wafer edge.",
      typicalYieldImpact: "20% – 40% peripheral die loss",
    },
    {
      name: "Center",
      count: 832,
      pct: "10.5%",
      color: "#3b82f6",
      severity: "Process Drift",
      equipment: "Inductively Coupled Plasma (ICP) Etcher / CVD Reactor",
      geometry: "Centrally concentrated circular disk or solid cluster of defective dies surrounding the wafer center.",
      rootCause: "Plasma density stagnation at center or center-to-edge wafer heating chuck temperature gradient.",
      remedy: "Re-balance dual-zone gas distribution injector, tune multi-zone electrostatic chuck (ESC) helium backside cooling, and verify RF bias coil tuning.",
      physicsDesc: "Radially non-uniform RF coupling leads to higher ion flux at the wafer center, causing over-etching, gate oxide punch-through, or metal trench over-milling.",
      typicalYieldImpact: "15% – 30% core die loss",
    },
    {
      name: "Scratch",
      count: 693,
      pct: "8.8%",
      color: "#eab308",
      severity: "High Yield Risk",
      equipment: "Automated Material Handling System (AMHS) & FOUP Transport",
      geometry: "Continuous or broken linear/curvilinear streak cutting across multiple die columns or rows.",
      rootCause: "Abrasive mechanical contact, hard particle dragging, or metallic tweezers scraping during manual wafer handling.",
      remedy: "Inspect wafer transfer track belts, replace contaminated vacuum pick-up wands, and audit cleanroom glove/tool protocol.",
      physicsDesc: "Physical abrasion severs multi-level copper interconnects, fractures inter-layer dielectric (ILD), and introduces deep crystalline dislocations.",
      typicalYieldImpact: "5% – 20% linear track die failure",
    },
    {
      name: "Random",
      count: 257,
      pct: "3.3%",
      color: "#f97316",
      severity: "Moderate Yield Risk",
      equipment: "Cleanroom Air Handling & Raw Silicon Substrate Ingot",
      geometry: "Uniformly distributed, uncorrelated point defect dies scattered randomly across the entire wafer disc.",
      rootCause: "Airborne sub-micron aerosol particles (ISO Class 1 violation) or raw silicon crystal lattice point anomalies.",
      remedy: "Verify HEPA/ULPA laminar flow filtration velocity, inspect air shower interlocks, and audit incoming bare silicon boule vendor quality.",
      physicsDesc: "Stochastic particle deposition during lithography exposure masks critical gate features, causing isolated pinhole shorts or open circuits.",
      typicalYieldImpact: "3% – 12% baseline yield degradation",
    },
    {
      name: "Donut",
      count: 146,
      pct: "1.9%",
      color: "#ec4899",
      severity: "Process Drift",
      equipment: "Rapid Thermal Annealing (RTA) Chamber & Spin-Coating Track",
      geometry: "Distinct annular toroidal ring of failed dies surrounding a healthy center with healthy perimeter.",
      rootCause: "Thermal standing wave gradient across concentric heating lamp zones or drying wave vortex in photoresist spin-coating.",
      remedy: "Profile RTA pyrometer sensor calibration, calibrate multi-zone heating lamp bank power ratios, and adjust solvent vapor drying exhaust.",
      physicsDesc: "Toroidal temperature non-uniformity during dopant activation causes localized incomplete lattice recrystallization and threshold voltage (Vth) mismatch across concentric die rings.",
      typicalYieldImpact: "10% – 25% annular die loss",
    },
    {
      name: "Near-full",
      count: 95,
      pct: "1.2%",
      color: "#ef4444",
      severity: "Catastrophic",
      equipment: "CMP Polishing Tool / Main Cleanroom Power Grid & Gas Abatement",
      geometry: "Massive failure covering >80% of all dies on the wafer surface with almost zero functional yield.",
      rootCause: "Catastrophic CMP pad delamination, runaway etch plasma arc, chemical dispense failure, or chamber vacuum leak.",
      remedy: "Execute immediate emergency tool shutdown, replace CMP polishing heads, purge toxic gas supply lines, and overhaul chamber seals.",
      physicsDesc: "Total layer breakdown, complete wafer delamination, or severe substrate warping rendering every integrated circuit completely inoperable.",
      typicalYieldImpact: "85% – 100% total wafer scrap",
    },
  ];

  const datasetStats = [
    { label: "Total Wafers in WM-811K", value: "811,457", sub: "Collected from 46,393 lots" },
    { label: "Labeled Defect Wafers", value: "172,950", sub: "Domain-annotated failure maps" },
    { label: "Evaluation Test Split", value: "7,894", sub: "Strict held-out validation set" },
    { label: "Class Imbalance Ratio", value: "29.2 : 1", sub: "Edge-Loc vs Near-full" },
  ];

  // Draw simulated wafer map inside the modal popup with crisp high-DPI scaling
  useEffect(() => {
    if (!selectedDefect || !modalCanvasRef.current) return;
    const canvas = modalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displaySize = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;
    ctx.scale(dpr, dpr);

    const size = displaySize;
    const center = size / 2;
    const radius = size * 0.44;

    ctx.clearRect(0, 0, size, size);

    // 1. Draw outer void background
    ctx.fillStyle = "#0a0c10";
    ctx.fillRect(0, 0, size, size);

    // 2. Draw solid silicon substrate
    ctx.fillStyle = "#1e2638";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(118, 185, 0, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3. Draw notch
    ctx.fillStyle = "#0a0c10";
    ctx.beginPath();
    ctx.arc(center, center + radius, 6, 0, Math.PI * 2);
    ctx.fill();

    // 4. Draw die grid & defect pattern
    const gridSize = 32;
    const dieStep = (radius * 2) / gridSize;
    const startX = center - radius;
    const startY = center - radius;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const dx = startX + c * dieStep + dieStep / 2 - center;
        const dy = startY + r * dieStep + dieStep / 2 - center;
        const dist = Math.hypot(dx, dy);

        if (dist > radius - 2) continue; // Outside wafer boundary

        const normDist = dist / radius;
        let isDefect = false;

        switch (selectedDefect.name) {
          case "Center":
            isDefect = normDist < 0.38 && Math.random() < 0.82;
            break;
          case "Donut":
            isDefect = normDist > 0.35 && normDist < 0.72 && Math.random() < 0.78;
            break;
          case "Edge-Loc":
            isDefect = normDist > 0.65 && dx > 0 && dy < 0 && Math.random() < 0.85;
            break;
          case "Edge-Ring":
            isDefect = normDist > 0.78 && Math.random() < 0.85;
            break;
          case "Loc":
            isDefect = Math.hypot(dx - radius * 0.3, dy - radius * 0.25) < radius * 0.28 && Math.random() < 0.82;
            break;
          case "Random":
            isDefect = Math.random() < 0.16;
            break;
          case "Scratch":
            const lineDist = Math.abs(dx * 0.7 - dy * 0.7);
            isDefect = lineDist < dieStep * 1.8 && normDist < 0.88 && Math.random() < 0.88;
            break;
          case "Near-full":
            isDefect = Math.random() < 0.88;
            break;
        }

        const dieX = startX + c * dieStep + 0.5;
        const dieY = startY + r * dieStep + 0.5;
        const dieW = dieStep - 1;

        if (isDefect) {
          ctx.fillStyle = selectedDefect.color;
          ctx.fillRect(dieX, dieY, dieW, dieW);
        } else {
          ctx.fillStyle = "#2b3547";
          ctx.fillRect(dieX, dieY, dieW, dieW);
        }
      }
    }
  }, [selectedDefect]);

  return (
    <div className="space-y-10 animate-page-fade relative">
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
          The worldwide standard benchmark dataset for silicon wafer defect pattern recognition in semiconductor manufacturing. Click any defect archetype below to inspect its fab root-cause and physical failure mechanism.
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

      {/* Interactive Defect Quick-Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-[#76B900]" />
            <span>Interactive Defect Archetype Explorer (Click to Inspect)</span>
          </span>
          <span className="text-[11px] font-mono text-zinc-500">8 Benchmark Archetypes</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {defectList.map((d) => (
            <button
              key={d.name}
              onClick={() => setSelectedDefect(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center space-x-2 border transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: `${d.color}15`,
                borderColor: `${d.color}40`,
                color: d.color,
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span>{d.name}</span>
              <span className="text-[10px] opacity-75 font-normal">({d.pct})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Class Distribution Chart & Encoding Standard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Class Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Test Split Class Distribution</h3>
              <p className="text-xs text-zinc-400">Click any bar to inspect root-cause and fab remedies</p>
            </div>
            <span className="text-xs font-mono text-[#00E5FF]">7,894 Wafers</span>
          </div>

          <div className="h-64 w-full pt-2 cursor-pointer">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={defectList}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={(data: any) => {
                  if (data?.activePayload?.[0]?.payload) {
                    setSelectedDefect(data.activePayload[0].payload as DefectDetails);
                  }
                }}
              >
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
                  {defectList.map((entry, index) => (
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
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Defect Archetypes & Fab Root-Cause Library</h3>
          <span className="text-xs font-mono text-zinc-400">Click any card for full modal report</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {defectList.map((defect, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedDefect(defect)}
              className="glass-card glow-card p-5 space-y-3 cursor-pointer hover:border-[#76B900]/60 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${defect.color}18`,
                    borderColor: `${defect.color}40`,
                    color: defect.color,
                  }}
                >
                  {defect.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{defect.pct}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">Root Cause</span>
                <p className="text-xs text-zinc-300 leading-snug line-clamp-2">{defect.rootCause}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-[#00E5FF] group-hover:text-[#76B900] transition-colors font-semibold">
                <span>View Full Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE DEFECT INTELLIGENCE MODAL POPUP */}
      {/* ========================================================================= */}
      {selectedDefect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-page-fade overflow-y-auto"
          onClick={() => setSelectedDefect(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-[#0b0e14] border border-white/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span
                    className="px-3 py-1 rounded-md text-sm font-mono font-bold border"
                    style={{
                      backgroundColor: `${selectedDefect.color}20`,
                      borderColor: `${selectedDefect.color}60`,
                      color: selectedDefect.color,
                    }}
                  >
                    {selectedDefect.name} Defect Pattern
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                      selectedDefect.severity === "Catastrophic"
                        ? "bg-red-950/60 border-red-800/60 text-red-400"
                        : selectedDefect.severity === "High Yield Risk"
                        ? "bg-orange-950/60 border-orange-800/60 text-orange-400"
                        : "bg-blue-950/60 border-blue-800/60 text-blue-400"
                    }`}
                  >
                    {selectedDefect.severity}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  WM-811K Benchmark Prevalence: {selectedDefect.count} Wafers ({selectedDefect.pct} of test split)
                </p>
              </div>

              <button
                onClick={() => setSelectedDefect(null)}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual & Core Stats Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Wafer Map Visual Canvas */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                <canvas
                  ref={modalCanvasRef}
                  width={220}
                  height={220}
                  className="rounded-lg shadow-lg border border-zinc-800/80"
                />
                <span className="text-[10px] font-mono text-zinc-400 text-center">
                  Synthesized 200mm/300mm Die Layout
                </span>
              </div>

              {/* Quick Specs */}
              <div className="md:col-span-7 space-y-3">
                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#76B900] font-bold flex items-center space-x-1">
                    <Microscope className="w-3.5 h-3.5" />
                    <span>Spatial Geometry Signature</span>
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed">{selectedDefect.geometry}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#00E5FF] font-bold flex items-center space-x-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Affected Fab Tooling</span>
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-mono">{selectedDefect.equipment}</p>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-orange-400 font-bold flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Typical Yield Impact</span>
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed font-mono font-semibold">
                    {selectedDefect.typicalYieldImpact}
                  </p>
                </div>
              </div>
            </div>

            {/* Deep Physics & Root Cause Analysis */}
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-black/40 border border-zinc-800 space-y-2">
                <h4 className="text-xs font-bold font-mono text-white flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <span>Physical Root-Cause & Mechanism</span>
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">{selectedDefect.physicsDesc}</p>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(118,185,0,0.06)] border border-[rgba(118,185,0,0.3)] space-y-2">
                <h4 className="text-xs font-bold font-mono text-[#76B900] flex items-center space-x-2">
                  <Wrench className="w-4 h-4" />
                  <span>Equipment Maintenance SOP & Yield Recovery</span>
                </h4>
                <p className="text-xs text-zinc-200 leading-relaxed">{selectedDefect.remedy}</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-zinc-500">
                Model Classifier: SilicoVision EfficientNet-B2 (Vision Microservice)
              </span>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedDefect(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedDefect(null);
                    onNavigate?.("Playground");
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#76B900] text-black hover:bg-[#86d400] transition-all shadow-[0_0_20px_rgba(118,185,0,0.4)] cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Test in Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
