"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const count = useMotionValue(0);
  
  const formatted = useTransform(count, (latest) => {
    // If it's 0 decimals and greater than 1000, we could add commas, but let's just do toFixed for now.
    // However, toLocaleString is often better for currency. For simplicity, we just use the raw fixed string unless we implement a complex formatter.
    // If we want commas, we can do a replace:
    const numStr = latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return prefix + numStr + suffix;
  });

  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{formatted}</motion.span>;
}
