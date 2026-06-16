import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Dynamic cursor glow that softly follows the pointer. */
export function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 120, damping: 20, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 120, damping: 20, mass: 0.4 });

  useEffect(() => {
    const move = (e) => {
      x.set(e.clientX - 260);
      y.set(e.clientY - 260);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="lp-cursor-glow"
    >
      <div className="lp-cursor-glow-inner" />
    </motion.div>
  );
}
