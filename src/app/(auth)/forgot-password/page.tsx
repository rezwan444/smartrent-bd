"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";

type Step = "EMAIL" | "OTP" | "PASSWORD" | "SUCCESS";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // 1. Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Verification code sent to ${trimmedEmail}`);
        setStep("OTP");
      } else {
        toast.error(data.error || "No account found with this email address.");
      }
    } catch {
      toast.error("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. OTP Input Handler
  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const digit = cleaned.length > 0 ? cleaned.slice(-1) : "";
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (paste.length > 0) {
      const newOtp = ["", "", "", ""];
      for (let i = 0; i < paste.length; i++) {
        newOtp[i] = paste[i];
      }
      setOtp(newOtp);
      otpRefs[Math.min(paste.length, 3)].current?.focus();
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("").trim();
    if (enteredOtp.length < 4) {
      toast.error("Please enter the complete 4-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: enteredOtp }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Code verified successfully!");
        setStep("PASSWORD");
      } else {
        toast.error(data.error || "Invalid OTP code. Please enter the correct code.");
        setOtp(["", "", "", ""]);
        otpRefs[0].current?.focus();
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setOtp(["", "", "", ""]);
    otpRefs[0].current?.focus();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "A new verification code has been sent to your email.");
        setOtp(["", "", "", ""]);
        otpRefs[0].current?.focus();
      } else {
        toast.error(data.error || "Failed to resend code.");
      }
    } catch {
      toast.error("Network error while resending code.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.join(""),
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Password updated successfully!");
        setStep("SUCCESS");
      } else {
        toast.error(data.error || "Failed to update password.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Brand Hero Panel (Desktop) */}
      <AuthSidePanel
        heading="Secure account recovery for SmartRent BD"
        subheading="Reset your account password quickly via verification OTP to regain access to your dashboard and rental records."
      />

      {/* Right Column: Clean, Compact Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <div className="w-full max-w-[400px] mx-auto space-y-5">
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

          {/* STEP 1: ENTER EMAIL */}
          {step === "EMAIL" && (
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your registered email address to receive a 4-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-foreground block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-10 pl-9 pr-3 text-xs rounded-xs border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  <span>{isLoading ? "Sending Code..." : "Send Verification Code"}</span>
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
            </div>
          )}

          {/* STEP 2: ENTER OTP */}
          {step === "OTP" && (
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold font-heading text-foreground tracking-tight">
                  Enter Verification Code
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We sent a 4-digit code to <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-12 text-center text-lg font-bold rounded-xs border border-border bg-card text-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  <span>{isLoading ? "Verifying..." : "Verify Code"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(["", "", "", ""]);
                      setStep("EMAIL");
                    }}
                    className="text-muted-foreground hover:text-foreground text-[11px] cursor-pointer"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleResendOtp}
                    className="text-primary hover:underline text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === "PASSWORD" && (
            <div className="space-y-4">
              <div className="space-y-1 text-center">
                <h1 className="text-xl font-bold font-heading text-foreground tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter your new password for <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-9 text-xs rounded-xs border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-10 pl-9 pr-9 text-xs rounded-xs border border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  <span>{isLoading ? "Saving Password..." : "Update Password"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === "SUCCESS" && (
            <div className="space-y-5 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold font-heading text-foreground tracking-tight">
                  Password Reset Successful!
                </h1>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account password has been updated. You can now sign in with your new password.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Security note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>256-bit encrypted session • Zero broker fees</span>
          </div>
        </div>
      </div>
    </div>
  );
}
