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

    // Mouse tracking with smooth 3D tilt interpolation
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

    // 1. Galaxy Spiral Star Parameters
    interface Star {
      r: number; // radius from galaxy core
      baseAngle: number; // initial angle in arm
      armOffset: number; // arm index offset
      z: number; // height off galactic plane
      size: number;
      speed: number;
      color: string;
      glowColor: string;
      twinkleSpeed: number;
      twinkleOffset: number;
    }

    const starCount = Math.min(500, Math.floor((width * height) / 3200));
    const stars: Star[] = [];
    const numArms = 3;
    const maxRadius = Math.min(width, height) * 0.62;

    const starPalettes = [
      { core: "#FFFFFF", glow: "rgba(255, 255, 255, 0.9)" }, // Brilliant Core Star
      { core: "#BFF230", glow: "rgba(191, 242, 48, 0.7)" }, // NVIDIA Lime Supergiant
      { core: "#76B900", glow: "rgba(118, 185, 0, 0.6)" }, // Emerald Star
      { core: "#7CD7FE", glow: "rgba(124, 215, 254, 0.7)" }, // Electric Sky Star
      { core: "#A78BFA", glow: "rgba(167, 139, 250, 0.6)" }, // Cosmic Violet Nebula Star
    ];

    for (let i = 0; i < starCount; i++) {
      // Logarithmic distribution: denser near core
      const normR = Math.pow(Math.random(), 1.6);
      const r = normR * maxRadius + 15;
      const arm = (i % numArms) * ((Math.PI * 2) / numArms);
      const spiralCurvature = 2.4;
      const baseAngle = normR * spiralCurvature * Math.PI;
      const spread = (Math.random() - 0.5) * 0.5 * (1 + normR * 1.5);

      // Color based on galactic radius: White/Lime near core, Cyan/Violet on arms
      let colorIndex = 0;
      if (normR < 0.2) colorIndex = 0;
      else if (normR < 0.45) colorIndex = 1;
      else if (normR < 0.7) colorIndex = Math.random() > 0.5 ? 2 : 3;
      else colorIndex = Math.random() > 0.5 ? 3 : 4;

      const p = starPalettes[colorIndex];

      stars.push({
        r,
        baseAngle: baseAngle + spread,
        armOffset: arm,
        z: (Math.random() - 0.5) * 60 * (1 - normR * 0.4),
        size: Math.random() * 1.8 + 0.6,
        speed: (0.0018 + (1 - normR) * 0.003) * 0.6, // Keplerian differential rotation
        color: p.core,
        glowColor: p.glow,
        twinkleSpeed: Math.random() * 0.04 + 0.02,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // 2. Cosmic Background Dust / Deep Starfield
    interface DeepStar {
      x: number;
      y: number;
      size: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
    }

    const deepStars: DeepStar[] = [];
    for (let i = 0; i < 120; i++) {
      deepStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.4 ? "#ffffff" : Math.random() > 0.5 ? "#76B900" : "#7CD7FE",
      });
    }

    // 3. Shooting Stars / Cosmic Rays
    interface ShootingStar {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      alpha: number;
      color: string;
    }

    const shootingStars: ShootingStar[] = [];

    function maybeSpawnShootingStar() {
      if (Math.random() < 0.018 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.4,
          len: Math.random() * 90 + 50,
          speed: Math.random() * 12 + 10,
          angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.3,
          alpha: 1.0,
          color: Math.random() > 0.5 ? "#BFF230" : "#7CD7FE",
        });
      }
    }

    let animationId: number;

    function render() {
      if (!ctx || !canvas) return;
      time += 1;

      // Mouse smooth interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // 3D Parallax Tilt Angles based on mouse position
      const targetTiltX = ((mouse.y - height * 0.5) / height) * 0.4;
      const targetTiltY = ((mouse.x - width * 0.5) / width) * 0.4;
      mouse.tiltX += (targetTiltX - mouse.tiltX) * 0.05;
      mouse.tiltY += (targetTiltY - mouse.tiltY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // A. Deep Space Obsidian Base
      ctx.fillStyle = "#020306";
      ctx.fillRect(0, 0, width, height);

      // B. Ambient Deep-Space Nebula Clouds
      ctx.globalCompositeOperation = "screen";

      // Galaxy Center Anchor Position
      const galaxyCenterX = width * 0.5;
      const galaxyCenterY = height * 0.45;

      // 1. Supermassive Galactic Core Volumetric Glow
      const coreGlow = ctx.createRadialGradient(
        galaxyCenterX,
        galaxyCenterY,
        0,
        galaxyCenterX,
        galaxyCenterY,
        maxRadius * 0.85
      );
      coreGlow.addColorStop(0, "rgba(255, 255, 255, 0.25)");
      coreGlow.addColorStop(0.12, "rgba(191, 242, 48, 0.18)");
      coreGlow.addColorStop(0.35, "rgba(118, 185, 0, 0.09)");
      coreGlow.addColorStop(0.65, "rgba(124, 215, 254, 0.04)");
      coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Violet Outer Nebula Flare
      const violetNebula = ctx.createRadialGradient(
        galaxyCenterX + Math.cos(time * 0.005) * 60,
        galaxyCenterY + Math.sin(time * 0.004) * 40,
        0,
        galaxyCenterX,
        galaxyCenterY,
        maxRadius * 1.1
      );
      violetNebula.addColorStop(0, "rgba(138, 43, 226, 0.06)");
      violetNebula.addColorStop(0.5, "rgba(0, 229, 255, 0.03)");
      violetNebula.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = violetNebula;
      ctx.fillRect(0, 0, width, height);

      // 3. Interactive Mouse Gravity Halo
      if (mouse.isHovered) {
        const mouseHalo = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 350);
        mouseHalo.addColorStop(0, "rgba(191, 242, 48, 0.14)");
        mouseHalo.addColorStop(0.4, "rgba(124, 215, 254, 0.05)");
        mouseHalo.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = mouseHalo;
        ctx.fillRect(0, 0, width, height);
      }

      // C. Deep Background Starfield
      for (let i = 0; i < deepStars.length; i++) {
        const ds = deepStars[i];
        const pulse = Math.sin(time * ds.pulseSpeed + i) * 0.3 + 0.7;
        ctx.fillStyle = ds.color;
        ctx.globalAlpha = ds.alpha * pulse;
        ctx.beginPath();
        ctx.arc(ds.x, ds.y, ds.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // D. Draw 3D Spiral Galaxy Stars
      const galaxyPitch = 0.58 + mouse.tiltX; // Tilt angle of galactic plane
      const galaxyYaw = time * 0.0012 + mouse.tiltY; // Global rotation angle

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Angular position along spiral arm
        const currentAngle = s.baseAngle + s.armOffset + time * s.speed + galaxyYaw;

        // Position on 2D galactic plane
        const planeX = Math.cos(currentAngle) * s.r;
        const planeY = Math.sin(currentAngle) * s.r;

        // 3D Perspective Projection (Pitch rotation around X axis)
        const rotY = planeY * Math.cos(galaxyPitch) - s.z * Math.sin(galaxyPitch);
        const rotZ = planeY * Math.sin(galaxyPitch) + s.z * Math.cos(galaxyPitch);

        const fov = 750;
        const scale = fov / (fov + rotZ);

        const screenX = galaxyCenterX + planeX * scale;
        const screenY = galaxyCenterY + rotY * scale;

        // Mouse Gravitational Warp
        const distToMouse = Math.hypot(screenX - mouse.x, screenY - mouse.y);
        const mouseGrav = Math.max(0, 1 - distToMouse / 260);

        // Twinkle and distance intensity
        const twinkle = Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3 + 0.7;
        const starSize = Math.max(0.4, s.size * scale * (1 + mouseGrav * 0.8));
        const finalAlpha = Math.min(1.0, (scale * 0.85 + mouseGrav * 0.5) * twinkle);

        // Draw Star Halo Glow
        if (s.size > 1.1 || mouseGrav > 0.2) {
          ctx.fillStyle = s.glowColor;
          ctx.beginPath();
          ctx.arc(screenX, screenY, starSize * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Bright Star Core
        ctx.fillStyle = s.color;
        ctx.globalAlpha = finalAlpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, starSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // E. Draw Shooting Stars / Warp Streaks
      maybeSpawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.022;

        if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = ss.x - Math.cos(ss.angle) * ss.len;
        const tailY = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.7, `${ss.color}`);
        grad.addColorStop(1, "#ffffff");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        // Glowing streak head
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
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
