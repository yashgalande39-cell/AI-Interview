import { useEffect, useRef } from "react";

/**
 * GPU-friendly canvas: floating particle field + animated neural network
 * with data pulses traveling along connections, reacting to the cursor.
 */
export function NeuralBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    const NODE_COUNT = Math.min(70, Math.floor((width * height) / 24000));
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      z: Math.random() * 0.8 + 0.2,
      glow: Math.random() > 0.78,
    }));

    const PARTICLE_COUNT = reduce ? 0 : Math.min(140, Math.floor((width * height) / 12000));
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.3,
      vy: -(Math.random() * 0.3 + 0.05),
      vx: (Math.random() - 0.5) * 0.1,
      z: Math.random() * 0.9 + 0.1,
    }));

    const pulses = [];
    const mouse = { x: width / 2, y: height / 2, active: false };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", setSize);

    const MAX_DIST = 150;
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // particles
      for (const p of particles) {
        p.y += p.vy * (0.6 + p.z);
        p.x += p.vx;
        if (p.y < -5) {
          p.y = height + 5;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150,180,255,${0.05 + p.z * 0.25})`;
        ctx.fill();
      }

      // nodes movement + cursor attraction
      for (const n of nodes) {
        n.x += n.vx * n.z;
        n.y += n.vy * n.z;
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 220 && d > 1) {
            n.x += (dx / d) * 0.25 * n.z;
            n.y += (dy / d) * 0.25 * n.z;
          }
        }
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(120,140,255,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
            if (!reduce && Math.random() < 0.0006) {
              pulses.push({ a: i, b: j, t: 0, speed: 0.02 + Math.random() * 0.02 });
            }
          }
        }
      }

      // node dots
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.glow ? 2.2 : 1.3, 0, Math.PI * 2);
        ctx.fillStyle = n.glow ? "rgba(170,140,255,0.9)" : "rgba(140,160,255,0.55)";
        if (n.glow) {
          ctx.shadowColor = "rgba(150,120,255,0.9)";
          ctx.shadowBlur = 8;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // data pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) {
          pulses.splice(i, 1);
          continue;
        }
        const a = nodes[p.a];
        const b = nodes[p.b];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120,220,255,0.95)";
        ctx.shadowColor = "rgba(120,220,255,1)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
}
