
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type AnimateInProps = {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  from?: "bottom" | "left" | "right" | "top";
  once?: boolean;
};

export function AnimateIn({
  children,
  className = "",
  duration = 0.5,
  delay = 0,
  from = "bottom",
  once = true,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once });

  const directions = {
    bottom: { y: 40, opacity: 0 },
    top: { y: -40, opacity: 0 },
    left: { x: -40, opacity: 0 },
    right: { x: 40, opacity: 0 },
  };

  const initial = directions[from];

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { x: 0, y: 0, opacity: 1 } : initial}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
