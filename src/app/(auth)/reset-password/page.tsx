"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/forgot-password");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground text-xs text-muted-foreground">
      Redirecting to password recovery...
    </div>
  );
}
