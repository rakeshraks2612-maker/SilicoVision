"use client";

import React, { useState } from "react";
import BackgroundCanvas from "./components/BackgroundCanvas";
import HomeView from "./components/HomeView";
import PredictView from "./components/PredictView";
import PerformanceView from "./components/PerformanceView";
import DatasetView from "./components/DatasetView";
import AboutView from "./components/AboutView";

type TabName = "Home" | "Predict" | "Performance" | "Dataset" | "About";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>("Home");
  const [disableAnim, setDisableAnim] = useState(false);

  const tabs: { name: TabName; label: string; icon: string }[] = [
    { name: "Home", label: "Home", icon: "🏠" },
    { name: "Predict", label: "Predict", icon: "🔍" },
    { name: "Performance", label: "Performance", icon: "📊" },
    { name: "Dataset", label: "Dataset", icon: "📦" },
    { name: "About", label: "About", icon: "ℹ️" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-x-hidden font-sans">
      {/* 1. Dynamic Interactive Particle Background Canvas */}
      {!disableAnim && <BackgroundCanvas />}

      {/* 2. Glassmorphic Sidebar Navigation (Taskbar) */}
      <aside className="w-full md:w-64 bg-black/55 md:min-h-screen border-b md:border-b-0 md:border-r border-[rgba(118,185,0,0.15)] backdrop-blur-xl -webkit-backdrop-blur-xl flex flex-col justify-between shrink-0 z-10">
        <div className="p-6 space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔬</span>
            <h2 className="text-lg font-extrabold tracking-tight text-white">
              Wafer AI Dashboard
            </h2>
          </div>
          
          <hr className="border-[rgba(118,185,0,0.15)]" />

          {/* Navigation Radio Items */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-3 transition-all ${
                    isActive
                      ? "bg-[rgba(118,185,0,0.12)] text-[#76B900] border border-[rgba(118,185,0,0.25)] shadow-sm"
                      : "text-zinc-300 hover:bg-[rgba(118,185,0,0.06)] hover:text-[#76B900]/90"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Controls and footer */}
        <div className="p-6 space-y-4">
          <hr className="border-[rgba(118,185,0,0.15)]" />
          
          {/* Customization Options */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              🎨 Customization
            </p>
            <label className="flex items-center space-x-3 cursor-pointer select-none text-xs text-zinc-400 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={disableAnim}
                onChange={(e) => setDisableAnim(e.target.checked)}
                className="w-4 h-4 rounded accent-primary border-zinc-700 bg-black/40 cursor-pointer"
              />
              <span>Disable BG Animation</span>
            </label>
            <p className="text-[10px] text-zinc-600 leading-normal">
              Disable particles, grids, and waveforms to save CPU/GPU cycles.
            </p>
          </div>

          <hr className="border-[rgba(118,185,0,0.15)]" />
          
          <div className="text-[10px] text-zinc-600">
            <p className="font-medium text-zinc-500">v1.0.0 | Silicon Wafer Defect</p>
            <p className="mt-0.5">Full-Stack Next.js + FastAPI System</p>
          </div>
        </div>
      </aside>

      {/* 3. Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 z-0">
        <div className="max-w-6xl mx-auto">
          {activeTab === "Home" && <HomeView />}
          {activeTab === "Predict" && <PredictView />}
          {activeTab === "Performance" && <PerformanceView />}
          {activeTab === "Dataset" && <DatasetView />}
          {activeTab === "About" && <AboutView />}
          
          {/* Footer Notice */}
          <footer className="mt-12 pt-6 border-t border-zinc-800 text-center text-xs text-zinc-600">
            Developed by Wafer AI Team. Powered by PyTorch & Next.js.
          </footer>
        </div>
      </main>
    </div>
  );
}
