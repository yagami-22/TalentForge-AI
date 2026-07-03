"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type MotionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function DashboardMotionSection({
  children,
  className,
  delay = 0,
}: MotionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function DashboardMotionGrid({
  children,
  className,
  delay = 0,
}: MotionProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            delayChildren: delay,
            staggerChildren: 0.055,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function DashboardMotionItem({ children, className }: MotionProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14, scale: 0.985 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.36, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
