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

    // Mouse tracking with smooth spring/lerp easing
    const mouse = {
      x: width * 0.5,
      y: height * 0.35,
      targetX: width * 0.5,
      targetY: height * 0.35,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    let time = 0;

    // High-tech semiconductor wafer die / circuit particles
    interface ChipParticle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
      isCross: boolean;
    }

    const particles: ChipParticle[] = [];
    const particleCount = 65;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color:
          Math.random() > 0.45
            ? "rgba(118, 185, 0, " // NVIDIA Green
            : Math.random() > 0.5
            ? "rgba(0, 229, 255, " // Electric Teal
            : "rgba(160, 220, 255, ", // Silicon White
        isCross: Math.random() > 0.7,
      });
    }

    let animationId: number;

    function render() {
      if (!ctx || !canvas) return;
      time += 0.012;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Obsidian Base
      ctx.fillStyle = "#030406";
      ctx.fillRect(0, 0, width, height);

      // 2. NVIDIA Multi-Point Organic Breathing Nebulae
      // Nebula A: Top-Left NVIDIA Emerald Green
      const nebA_X = width * 0.22 + Math.sin(time * 0.7) * 80;
      const nebA_Y = height * 0.25 + Math.cos(time * 0.5) * 60;
      const gradA = ctx.createRadialGradient(nebA_X, nebA_Y, 0, nebA_X, nebA_Y, width * 0.45);
      gradA.addColorStop(0, "rgba(118, 185, 0, 0.12)");
      gradA.addColorStop(0.45, "rgba(118, 185, 0, 0.035)");
      gradA.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradA;
      ctx.fillRect(0, 0, width, height);

      // Nebula B: Center-Right Electric Cyan / Sapphire
      const nebB_X = width * 0.78 + Math.cos(time * 0.6) * 90;
      const nebB_Y = height * 0.45 + Math.sin(time * 0.8) * 70;
      const gradB = ctx.createRadialGradient(nebB_X, nebB_Y, 0, nebB_X, nebB_Y, width * 0.5);
      gradB.addColorStop(0, "rgba(0, 229, 255, 0.08)");
      gradB.addColorStop(0.5, "rgba(20, 60, 120, 0.04)");
      gradB.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradB;
      ctx.fillRect(0, 0, width, height);

      // Nebula C: Interactive Mouse Follow Spotlight
      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
      mouseGrad.addColorStop(0, "rgba(118, 185, 0, 0.11)");
      mouseGrad.addColorStop(0.3, "rgba(0, 229, 255, 0.04)");
      mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. High-Tech Semiconductor Matrix Crosshair Grid
      const gridSize = 44;
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          const mouseGlow = Math.max(0, 1 - distToMouse / 280);

          // Subtle background grid lines
          const baseAlpha = 0.02 + mouseGlow * 0.06;
          ctx.strokeStyle = `rgba(118, 185, 0, ${baseAlpha})`;

          // Draw micro crosshairs (+) at grid intersections
          const crossLen = 3.5;
          const crossAlpha = 0.04 + mouseGlow * 0.22;
          ctx.strokeStyle = `rgba(118, 185, 0, ${crossAlpha})`;

          ctx.beginPath();
          ctx.moveTo(x - crossLen, y);
          ctx.lineTo(x + crossLen, y);
          ctx.moveTo(x, y - crossLen);
          ctx.lineTo(x, y + crossLen);
          ctx.stroke();
        }
      }

      // 4. Subtle Ambient Semiconductor Waveform Shimmer
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.025)";
      ctx.beginPath();
      for (let x = 0; x < width; x += 6) {
        const y =
          height * 0.68 +
          Math.sin(x * 0.003 + time) * 55 +
          Math.cos(x * 0.0015 + time * 0.5) * 35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 5. Floating Iridescent Microchip Particles & Nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulse = Math.sin(time * 3 + i) * 0.2 + 0.8;
        const currentAlpha = p.alpha * pulse;

        // Draw particle
        ctx.fillStyle = p.color + currentAlpha + ")";
        if (p.isCross) {
          const s = p.size * 1.6;
          ctx.fillRect(p.x - s / 2, p.y - 0.5, s, 1);
          ctx.fillRect(p.x - 0.5, p.y - s / 2, 1, s);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw dynamic laser connections between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.06 * pulse;
            ctx.strokeStyle = `rgba(118, 185, 0, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none transition-opacity duration-700"
    />
  );
}
