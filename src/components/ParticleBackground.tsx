import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
  pulseOffset: number;
  color: string;
}

export const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let resizeTimeout: NodeJS.Timeout;

    const particleColors = [
      'rgba(158, 202, 255, ', // #9ecaff cyan/light blue
      'rgba(110, 160, 225, ', // mid soft blue
      'rgba(80, 120, 185, ',  // deeper slate blue
    ];

    const createParticles = (w: number, h: number) => {
      // Calculate particle density: ~1 particle per 25,000 px^2, clamped between 25 and 65
      const count = Math.min(65, Math.max(25, Math.floor((w * h) / 28000)));
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const baseAlpha = 0.12 + Math.random() * 0.28; // subtle: 0.12 - 0.40
        newParticles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, // slow, gentle drift
          vy: (Math.random() - 0.5) * 0.25,
          radius: 1 + Math.random() * 1.6, // 1.0px to 2.6px
          baseAlpha,
          alpha: baseAlpha,
          pulseSpeed: 0.008 + Math.random() * 0.015,
          pulseOffset: Math.random() * Math.PI * 2,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
        });
      }
      return newParticles;
    };

    const updateSize = (newWidth: number, newHeight: number) => {
      const dpr = window.devicePixelRatio || 1;
      width = newWidth;
      height = newHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      particles = createParticles(width, height);
    };

    // Initial sizing
    const rect = container.getBoundingClientRect();
    updateSize(rect.width, rect.height);

    // Responsive ResizeObserver with debounce
    const observer = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0) {
            updateSize(w, h);
          }
        }
      }, 150);
    });

    observer.observe(container);

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Draw faint interconnecting constellations between nearby particles
      const maxDistance = 90;
      const count = particles.length;

      for (let i = 0; i < count; i++) {
        const p1 = particles[i];

        // Update position
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Wrap around boundaries gently
        if (p1.x < -10) p1.x = width + 10;
        else if (p1.x > width + 10) p1.x = -10;

        if (p1.y < -10) p1.y = height + 10;
        else if (p1.y > height + 10) p1.y = -10;

        // Subtle oscillating brightness
        p1.alpha = p1.baseAlpha + Math.sin(time * p1.pulseSpeed + p1.pulseOffset) * 0.08;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p1.color}${Math.max(0.04, Math.min(0.45, p1.alpha))})`;
        ctx.fill();

        // Connect nearby particles with subtle faint lines
        for (let j = i + 1; j < count; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * 0.07; // Very faint trace (max 7% opacity)
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(158, 202, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="particle-background-container"
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
    >
      <canvas ref={canvasRef} className="block w-full h-full opacity-65" />
    </div>
  );
};
