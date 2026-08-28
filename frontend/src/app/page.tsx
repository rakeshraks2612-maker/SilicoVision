"use client";

import React, { useState, useEffect } from "react";
import BackgroundCanvas from "./components/BackgroundCanvas";
import HomeView from "./components/HomeView";
import ModelsView from "./components/ModelsView";
import PredictView from "./components/PredictView";
import PerformanceView from "./components/PerformanceView";
import DatasetView from "./components/DatasetView";
import ApiDocsView from "./components/ApiDocsView";
import {
  Search,
  Zap,
  Activity,
  Cpu,
  Boxes,
  BarChart3,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";

export type TabName =
  | "Explore"
  | "Models"
  | "Playground"
  | "Telemetry"
  | "Dataset"
  | "ApiDocs";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>("Explore");
  const [disableAnim, setDisableAnim] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number>(4.2);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check backend health periodically
  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      try {
        const res = await fetch("http://localhost:8000/health", { cache: "no-store" });
        const endTime = performance.now();
        if (res.ok) {
          setApiOnline(true);
          setLatency(Math.round((endTime - startTime) * 10) / 10);
        } else {
          setApiOnline(false);
        }
      } catch {
        setApiOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const tabs: { name: TabName; label: string; icon: React.ElementType }[] = [
    { name: "Explore", label: "Explore", icon: Zap },
    { name: "Models", label: "Model Catalog", icon: Cpu },
    { name: "Playground", label: "Playground", icon: Layers },
    { name: "Telemetry", label: "Fab Telemetry", icon: BarChart3 },
    { name: "Dataset", label: "Dataset Hub", icon: Boxes },
    { name: "ApiDocs", label: "API & SDK", icon: Terminal },
  ];

  const searchItems = [
    { title: "EfficientNet-B2 Model", tab: "Models" as TabName, desc: "Production 7.7M param classifier" },
    { title: "ResNet-18 Light Model", tab: "Models" as TabName, desc: "Ultra-low latency edge classifier" },
    { title: "Interactive Wafer Inspection", tab: "Playground" as TabName, desc: "Test real wafer defect archetypes" },
    { title: "Defect Classes (8 Archetypes)", tab: "Dataset" as TabName, desc: "Center, Donut, Edge-Loc, Scratch, etc." },
    { title: "ROC-AUC & Confusion Matrix", tab: "Telemetry" as TabName, desc: "0.984 Macro ROC-AUC metrics" },
    { title: "REST API Endpoint POST /predict", tab: "ApiDocs" as TabName, desc: "Upload and classify wafer maps" },
    { title: "Docker Deployment Command", tab: "ApiDocs" as TabName, desc: "Deploy via NVIDIA NIM container" },
  ];

  const filteredSearch = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans text-[#ececec] bg-[#030406]">
      {/* 1. Dynamic Interactive Particle & Semiconductor Matrix Canvas */}
      {!disableAnim && <BackgroundCanvas />}

      {/* 2. Exact 1:1 build.nvidia.com Top Aurora Mask Layer */}
      <div
        className="fixed inset-x-0 -z-1 opacity-18 bg-[linear-gradient(80.22deg,#BFF230_1.49%,#7CD7FE_99.95%)] top-0 h-[520px] pointer-events-none [-webkit-mask:radial-gradient(ellipse_150%_120%_at_top,black_0%,black_30%,transparent_70%)] [mask:radial-gradient(ellipse_150%_120%_at_top,black_0%,black_30%,transparent_70%)]"
        aria-hidden="true"
      />

      {/* 3. Exact 1:1 build.nvidia.com Bottom Ambient Glow Layer */}
      <div
        className="fixed inset-x-0 -z-1 opacity-14 bg-[linear-gradient(80.22deg,#BFF230_1.49%,#7CD7FE_99.95%)] bottom-0 h-[340px] pointer-events-none [-webkit-mask:radial-gradient(ellipse_120%_130%_at_bottom,black_0%,black_25%,transparent_60%)] [mask:radial-gradient(ellipse_120%_130%_at_bottom,black_0%,black_25%,transparent_60%)]"
        aria-hidden="true"
      />

      {/* 4. NVIDIA Build-Inspired Sticky App-Bar Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/70 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-black/60 border border-[rgba(118,185,0,0.4)] shadow-[0_0_15px_rgba(118,185,0,0.25)]">
              <span className="text-xl">🔬</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-white text-base">
                  SilicoVision
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[rgba(118,185,0,0.15)] text-[#76B900] border border-[rgba(118,185,0,0.3)]">
                  NIM Microservice
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-tight hidden sm:block">
                Semiconductor Yield Optimization Engine
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.name;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`relative px-3 py-2 text-xs font-semibold rounded-md transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? "text-white font-bold bg-[rgba(118,185,0,0.12)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#76B900]" : "text-zinc-400"}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 inset-x-2 h-0.5 bg-[#76B900] shadow-[0_0_8px_#76B900]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Quick Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:border-[rgba(118,185,0,0.3)] hover:text-zinc-200 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-black/60 rounded border border-zinc-700 text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Health Status Pill */}
            <div
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                apiOnline === true
                  ? "bg-[rgba(118,185,0,0.1)] border-[rgba(118,185,0,0.35)] text-[#76B900]"
                  : apiOnline === false
                  ? "bg-red-950/40 border-red-800/40 text-red-400"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
              title={apiOnline ? `FastAPI connected (port 8000)` : "Backend offline"}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  apiOnline === true
                    ? "bg-[#76B900] pulse-indicator shadow-[0_0_6px_#76B900]"
                    : apiOnline === false
                    ? "bg-red-500"
                    : "bg-zinc-500"
                }`}
              />
              <span className="font-semibold">
                {apiOnline === true ? `Online (${latency}ms)` : apiOnline === false ? "Offline" : "Checking..."}
              </span>
            </div>

            {/* GitHub Repo */}
            <a
              href="https://github.com/rakeshraks2612-maker/SilicoVision"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-[#76B900] hover:border-[rgba(118,185,0,0.4)] transition-colors flex items-center justify-center"
              title="View on GitHub"
            >
              <FaGithub className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto px-4 py-2 border-t border-zinc-800/60 bg-black/90 space-x-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-2.5 py-1.5 rounded text-xs whitespace-nowrap font-medium flex items-center space-x-1 ${
                  isActive
                    ? "bg-[rgba(118,185,0,0.15)] text-[#76B900] border border-[rgba(118,185,0,0.3)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 4. Quick Search Modal (⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md animate-page-fade">
          <div className="w-full max-w-lg bg-[#0c0e12] border border-[rgba(118,185,0,0.3)] rounded-xl shadow-2xl p-4 space-y-4">
            <div className="flex items-center space-x-3 border-b border-zinc-800 pb-3">
              <Search className="w-5 h-5 text-[#76B900]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models, playground, metrics, or docs..."
                className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs font-mono text-zinc-500 hover:text-white"
              >
                ESC
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredSearch.length > 0 ? (
                filteredSearch.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setSearchOpen(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-[rgba(118,185,0,0.1)] text-zinc-300 hover:text-white transition-all flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-zinc-400">{item.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-zinc-800 text-[#76B900]">
                      {item.tab}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-4">No results found for &ldquo;{searchQuery}&rdquo;</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Content Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 z-10">
        {activeTab === "Explore" && <HomeView onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === "Models" && <ModelsView onSelectModel={() => setActiveTab("Playground")} />}
        {activeTab === "Playground" && <PredictView />}
        {activeTab === "Telemetry" && <PerformanceView />}
        {activeTab === "Dataset" && <DatasetView />}
        {activeTab === "ApiDocs" && <ApiDocsView />}
      </main>

      {/* 6. Footer (NVIDIA Build Inspired) */}
      <footer className="border-t border-zinc-900 bg-black/80 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 mt-auto z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔬</span>
            <span className="font-semibold text-zinc-300">SilicoVision Platform</span>
            <span>—</span>
            <span>Accelerating Semiconductor Yield via Vision AI</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer select-none text-[11px] hover:text-zinc-300">
              <input
                type="checkbox"
                checked={disableAnim}
                onChange={(e) => setDisableAnim(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-[#76B900] bg-black/50 border-zinc-700"
              />
              <span>Eco Mode (Disable BG Canvas)</span>
            </label>
            <a
              href="https://github.com/rakeshraks2612-maker/SilicoVision"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#76B900] flex items-center space-x-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
