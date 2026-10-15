"use client";

import { Button } from "@/components/ui/button";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { ArrowLeft, Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-[0_0_30px_var(--color-destructive)] shadow-destructive/20">
            <Ghost className="h-12 w-12 text-destructive animate-pulse" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-7xl font-black text-foreground mb-4 tracking-tighter drop-shadow-sm">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 text-sm max-w-[280px] mx-auto leading-relaxed">
          The page you’re looking for doesn’t exist or has been moved to another coordinate.
        </p>

        {/* Actions */}
        <div className="flex justify-center mt-2">
          <Button
            asChild
            className="bg-destructive hover:bg-destructive-soft text-white rounded-md px-6 py-5 font-semibold text-sm transition-all hover:scale-105 hover:shadow-lg shadow-destructive/20"
          >
            <Link href="/dashboard/admin">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back home
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
