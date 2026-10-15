"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
}

const variants: Variants = {
  hidden: { opacity: 0, y: 15 },
  enter: { opacity: 1, y: 0 },
};

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="enter"
      variants={variants}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
