/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { SiteBrand } from "@/components/shared/SiteBrand";
import { Button } from "@/components/ui/button";
import { WEBSITE_DETAILS } from "@/lib/constants";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/api/auth/authApi";
import { setResetPassToken } from "@/redux/features/user/authSlice";
import { selectEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useRouter } from "next/navigation";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const OTP_LENGTH = 4;
const createEmptyOtp = () => Array.from({ length: OTP_LENGTH }, () => "");

export default function VerifyEmailPage() {
  const dispatch = useAppDispatch();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  // get stored email for verify otp from redux
  const emailFromStore = useAppSelector(selectEmail);
  const resetPassToken = useAppSelector((state) => state.auth.resetPassToken);
  // console.log("emailFromStore", emailFromStore);

  const [otp, setOtp] = useState<string[]>(createEmptyOtp());
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(""); // Clear error when user types

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  //   handle submit after otp input
  const handleSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (emailFromStore) {
        const result = await verifyOtp({
          type: "PASSWORD_RESET",
          otp: otpValue,
          verificationToken: resetPassToken || "",
        }).unwrap();
        // console.log("result", result);
        if (result?.success && result?.data?.resetToken) {
          dispatch(setResetPassToken(result?.data?.resetToken));
          toast.success(result?.message);
          router.replace("/reset-password");
        }
      } else {
        setError("Email is null, cannot resend OTP");
      }

      // Clear OTP inputs
      setOtp(createEmptyOtp());
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      inputRefs.current[0]?.focus();

      // Clear OTP inputs
      setOtp(createEmptyOtp());
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (resendCountdown > 0) return;

    setIsResending(true);
    setError("");
    setResendMessage("");

    try {
      // Clear OTP inputs
      setOtp(createEmptyOtp());
      inputRefs.current[0]?.focus();

      if (emailFromStore) {
        const result = await resendOtp({ email: emailFromStore }).unwrap();
        console.log(result);

        if (result?.success && result?.data?.verificationToken) {
          //   toast.success(result?.message);
          // Show success message
          //   setResendMessage(result?.message);
          dispatch(setResetPassToken(result.data.verificationToken));
          toast.success(result?.message);
        }

        // Start 30-second countdown
        setResendCountdown(20);
      } else {
        setError("Email is null, cannot resend OTP");
      }

      //   console.log(`OTP resent successfully to ${emailFromStore}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errMsg =
        err?.message || err?.data?.message || "Something went wrong";
      //   setError("Failed to resend code. Please try again.");
      //   toast.error(errMsg);
      setError(errMsg);
      //   console.log("Resend failed:", err);
    } finally {
      setIsResending(false);
    }
  };

  //   if email not found in store redirect to login page
  useEffect(() => {
    if (!emailFromStore) return router.replace("/login");
  }, [router, emailFromStore]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (resendMessage) {
      const timer = setTimeout(() => {
        setResendMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resendMessage]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-xs bg-card border border-border shadow-xs">
          {/* Header */}
          <div className="px-8 pt-8 text-center space-y-2">
            <SiteBrand
              logo={WEBSITE_DETAILS.SITE_LOGO}
              name={WEBSITE_DETAILS.SITE_ONLY_NAME}
              description={WEBSITE_DETAILS.SITE_DESCRIPTION}
              className="flex items-center justify-center"
            />

            <h1 className="text-xl font-semibold text-foreground font-heading">Verify Code</h1>

            <p className="text-sm text-muted-foreground">
              Enter the 4-digit code sent to your email
            </p>
          </div>

          {/* OTP Section */}
          <div className="p-8 space-y-6">
            <p className="text-center text-sm text-muted-foreground">
              Verification Code
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="
                  w-12 h-12 text-center text-lg font-semibold
                  rounded-xs
                  bg-background
                  border border-border
                  text-foreground
                  focus:border-primary
                  focus:outline-none
                  transition-colors
                "
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-center text-xs text-destructive">{error}</p>
            )}

            {/* Resend */}
            <div className="text-center text-sm text-muted-foreground">
              Didn&apos;t get it?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCountdown > 0 || isResending}
                className={`font-medium hover:cursor-pointer transition-colors ${
                  resendCountdown > 0 || isResending
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-primary hover:underline"
                }`}
              >
                {isResending
                  ? "Sending..."
                  : resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : "Resend"}
              </button>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="h-11 rounded-xs border border-border bg-background text-foreground hover:bg-secondary/40 cursor-pointer"
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || otp.join("").length !== OTP_LENGTH}
                className="h-11 rounded-xs bg-primary hover:bg-primary-dark text-primary-foreground font-medium disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? "Verifying..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
