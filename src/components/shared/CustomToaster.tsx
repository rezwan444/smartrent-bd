"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Toaster } from "sonner";

export function CustomToaster() {
  return (
    <Toaster
      position="bottom-right"
      theme="light"
      closeButton
      icons={{
        success: <CheckCircle className="w-4.5 h-4.5 text-primary shrink-0" />,
        error: <AlertCircle className="w-4.5 h-4.5 text-destructive shrink-0" />,
        info: <Info className="w-4.5 h-4.5 text-primary shrink-0" />,
        warning: <AlertTriangle className="w-4.5 h-4.5 text-accent shrink-0" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!relative !flex !items-center !gap-3 !w-full !rounded-xs !py-3 !pl-4 !pr-10 !shadow-md !border !bg-card !text-foreground font-sans",
          title: "!text-xs sm:!text-sm !font-semibold !text-foreground !leading-snug",
          description: "!text-[12px] !text-muted-foreground !leading-snug",
          success: "!bg-card !border-primary/40 !text-foreground",
          error: "!bg-card !border-destructive/40 !text-foreground",
          info: "!bg-card !border-primary/40 !text-foreground",
          warning: "!bg-card !border-accent/40 !text-foreground",
          closeButton:
            "!bg-transparent hover:!bg-secondary/60 !border-none !text-muted-foreground hover:!text-foreground !absolute !right-3 !top-0 !bottom-0 !my-auto !left-auto !transform-none !p-1 !h-6 !w-6 !flex !items-center !justify-center !opacity-100 !rounded-xs transition-colors",
          icon: "!shrink-0 !w-4.5 !h-4.5",
        },
      }}
    />
  );
}
