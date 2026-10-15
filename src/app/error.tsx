"use client";

import { Button } from "@/components/ui/button";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-[0_0_30px_var(--color-destructive)] shadow-destructive/20">
            <AlertTriangle className="h-12 w-12 text-destructive animate-pulse" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight drop-shadow-sm">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8 text-sm max-w-70 mx-auto leading-relaxed">
          We’re sorry, but an unexpected error occurred. Please try again or
          return to the dashboard.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => reset()}
            className="bg-destructive hover:bg-destructive-soft text-white rounded-md px-6 py-5 font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg shadow-destructive/20"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Try again
          </Button>
          <Button
            asChild
            className="bg-secondary text-foreground hover:bg-secondary/80 border-none rounded-md px-6 py-5 font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg"
          >
            <Link href="/dashboard/admin">
              <Home className="mr-2 h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-16 text-xs text-muted-foreground">
        {WEBSITE_DETAILS.SITE_NAME} © {new Date().getFullYear()}
      </p>
    </div>
  );
}
