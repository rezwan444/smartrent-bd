"use client";

import PageTransition from "@/components/dashboard/PageTransition";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname}>
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
