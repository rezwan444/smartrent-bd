"use client";

import { Button } from "@/components/ui/button";
import { clearEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch } from "@/redux/hook";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetSuccessPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedirect = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      router.push("/login");
    }, 800);
  };

  useEffect(() => {
    dispatch(clearEmail());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] px-4 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="rounded-2xl bg-[#3a3a3a] border border-[#2a2a2a] shadow-2xl">
            {/* Header */}

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <Image
                  src="/placeholder/pass-res-success.png"
                  alt="Password Reset Successful"
                  width={140}
                  height={140}
                  priority
                  draggable={false}
                />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-white">
                  Password Reset Successful
                </h1>
                <p className="text-center max-w-xs mx-auto text-sm text-muted-foreground leading-relaxed">
                  Your password has been updated. You can now sign in with your
                  new password.
                </p>
              </div>

              {/* Action */}
              <Button
                onClick={handleRedirect}
                disabled={isSubmitting}
                className="w-full h-11 rounded-lg bg-[#e10613] hover:bg-[#b9050f] text-white font-medium disabled:opacity-60 relative overflow-hidden"
              >
                {isSubmitting && (
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                )}
                <span className="relative z-10">
                  {isSubmitting ? "Redirecting..." : "Sign In"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
