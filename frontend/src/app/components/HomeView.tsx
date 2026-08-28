"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  CheckCircle2,
  Terminal,
  BarChart3,
  Boxes,
} from "lucide-react";
import { TabName } from "../page";

interface HomeViewProps {
  onNavigate?: (tab: TabName) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const telemetryStats = [
    {
      label: "Macro ROC-AUC",
      value: "98.70%",
      sub: "Across all 8 defect archetypes",
      trend: "+4.2% vs Baseline",
    },
    {
      label: "Inference Latency",
      value: "4.2 ms",
      sub: "Optimized on Tensor Core GPU",
      trend: "Real-time edge ready",
    },
    {
      label: "Defect Classes",
      value: "8 Classes",
      sub: "Center, Donut, Scratch, Edge...",
      trend: "WM-811K benchmark",
    },
    {
      label: "Geometry Fidelity",
      value: "100%",
      sub: "Nearest-neighbor discrete map preservation",
      trend: "No interpolation blur",
    },
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Wafer Map Ingestion",
      desc: "Ingest discrete die test bins (0=background, 1=pass, 2=fail) via REST API, `.npy` binary arrays, or automated optical inspection imagery.",
      icon: Layers,
    },
    {
      step: "02",
      title: "Nearest-Neighbor Mapping",
      desc: "Preserve crisp categorical die boundaries without artifact blending before tensor normalization (224×224 resolution).",
      icon: Boxes,
    },
    {
      step: "03",
      title: "Neural Defect Classification",
      desc: "EfficientNet-B2 backbone combined with WeightedFocalLoss classifies spatial failure signatures even under 90:1 class imbalance.",
      icon: Cpu,
    },
    {
      step: "04",
      title: "Fab Alert & Yield Dispatch",
      desc: "Instantly stream top-3 classification confidence scores, root-cause tags, and automated equipment maintenance notifications.",
      icon: Zap,
    },
  ];

  const featuredModels = [
    {
      name: "SilicoVision-EfficientNet-B2",
      tag: "Production Standard",
      f1: "84.4% F1",
      auc: "98.7% AUC",
      params: "7.7M Params",
      latency: "4.2ms",
      desc: "Ideal balance of high macro-recall on rare defects (Donut, Scratch, Near-full) and production throughput.",
    },
    {
      name: "SilicoVision-ResNet18-Edge",
      tag: "Ultra-Low Latency",
      f1: "82.5% F1",
      auc: "97.8% AUC",
      params: "11.2M Params",
      latency: "1.9ms",
      desc: "Engineered for in-line fab scanner integration requiring sub-2 millisecond classification per wafer.",
    },
  ];

  return (
    <div className="space-y-12 animate-page-fade">
      {/* 1. Hero Section (3D Circuit Banner Artwork) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-black p-8 sm:p-12 shadow-[0_0_60px_rgba(0,0,0,0.9)] group">
        {/* Background 3D Ribbon Artwork */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/silicovision_hero.jpg"
          alt="Semiconductor AI Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-1000 pointer-events-none"
        />

        {/* Multi-gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#76B900]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-black/80 backdrop-blur-md border border-[rgba(118,185,0,0.4)] text-[#76B900] shadow-[0_0_15px_rgba(118,185,0,0.25)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ADVANCED DEEP LEARNING ARCHITECTURE FOR SEMICONDUCTOR FABRICATIONS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Deploy Enterprise-Grade{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#BFF230] via-white to-[#7CD7FE]">
              Wafer Defect AI
            </span>{" "}
            at Silicon Scale.
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-normal">
            SilicoVision delivers deep learning vision microservices for automated wafer map defect classification on the{" "}
            <span className="text-white font-semibold">WM-811K benchmark</span>. Accelerate root-cause isolation and optimize fab yield in real-time.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate?.("Playground")}
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#76B900] text-black hover:bg-[#86d400] transition-all shadow-[0_0_30px_rgba(118,185,0,0.5)] hover:shadow-[0_0_40px_rgba(118,185,0,0.7)] cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch Interactive Playground</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate?.("Models")}
              className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-black/70 backdrop-blur-md border border-white/20 text-white hover:border-[rgba(118,185,0,0.6)] hover:bg-zinc-900/90 transition-all cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-[#76B900]" />
              <span>Browse AI Models</span>
            </button>

            <button
              onClick={() => onNavigate?.("ApiDocs")}
              className="inline-flex items-center space-x-2 px-4 py-3.5 rounded-xl font-semibold text-sm text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>API Reference</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryStats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="glass-card p-5 space-y-2 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
              <span>{stat.label}</span>
              <span className="font-mono text-[10px] text-[#76B900] bg-[rgba(118,185,0,0.1)] px-1.5 py-0.5 rounded border border-[rgba(118,185,0,0.2)]">
                {stat.trend}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-white tracking-tight group-hover:text-[#76B900] transition-colors">
              {stat.value}
            </p>
            <p className="text-xs text-zinc-500 leading-snug">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* 3. Featured AI Model Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-[#76B900]" />
              <span>Featured Vision Microservices</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Pre-trained, quantized, and ready for fab production dispatch</p>
          </div>
          <button
            onClick={() => onNavigate?.("Models")}
            className="text-xs font-semibold text-[#76B900] hover:text-[#86d400] flex items-center space-x-1"
          >
            <span>View All Models</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredModels.map((model, idx) => (
            <div key={idx} className="glass-card glow-card p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider font-semibold text-[#76B900] bg-[rgba(118,185,0,0.1)] px-2 py-0.5 rounded border border-[rgba(118,185,0,0.25)]">
                    {model.tag}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{model.params}</span>
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">{model.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{model.desc}</p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs font-mono text-zinc-300">
                  <span className="text-[#00E5FF] font-semibold">{model.f1}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-white font-semibold">{model.auc}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-[#76B900] font-semibold">{model.latency}</span>
                </div>
                <button
                  onClick={() => onNavigate?.("Playground")}
                  className="text-xs font-semibold text-white hover:text-[#76B900] flex items-center space-x-1 group cursor-pointer"
                >
                  <span>Test in Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Fab Workflow Blueprint Section */}
      <div className="glass-card p-8 space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-[#00E5FF]">
            <Activity className="w-3.5 h-3.5" />
            <span>Manufacturing Execution Pipeline</span>
          </div>
          <h2 className="text-2xl font-bold text-white">How SilicoVision Powers Fab Yield</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative p-5 rounded-xl bg-black/40 border border-zinc-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(118,185,0,0.1)] border border-[rgba(118,185,0,0.25)] flex items-center justify-center text-[#76B900]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs text-zinc-600 font-bold">{step.step}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
