"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
  ShieldCheck,
} from "lucide-react";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmittingForm(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmittingForm(false);
    setSubmittedEmail(data.email);
    toast.info("Password reset simulated (Demo Preview)");
  };

  const handleReset = () => {
    setSubmittedEmail(null);
    reset();
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Brand Hero Panel (Desktop) */}
      <AuthSidePanel
        heading="Secure account recovery for SmartRent BD"
        subheading="Reset your account password quickly to regain access to your saved listings, visit requests, and rental agreements."
      />

      {/* Right Column: Clean, Compact Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-[420px] mx-auto space-y-4">
          {/* Mobile-only logo */}
          <div className="lg:hidden text-center pb-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 group cursor-pointer focus:outline-hidden"
              aria-label="SmartRent BD Home"
            >
              <Image
                src="/smartrent-bd.png"
                alt="SmartRent BD"
                width={150}
                height={38}
                priority
                className="h-8 w-auto object-contain mx-auto"
              />
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Enter your registered email address to receive recovery instructions
            </p>
          </div>

          {submittedEmail ? (
            /* Confirmation State (Demo Mode) */
            <div className="space-y-4 py-2">
              <div className="w-11 h-11 rounded-full bg-secondary text-primary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold text-foreground font-heading">
                  Demo Recovery Simulated
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We simulated recovery instructions for{" "}
                  <strong className="text-foreground">{submittedEmail}</strong>.
                </p>
              </div>

              <div className="rounded-xs border border-primary/20 bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-primary text-[11px]">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Prototype Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  No real email is dispatched in client demo mode. You can return to the sign in page and test with any demo credentials.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/login"
                  className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
                >
                  <span>Return to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full h-10 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-medium text-foreground bg-card hover:bg-secondary/40 border border-border rounded-xs transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Try Another Email</span>
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold text-foreground block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className={`w-full h-10 pl-9 pr-3 text-xs rounded-xs border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 transition-colors ${
                      errors.email
                        ? "border-destructive focus:ring-destructive"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingForm}
                className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <span>
                  {isSubmittingForm
                    ? "Sending Instructions..."
                    : "Send Recovery Instructions"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* Security note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>End-to-end secured • Zero broker charges</span>
          </div>
        </div>
      </div>
    </div>
  );
}
