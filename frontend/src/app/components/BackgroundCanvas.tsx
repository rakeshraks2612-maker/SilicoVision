"use client";

import React, { useEffect, useRef } from "react";

export type BgTheme = "quantum" | "galaxy" | "fluid";

interface BackgroundCanvasProps {
  theme?: BgTheme;
}

export default function BackgroundCanvas({ theme = "quantum" }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      tiltX: 0,
      tiltY: 0,
      radius: 200,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initElements();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    let time = 0;
    let animationId: number;

    // --- 1. QUANTUM 3D SILICON TERRAIN GRID CONFIG ---
    const gridCols = 36;
    const gridRows = 28;

    // --- 2. GALAXY STARS CONFIG ---
    interface Star {
      x: number;
      y: number;
      z: number;
      radius: number;
      speed: number;
      angle: number;
      color: string;
      size: number;
    }
    let stars: Star[] = [];

    // --- 3. FLUID PARTICLES CONFIG ---
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }
    let particles: Particle[] = [];

    const palette = ["#76B900", "#BFF230", "#00E5FF", "#7CD7FE", "#38BDF8"];

    const initElements = () => {
      stars = [];
      for (let i = 0; i < 400; i++) {
        const r = Math.pow(Math.random(), 1.4) * (Math.min(width, height) * 0.7);
        const angle = Math.random() * Math.PI * 2;
        stars.push({
          x: 0,
          y: 0,
          z: Math.random() * 100,
          radius: r,
          angle,
          speed: (0.002 + Math.random() * 0.003),
          color: palette[Math.floor(Math.random() * palette.length)],
          size: Math.random() * 2 + 0.6,
        });
      }

      particles = [];
      for (let i = 0; i < 140; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 1.2 - 0.4,
          life: Math.random() * 120,
          maxLife: Math.random() * 100 + 100,
          color: palette[Math.floor(Math.random() * palette.length)],
          size: Math.random() * 2.5 + 1,
        });
      }
    };

    initElements();

    function render() {
      if (!ctx || !canvas) return;
      time += 1;

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.07;
      mouse.y += (mouse.targetY - mouse.y) * 0.07;

      const targetTiltX = ((mouse.y - height * 0.5) / height) * 0.35;
      const targetTiltY = ((mouse.x - width * 0.5) / width) * 0.35;
      mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
      mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

      // Transparent buffer clearing so background canvas sits cleanly behind cards
      ctx.clearRect(0, 0, width, height);

      // ==========================================================
      // THEME 1: 3D PERSPECTIVE SILICON GRID TERRAIN (QUANTUM)
      // ==========================================================
      if (theme === "quantum") {
        // 1. Ambient Volumetric Glow at Top & Center
        const ambientGlow = ctx.createRadialGradient(
          width * 0.5,
          height * 0.35,
          0,
          width * 0.5,
          height * 0.35,
          width * 0.6
        );
        ambientGlow.addColorStop(0, "rgba(118, 185, 0, 0.12)");
        ambientGlow.addColorStop(0.4, "rgba(0, 229, 255, 0.05)");
        ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, width, height);

        // 2. Interactive Cursor Radial Halo
        const cursorAura = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
        cursorAura.addColorStop(0, "rgba(191, 242, 48, 0.14)");
        cursorAura.addColorStop(0.5, "rgba(0, 229, 255, 0.04)");
        cursorAura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = cursorAura;
        ctx.fillRect(0, 0, width, height);

        // 3. 3D Perspective Silicon Quantum Mesh Calculation
        const fov = 480;
        const planeZStart = 100;
        const planeZEnd = 950;
        const planeWidth = width * 1.7;

        const points: { x: number; y: number; z: number; sx: number; sy: number; alpha: number }[][] = [];

        for (let r = 0; r < gridRows; r++) {
          points[r] = [];
          const normZ = r / (gridRows - 1);
          const z = planeZStart + normZ * (planeZEnd - planeZStart);
          const scale = fov / z;

          for (let c = 0; c < gridCols; c++) {
            const normX = c / (gridCols - 1) - 0.5;
            const wx = normX * planeWidth;

            // Undulating 3D silicon wave ripple equations
            const wave1 = Math.sin(normX * 6 + time * 0.02) * 26;
            const wave2 = Math.cos(normZ * 8 - time * 0.025) * 20;

            // Interactive mouse surface ripple
            const screenApproxX = width * 0.5 + wx * scale;
            const distToMouse = Math.hypot(screenApproxX - mouse.x, height * 0.6 - mouse.y);
            const mouseRipple =
              Math.exp(-distToMouse / 220) * Math.sin(distToMouse * 0.05 - time * 0.08) * 42;

            const wy = height * 0.22 + wave1 + wave2 + mouseRipple;

            const sx = width * 0.5 + wx * scale + mouse.tiltY * (1 - normZ) * 65;
            const sy = height * 0.52 + wy * scale + mouse.tiltX * (1 - normZ) * 45;

            const alpha = Math.max(0, (1 - normZ) * 0.6);
            points[r][c] = { x: wx, y: wy, z, sx, sy, alpha };
          }
        }

        // Draw Horizontal Silicon Grid Lines (Front to Back)
        for (let r = 0; r < gridRows; r++) {
          ctx.beginPath();
          for (let c = 0; c < gridCols; c++) {
            const pt = points[r][c];
            if (c === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          const rowProgress = 1 - r / gridRows;
          ctx.strokeStyle = `rgba(118, 185, 0, ${Math.max(0.08, rowProgress * 0.4)})`;
          ctx.lineWidth = Math.max(0.6, rowProgress * 1.8);
          ctx.stroke();
        }

        // Draw Longitudinal Silicon Grid Lines (Connecting Across Depth)
        for (let c = 0; c < gridCols; c += 2) {
          ctx.beginPath();
          for (let r = 0; r < gridRows; r++) {
            const pt = points[r][c];
            if (r === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = "rgba(0, 229, 255, 0.22)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw Glowing Silicon Die Intersections & Data Pulses
        for (let r = 0; r < gridRows; r += 2) {
          for (let c = 0; c < gridCols; c += 2) {
            const pt = points[r][c];
            if (pt.alpha > 0.12) {
              const pulse = Math.sin(time * 0.04 + r * 0.5 + c * 0.5) * 0.35 + 0.65;
              ctx.beginPath();
              ctx.arc(pt.sx, pt.sy, Math.max(0.8, (1 - r / gridRows) * 2.6), 0, Math.PI * 2);
              ctx.fillStyle = `rgba(191, 242, 48, ${pt.alpha * pulse * 0.9})`;
              ctx.shadowColor = "#76B900";
              ctx.shadowBlur = 8;
              ctx.fill();
              ctx.shadowBlur = 0;

              // Animate energetic data packet along grid line occasionally
              if ((r + c + Math.floor(time * 0.05)) % 14 === 0 && r + 1 < gridRows) {
                const nextPt = points[r + 1][c];
                const packetProgress = (time * 0.02 + (c * 0.1)) % 1;
                const px = pt.sx + (nextPt.sx - pt.sx) * packetProgress;
                const py = pt.sy + (nextPt.sy - pt.sy) * packetProgress;
                ctx.beginPath();
                ctx.arc(px, py, 1.8, 0, Math.PI * 2);
                ctx.fillStyle = "#FFFFFF";
                ctx.shadowColor = "#00E5FF";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
              }
            }
          }
        }
      }

      // ==========================================================
      // THEME 2: 3D SPIRAL GALAXY
      // ==========================================================
      else if (theme === "galaxy") {
        const cx = width * 0.5;
        const cy = height * 0.45;

        const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 380);
        coreG.addColorStop(0, "rgba(118, 185, 0, 0.2)");
        coreG.addColorStop(0.3, "rgba(0, 229, 255, 0.08)");
        coreG.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = coreG;
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.angle += s.speed;

          const px = cx + Math.cos(s.angle) * s.radius;
          const py = cy + Math.sin(s.angle) * (s.radius * 0.45);

          const mouseDist = Math.hypot(px - mouse.x, py - mouse.y);
          const brighten = mouseDist < 150 ? (1 - mouseDist / 150) * 0.6 : 0;

          ctx.beginPath();
          ctx.arc(px, py, s.size, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.min(1, 0.4 + brighten);
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      }

      // ==========================================================
      // THEME 3: BIOLUMINESCENT FLUID FLOW
      // ==========================================================
      else {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;

          if (p.life > p.maxLife || p.y < -20 || p.x < 0 || p.x > width) {
            p.x = Math.random() * width;
            p.y = height + 10;
            p.life = 0;
            p.vx = (Math.random() - 0.5) * 1.5;
            p.vy = -Math.random() * 1.5 - 0.5;
          }

          const progress = p.life / p.maxLife;
          const alpha = Math.sin(progress * Math.PI) * 0.7;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
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
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-700 z-0"
    />
  );
}
