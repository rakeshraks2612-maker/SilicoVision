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

    // Mouse state with spring-lerp easing
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

    // Fluid Flow Field Particles
    interface FlowParticle {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      speed: number;
      life: number;
      maxLife: number;
      color: string;
      glowColor: string;
      size: number;
    }

    const particleCount = Math.min(260, Math.floor((width * height) / 5500));
    const particles: FlowParticle[] = [];

    const colors = [
      { core: "#BFF230", glow: "rgba(191, 242, 48, 0.45)" }, // NVIDIA Lime
      { core: "#76B900", glow: "rgba(118, 185, 0, 0.40)" }, // NVIDIA Emerald
      { core: "#7CD7FE", glow: "rgba(124, 215, 254, 0.35)" }, // Electric Sky
      { core: "#00E5FF", glow: "rgba(0, 229, 255, 0.30)" }, // Cyan
    ];

    function initParticle(): FlowParticle {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const c = colors[Math.floor(Math.random() * colors.length)];
      return {
        x,
        y,
        prevX: x,
        prevY: y,
        speed: Math.random() * 1.5 + 0.8,
        life: Math.random() * 100,
        maxLife: Math.random() * 250 + 150,
        color: c.core,
        glowColor: c.glow,
        size: Math.random() * 1.8 + 1.0,
      };
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(initParticle());
    }

    let animationId: number;

    // Noise angle approximation for organic magnetic fluid flow
    function getFlowAngle(x: number, y: number, t: number): number {
      const scale1 = 0.0018;
      const scale2 = 0.0035;
      const a1 = Math.sin(x * scale1 + t * 0.0006) + Math.cos(y * scale1 + t * 0.0008);
      const a2 = Math.sin(y * scale2 - t * 0.0007) * Math.cos(x * scale2 + t * 0.0005);
      return (a1 + a2) * Math.PI;
    }

    // Initialize full dark canvas first
    ctx.fillStyle = "#030406";
    ctx.fillRect(0, 0, width, height);

    function render() {
      if (!ctx || !canvas) return;
      time += 1;

      // Mouse smooth interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      // 1. Semi-transparent black overlay to create smooth fluid light trails
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(3, 4, 6, 0.12)";
      ctx.fillRect(0, 0, width, height);

      // 2. Additive blending for luminous fluid energy streams
      ctx.globalCompositeOperation = "screen";

      // 3. Mouse Interactive Ambient Glow
      if (mouse.isHovered) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 450);
        mouseGlow.addColorStop(0, "rgba(191, 242, 48, 0.12)");
        mouseGlow.addColorStop(0.4, "rgba(124, 215, 254, 0.05)");
        mouseGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // 4. Update and Draw Fluid Flow Field Particles & Glowing Streams
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.prevX = p.x;
        p.prevY = p.y;

        // Base flow field vector angle
        let angle = getFlowAngle(p.x, p.y, time);

        // Gravitational vortex influence from mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 320;

        if (dist < maxDist && dist > 5) {
          const force = (1 - dist / maxDist) * 1.6;
          // Perpendicular tangential orbit + inward gravitational pull
          const mouseAngle = Math.atan2(dy, dx) + Math.PI * 0.45;
          angle = angle * (1 - force) + mouseAngle * force;
        }

        // Advance particle position
        p.x += Math.cos(angle) * p.speed;
        p.y += Math.sin(angle) * p.speed;
        p.life += 1;

        // Wrap around boundaries or reseed at end of life
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life > p.maxLife) {
          particles[i] = initParticle();
          continue;
        }

        // Calculate opacity envelope (fade in, stay, fade out)
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.85;

        // Draw glowing motion trail segment
        ctx.strokeStyle = p.glowColor;
        ctx.lineWidth = p.size * 3.2;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        // Draw bright core particle
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.prevX, p.prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // 5. Draw Subtle Hexagonal Silicon Wafer Matrix Crosshairs
      const hexSpacing = 64;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += hexSpacing) {
        for (let y = 0; y < height; y += hexSpacing) {
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          if (distToMouse < 280) {
            const hexAlpha = (1 - distToMouse / 280) * 0.22;
            ctx.strokeStyle = `rgba(191, 242, 48, ${hexAlpha})`;
            const len = 3;
            ctx.beginPath();
            ctx.moveTo(x - len, y);
            ctx.lineTo(x + len, y);
            ctx.moveTo(x, y - len);
            ctx.lineTo(x, y + len);
            ctx.stroke();
          }
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-20 pointer-events-none transition-opacity duration-700"
    />
  );
}
