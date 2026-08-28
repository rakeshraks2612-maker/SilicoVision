"use client";

import React, { useEffect, useRef } from "react";

export type BgTheme = "quantum" | "galaxy" | "fluid" | "photonic";

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

    // Mouse tracking with fluid spring interpolation
    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      tiltX: 0,
      tiltY: 0,
      isHovered: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
      mouse.targetX = width * 0.5;
      mouse.targetY = height * 0.4;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    let time = 0;

    // --- 1. QUANTUM 3D SILICON TERRAIN MESH ---
    const gridCols = 32;
    const gridRows = 24;

    // --- 2. GALAXY STARS ---
    interface Star {
      r: number;
      baseAngle: number;
      armOffset: number;
      z: number;
      size: number;
      speed: number;
      color: string;
      glowColor: string;
    }
    const stars: Star[] = [];
    const numArms = 3;
    const maxRadius = Math.min(width, height) * 0.62;
    for (let i = 0; i < 450; i++) {
      const normR = Math.pow(Math.random(), 1.6);
      const r = normR * maxRadius + 15;
      const arm = (i % numArms) * ((Math.PI * 2) / numArms);
      const baseAngle = normR * 2.4 * Math.PI + (Math.random() - 0.5) * 0.5 * (1 + normR);
      const colors = ["#FFFFFF", "#BFF230", "#76B900", "#7CD7FE", "#A78BFA"];
      const c = colors[Math.floor(normR * (colors.length - 1))];
      stars.push({
        r,
        baseAngle,
        armOffset: arm,
        z: (Math.random() - 0.5) * 50 * (1 - normR * 0.4),
        size: Math.random() * 1.8 + 0.6,
        speed: (0.0018 + (1 - normR) * 0.003) * 0.6,
        color: c,
        glowColor: c === "#BFF230" ? "rgba(191,242,48,0.7)" : "rgba(124,215,254,0.6)",
      });
    }

    // --- 3. FLUID PARTICLES ---
    interface FluidP {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      speed: number;
      life: number;
      maxLife: number;
      color: string;
      glow: string;
    }
    const fluidParticles: FluidP[] = [];
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      fluidParticles.push({
        x,
        y,
        prevX: x,
        prevY: y,
        speed: Math.random() * 1.5 + 0.8,
        life: Math.random() * 100,
        maxLife: Math.random() * 200 + 100,
        color: Math.random() > 0.5 ? "#BFF230" : "#7CD7FE",
        glow: Math.random() > 0.5 ? "rgba(191,242,48,0.4)" : "rgba(124,215,254,0.3)",
      });
    }

    let animationId: number;

    function render() {
      if (!ctx || !canvas) return;
      time += 1;

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const targetTiltX = ((mouse.y - height * 0.5) / height) * 0.35;
      const targetTiltY = ((mouse.x - width * 0.5) / width) * 0.35;
      mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
      mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

      // ==========================================
      // THEME 1: QUANTUM 3D SILICON TERRAIN (DEFAULT)
      // ==========================================
      if (theme === "quantum") {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#030406";
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "screen";

        // Ambient Volumetric Nebula Glow
        const ambGlow = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.4, width * 0.55);
        ambGlow.addColorStop(0, "rgba(191, 242, 48, 0.12)");
        ambGlow.addColorStop(0.4, "rgba(124, 215, 254, 0.05)");
        ambGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ambGlow;
        ctx.fillRect(0, 0, width, height);

        // 3D Perspective Silicon Quantum Mesh
        const fov = 450;
        const planeZStart = 120;
        const planeZEnd = 900;
        const planeWidth = width * 1.6;

        // Calculate 3D points
        const points: { x: number; y: number; z: number; sx: number; sy: number; alpha: number }[][] = [];

        for (let r = 0; r < gridRows; r++) {
          points[r] = [];
          const normZ = r / (gridRows - 1);
          const z = planeZStart + normZ * (planeZEnd - planeZStart);
          const scale = fov / z;

          for (let c = 0; c < gridCols; c++) {
            const normX = (c / (gridCols - 1) - 0.5);
            const wx = normX * planeWidth;

            // Undulating 3D wave equation
            const distFromCenter = Math.hypot(normX * 2, normZ - 0.5);
            const wave1 = Math.sin(normX * 6 + time * 0.02) * 22;
            const wave2 = Math.cos(normZ * 8 - time * 0.025) * 18;

            // Mouse ripple interaction
            const screenApproxX = width * 0.5 + wx * scale;
            const distToMouse = Math.hypot(screenApproxX - mouse.x, (height * 0.65) - mouse.y);
            const mouseRipple = Math.exp(-distToMouse / 200) * Math.sin(distToMouse * 0.05 - time * 0.08) * 35;

            const wy = (height * 0.28) + wave1 + wave2 + mouseRipple;

            const sx = width * 0.5 + wx * scale + mouse.tiltY * (1 - normZ) * 60;
            const sy = height * 0.55 + wy * scale + mouse.tiltX * (1 - normZ) * 40;

            const alpha = Math.max(0, (1 - normZ) * 0.55);
            points[r][c] = { x: wx, y: wy, z, sx, sy, alpha };
          }
        }

        // Draw horizontal mesh lines
        for (let r = 0; r < gridRows; r++) {
          ctx.beginPath();
          for (let c = 0; c < gridCols; c++) {
            const pt = points[r][c];
            if (c === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          const rowAlpha = (1 - r / gridRows) * 0.35;
          ctx.strokeStyle = `rgba(191, 242, 48, ${rowAlpha})`;
          ctx.lineWidth = Math.max(0.6, (1 - r / gridRows) * 1.8);
          ctx.stroke();
        }

        // Draw longitudinal mesh lines & glowing node crosshairs
        for (let c = 0; c < gridCols; c += 2) {
          ctx.beginPath();
          for (let r = 0; r < gridRows; r++) {
            const pt = points[r][c];
            if (r === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = "rgba(124, 215, 254, 0.18)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw glowing intersection points
        for (let r = 0; r < gridRows; r += 2) {
          for (let c = 0; c < gridCols; c += 2) {
            const pt = points[r][c];
            if (pt.alpha > 0.15) {
              const pulse = Math.sin(time * 0.05 + r + c) * 0.3 + 0.7;
              ctx.fillStyle = `rgba(191, 242, 48, ${pt.alpha * pulse * 0.8})`;
              ctx.beginPath();
              ctx.arc(pt.sx, pt.sy, Math.max(0.8, (1 - r / gridRows) * 2.5), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // ==========================================
      // THEME 2: 3D SPIRAL GALAXY
      // ==========================================
      else if (theme === "galaxy") {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#020306";
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "screen";

        const gx = width * 0.5;
        const gy = height * 0.45;

        // Core glow
        const coreG = ctx.createRadialGradient(gx, gy, 0, gx, gy, maxRadius * 0.85);
        coreG.addColorStop(0, "rgba(255, 255, 255, 0.25)");
        coreG.addColorStop(0.12, "rgba(191, 242, 48, 0.18)");
        coreG.addColorStop(0.35, "rgba(118, 185, 0, 0.09)");
        coreG.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = coreG;
        ctx.fillRect(0, 0, width, height);

        const galaxyPitch = 0.58 + mouse.tiltX;
        const galaxyYaw = time * 0.0012 + mouse.tiltY;

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const angle = s.baseAngle + s.armOffset + time * s.speed + galaxyYaw;
          const px = Math.cos(angle) * s.r;
          const py = Math.sin(angle) * s.r;

          const rotY = py * Math.cos(galaxyPitch) - s.z * Math.sin(galaxyPitch);
          const rotZ = py * Math.sin(galaxyPitch) + s.z * Math.cos(galaxyPitch);

          const fov = 750;
          const scale = fov / (fov + rotZ);
          const sx = gx + px * scale;
          const sy = gy + rotY * scale;

          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.4, s.size * scale), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ==========================================
      // THEME 3: BIOLUMINESCENT FLUID FLOW
      // ==========================================
      else {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "rgba(3, 4, 6, 0.12)";
        ctx.fillRect(0, 0, width, height);

        ctx.globalCompositeOperation = "screen";

        for (let i = 0; i < fluidParticles.length; i++) {
          const p = fluidParticles[i];
          p.prevX = p.x;
          p.prevY = p.y;

          const angle = (Math.sin(p.x * 0.002 + time * 0.0008) + Math.cos(p.y * 0.002 + time * 0.0008)) * Math.PI;
          p.x += Math.cos(angle) * p.speed;
          p.y += Math.sin(angle) * p.speed;
          p.life += 1;

          if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life > p.maxLife) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.prevX = p.x;
            p.prevY = p.y;
            p.life = 0;
          }

          ctx.strokeStyle = p.glow;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.prevX, p.prevY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none transition-opacity duration-700"
    />
  );
}
