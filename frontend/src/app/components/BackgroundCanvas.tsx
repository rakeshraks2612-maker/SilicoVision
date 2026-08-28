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
      y: height * 0.3,
      targetX: width * 0.5,
      targetY: height * 0.3,
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

    // Drifting luminous semiconductor sparkles
    interface Sparkle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      phase: number;
      color: string;
    }

    const sparkles: Sparkle[] = [];
    const sparkleCount = 60;

    for (let i = 0; i < sparkleCount; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        phase: Math.random() * Math.PI * 2,
        color:
          Math.random() > 0.5
            ? "rgba(191, 242, 48, " // NVIDIA Lime
            : "rgba(124, 215, 254, ", // Electric Sky
      });
    }

    // Ribbon wave configurations (NVIDIA Keynote / Build signature style)
    const ribbons = [
      { yRatio: 0.22, speed: 0.0012, amp: 85, freq: 0.0016, color1: "rgba(191, 242, 48, 0.45)", color2: "rgba(124, 215, 254, 0.40)", width: 3.5 },
      { yRatio: 0.32, speed: 0.0018, amp: 110, freq: 0.0012, color1: "rgba(118, 185, 0, 0.40)", color2: "rgba(0, 229, 255, 0.35)", width: 3.0 },
      { yRatio: 0.62, speed: 0.0014, amp: 120, freq: 0.0014, color1: "rgba(124, 215, 254, 0.35)", color2: "rgba(191, 242, 48, 0.30)", width: 3.0 },
      { yRatio: 0.75, speed: 0.0020, amp: 95, freq: 0.0018, color1: "rgba(118, 185, 0, 0.30)", color2: "rgba(0, 229, 255, 0.25)", width: 2.5 },
    ];

    let animationId: number;

    function render() {
      if (!ctx || !canvas) return;
      time += 1;

      // Smooth mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw solid dark base
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#040508";
      ctx.fillRect(0, 0, width, height);

      // 2. Switch to Screen Additive blending for vivid neon glow
      ctx.globalCompositeOperation = "screen";

      // 3. Mouse Interactive Radial Spotlight
      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 600);
      mouseGrad.addColorStop(0, "rgba(191, 242, 48, 0.22)");
      mouseGrad.addColorStop(0.35, "rgba(124, 215, 254, 0.12)");
      mouseGrad.addColorStop(0.7, "rgba(20, 60, 140, 0.06)");
      mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = mouseGrad;
      ctx.fillRect(0, 0, width, height);

      // 4. Draw NVIDIA Undulating Volumetric Plasma Ribbons
      for (let rIndex = 0; rIndex < ribbons.length; rIndex++) {
        const r = ribbons[rIndex];
        const baseY = height * r.yRatio;

        const ribbonGrad = ctx.createLinearGradient(0, 0, width, 0);
        ribbonGrad.addColorStop(0, r.color1);
        ribbonGrad.addColorStop(0.5, r.color2);
        ribbonGrad.addColorStop(1, r.color1);

        // A. Draw wide glowing aura
        ctx.lineWidth = r.width * 8;
        ctx.strokeStyle = ribbonGrad;
        ctx.beginPath();

        const step = 8;
        for (let x = 0; x <= width + step; x += step) {
          const wave1 = Math.sin(x * r.freq + time * r.speed * 12) * r.amp;
          const wave2 = Math.cos(x * (r.freq * 0.5) - time * r.speed * 8) * (r.amp * 0.45);

          const distToMouse = Math.hypot(x - mouse.x, baseY - mouse.y);
          const mouseDeflect = Math.exp(-distToMouse / 240) * (mouse.y - baseY) * 0.45;

          const y = baseY + wave1 + wave2 + mouseDeflect;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // B. Draw crisp high-intensity core ribbon
        ctx.lineWidth = r.width;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.stroke();
      }

      // 5. Draw Precision Semiconductor Matrix Grid & Crosshairs
      const gridSize = 48;
      ctx.lineWidth = 0.6;

      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          const mouseProximity = Math.max(0, 1 - distToMouse / 350);

          const crossAlpha = 0.04 + mouseProximity * 0.45;
          ctx.strokeStyle = `rgba(191, 242, 48, ${crossAlpha})`;

          const crossLen = 4;
          ctx.beginPath();
          ctx.moveTo(x - crossLen, y);
          ctx.lineTo(x + crossLen, y);
          ctx.moveTo(x, y - crossLen);
          ctx.lineTo(x, y + crossLen);
          ctx.stroke();
        }
      }

      // 6. Draw Drifting Silicon Dust Sparkles
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        const pulse = Math.sin(time * 0.05 + s.phase) * 0.4 + 0.6;
        ctx.fillStyle = s.color + (0.6 * pulse) + ")";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset composite operation
      ctx.globalCompositeOperation = "source-over";

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
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none transition-opacity duration-700"
    />
  );
}
