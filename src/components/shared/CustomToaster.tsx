"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Toaster } from "sonner";

export function CustomToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      icons={{
        success: <CheckCircle className="w-5 h-5 text-[#00c97b]" />,
        error: <AlertCircle className="w-5 h-5 text-[#ef4444]" />,
        info: <Info className="w-5 h-5 text-[#3b82f6]" />,
        warning: <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!relative !flex !items-start sm:!items-center !gap-3 !w-full !rounded-2xl !py-4 !pl-5 !pr-12 !shadow-lg !border",
          title: "!text-[15px] !font-medium !text-foreground !leading-snug",
          description: "!text-[14px] !text-muted-foreground !leading-snug",
          success: "!bg-[#18181b] !border-[#00c97b]/50",
          error: "!bg-[#18181b] !border-[#ef4444]/50",
          info: "!bg-[#18181b] !border-[#3b82f6]/50",
          warning: "!bg-[#18181b] !border-[#f59e0b]/50",
          closeButton:
            "!bg-transparent !border-none !text-muted-foreground hover:!text-foreground !absolute !right-4 !top-0 !bottom-0 !my-auto !left-auto !transform-none !p-1 !h-6 !w-6 !flex !items-center !justify-center !opacity-100",
          icon: "!mt-0.5 sm:!mt-0 !shrink-0 !w-5 !h-5",
        },
      }}
    />
  );
}
