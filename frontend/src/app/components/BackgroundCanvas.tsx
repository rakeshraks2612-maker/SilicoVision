"use client";

import React, { useEffect, useRef } from "react";

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with fluid spring interpolation
    const mouse = {
      x: width * 0.5,
      y: height * 0.35,
      targetX: width * 0.5,
      targetY: height * 0.35,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let time = 0;

    // 1. Interactive Silicon Probe Nodes (Neural Lattice)
    interface Node {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      r: number;
      pulse: number;
      pulseSpeed: number;
      color: string;
    }

    const nodes: Node[] = [];
    const nodeCount = Math.min(80, Math.floor((width * height) / 18000));

    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        color:
          Math.random() > 0.4
            ? "rgba(118, 185, 0, " // NVIDIA Green
            : Math.random() > 0.5
            ? "rgba(0, 229, 255, " // Cyan
            : "rgba(191, 242, 48, ", // Lime
      });
    }

    // 2. Photonic Grid Traveling Laser Beams (NVLink Interconnects)
    interface LaserBeam {
      x: number;
      y: number;
      length: number;
      speed: number;
      dir: "horizontal" | "vertical";
      color: string;
      alpha: number;
    }

    const gridSize = 40;
    const beams: LaserBeam[] = [];
    const maxBeams = 7;

    function spawnBeam(): LaserBeam {
      const isH = Math.random() > 0.5;
      const snapX = Math.floor(Math.random() * (width / gridSize)) * gridSize;
      const snapY = Math.floor(Math.random() * (height / gridSize)) * gridSize;
      return {
        x: isH ? -100 : snapX,
        y: isH ? snapY : -100,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 4 + 3,
        dir: isH ? "horizontal" : "vertical",
        color: Math.random() > 0.5 ? "rgba(118, 185, 0," : "rgba(0, 229, 255,",
        alpha: Math.random() * 0.5 + 0.35,
      };
    }

    for (let i = 0; i < maxBeams; i++) {
      beams.push(spawnBeam());
    }

    let animationId: number;

    function render() {
      if (!ctx || !canvas) return;
      time += 1;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // A. Deep Obsidian Background
      ctx.fillStyle = "#040507";
      ctx.fillRect(0, 0, width, height);

      // B. Ambient Corner Aurora Glows (Clean & Cinematic)
      // Top-Left NVIDIA Emerald Glow
      const glowTL = ctx.createRadialGradient(width * 0.15, height * 0.15, 0, width * 0.15, height * 0.15, width * 0.4);
      glowTL.addColorStop(0, "rgba(118, 185, 0, 0.08)");
      glowTL.addColorStop(0.5, "rgba(118, 185, 0, 0.02)");
      glowTL.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowTL;
      ctx.fillRect(0, 0, width, height);

      // Center-Right Electric Cyan Glow
      const glowBR = ctx.createRadialGradient(width * 0.85, height * 0.5, 0, width * 0.85, height * 0.5, width * 0.45);
      glowBR.addColorStop(0, "rgba(0, 229, 255, 0.06)");
      glowBR.addColorStop(0.6, "rgba(16, 40, 80, 0.02)");
      glowBR.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowBR;
      ctx.fillRect(0, 0, width, height);

      // C. Interactive Mouse Radial Spotlight
      if (mouse.isHovered) {
        const mouseSpot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 380);
        mouseSpot.addColorStop(0, "rgba(118, 185, 0, 0.12)");
        mouseSpot.addColorStop(0.4, "rgba(0, 229, 255, 0.04)");
        mouseSpot.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseSpot;
        ctx.fillRect(0, 0, width, height);
      }

      // D. Clean Semiconductor Wafer Circuit Grid
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += gridSize) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // E. Traveling Photonic Laser Beams along Grid
      for (let i = 0; i < beams.length; i++) {
        const b = beams[i];
        if (b.dir === "horizontal") {
          b.x += b.speed;
          if (b.x > width + b.length) {
            beams[i] = spawnBeam();
            continue;
          }

          const grad = ctx.createLinearGradient(b.x - b.length, b.y, b.x, b.y);
          grad.addColorStop(0, `${b.color} 0)`);
          grad.addColorStop(0.7, `${b.color} ${b.alpha * 0.4})`);
          grad.addColorStop(1, `${b.color} ${b.alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x - b.length, b.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          // Beam head glowing point
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(b.x, b.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          b.y += b.speed;
          if (b.y > height + b.length) {
            beams[i] = spawnBeam();
            continue;
          }

          const grad = ctx.createLinearGradient(b.x, b.y - b.length, b.x, b.y);
          grad.addColorStop(0, `${b.color} 0)`);
          grad.addColorStop(0.7, `${b.color} ${b.alpha * 0.4})`);
          grad.addColorStop(1, `${b.color} ${b.alpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y - b.length);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(b.x, b.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // F. Interactive Silicon Probe Lattice & Synapse Connections
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        n.pulse += n.pulseSpeed;
        const currentPulse = Math.sin(n.pulse) * 0.3 + 0.7;

        // Mouse attraction / illumination
        const distToMouse = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const mouseNear = Math.max(0, 1 - distToMouse / 220);

        // Draw node dot
        const nodeAlpha = (0.25 + mouseNear * 0.65) * currentPulse;
        ctx.fillStyle = `${n.color}${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * (1 + mouseNear * 0.6), 0, Math.PI * 2);
        ctx.fill();

        // Connect to mouse if near
        if (mouseNear > 0.1 && mouse.isHovered) {
          ctx.strokeStyle = `rgba(118, 185, 0, ${mouseNear * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Connect to neighboring nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          const maxDist = 115;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.12 * currentPulse;
            ctx.strokeStyle = `rgba(118, 185, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none transition-opacity duration-700"
    />
  );
}
