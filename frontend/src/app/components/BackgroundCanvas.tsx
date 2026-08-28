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

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let waveOffset = 0;
    let gridOffset = 0;

    interface Particle {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
    }

    interface Geo {
      x: number;
      y: number;
      size: number;
      type: "triangle" | "square";
      vx: number;
      vy: number;
      angle: number;
      vAngle: number;
      color: string;
    }

    const particles: Particle[] = [];
    const particleCount = 75;
    const geos: Geo[] = [];
    const geoCount = 12;

    // Initialize standard floating nodes
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.5 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: Math.random() > 0.4 ? "rgba(118, 185, 0, " : "rgba(0, 229, 255, ",
        alpha: Math.random() * 0.4 + 0.15,
      });
    }

    // Initialize geometric particles
    for (let i = 0; i < geoCount; i++) {
      geos.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 12 + 6,
        type: Math.random() > 0.5 ? "triangle" : "square",
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        angle: Math.random() * Math.PI,
        vAngle: (Math.random() - 0.5) * 0.004,
        color: Math.random() > 0.5 ? "rgba(0, 230, 118, 0.07)" : "rgba(0, 229, 255, 0.07)",
      });
    }

    let animationId: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw deep background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#040405");
      bgGrad.addColorStop(1, "#020202");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw moving digital grid lines
      ctx.strokeStyle = "rgba(118, 185, 0, 0.015)";
      ctx.lineWidth = 0.5;
      gridOffset = (gridOffset + 0.2) % 40;

      for (let y = gridOffset; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 3. Soft glowing ambient nebula at center
      const nebulaGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        100,
        width / 2,
        height / 2,
        Math.min(width, height) * 0.45
      );
      nebulaGrad.addColorStop(0, "rgba(118, 185, 0, 0.06)");
      nebulaGrad.addColorStop(0.5, "rgba(0, 229, 255, 0.02)");
      nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebulaGrad;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw background waveform curves
      waveOffset += 0.003;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.02)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 5) {
        const y =
          height * 0.75 +
          Math.sin(x * 0.003 + waveOffset) * 45 +
          Math.cos(x * 0.0015 + waveOffset * 0.5) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 5. Draw connected floating particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.y * 0.01 + waveOffset) * 0.05;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color + p.alpha + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(118, 185, 0, ${0.05 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 6. Draw rotating geometric particles
      for (let i = 0; i < geos.length; i++) {
        const g = geos[i];
        g.x += g.vx;
        g.y += g.vy;
        g.angle += g.vAngle;

        if (g.x < -g.size) g.x = width + g.size;
        if (g.x > width + g.size) g.x = -g.size;
        if (g.y < -g.size) g.y = height + g.size;
        if (g.y > height + g.size) g.y = -g.size;

        ctx.strokeStyle = g.color;
        ctx.lineWidth = 0.75;
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.angle);

        ctx.beginPath();
        if (g.type === "triangle") {
          ctx.moveTo(0, -g.size / 2);
          ctx.lineTo(g.size / 2, g.size / 2);
          ctx.lineTo(-g.size / 2, g.size / 2);
          ctx.closePath();
        } else {
          ctx.rect(-g.size / 2, -g.size / 2, g.size, g.size);
        }
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-50 pointer-events-none opacity-65"
    />
  );
}
