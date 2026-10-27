"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Building,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hook";
import { setTokens, setUser } from "@/redux/features/user/authSlice";
import { IAllStatusEnum, IRole } from "@/types/global";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { AppCheckbox } from "@/components/shared/AppCheckbox";
import Cookies from "js-cookie";

// Validation schema
const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    userType: z.enum(["student", "owner"], {
      message: "Please select an account type",
    }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and privacy policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<"student" | "owner">("student");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "student",
      acceptTerms: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmittingForm(true);

    const isOwner = selectedUserType === "owner";
    const assignedRole = isOwner ? IRole.OWNER : IRole.STUDENT;
    const targetDashboard = isOwner ? "/dashboard/owner" : "/dashboard/student";

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          userType: selectedUserType,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const { user: authUser, accessToken } = result.data;

        dispatch(
          setUser({
            id: authUser._id || authUser.id,
            email: authUser.email,
            firstName: authUser.fullName?.split(" ")[0] || "User",
            lastName: authUser.fullName?.split(" ").slice(1).join(" ") || "",
            phone: authUser.phone || "+880 1700-000000",
            location: authUser.location || "Dhaka, Bangladesh",
            profilePictureUrl: null,
            role: assignedRole,
            status: IAllStatusEnum.ACTIVE,
            twoFactor: false,
            createdAt: String(authUser.createdAt || new Date().toISOString()),
            updatedAt: String(authUser.updatedAt || new Date().toISOString()),
          })
        );
        dispatch(setTokens({ accessToken }));
        Cookies.set("userRole", assignedRole.toString());

        toast.success(
          `Account registered for ${data.fullName}! Redirecting to ${
            isOwner ? "Owner" : "Student"
          } Dashboard...`
        );
        router.replace(targetDashboard);
        return;
      }

      toast.error(result.error || "Registration failed. Please check your details.");
    } catch {
      // Offline demo fallback if API endpoint is unreachable
      dispatch(
        setUser({
          id: `demo-${selectedUserType}-user`,
          email: data.email,
          firstName: data.fullName.split(" ")[0] || "User",
          lastName:
            data.fullName.split(" ").slice(1).join(" ") ||
            `(${isOwner ? "Owner" : "Student"})`,
          phone: "+880 1700-000000",
          location: "Dhaka, Bangladesh",
          profilePictureUrl: null,
          role: assignedRole,
          status: IAllStatusEnum.ACTIVE,
          twoFactor: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        })
      );
      dispatch(setTokens({ accessToken: `demo-token-${selectedUserType}` }));
      Cookies.set("userRole", assignedRole.toString());

      toast.success(
        `Demo account prepared for ${data.fullName}! Redirecting to ${
          isOwner ? "Owner" : "Student"
        } Dashboard...`
      );
      router.replace(targetDashboard);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGoogleSignUp = () => {
    router.push(`/api/auth/google?role=${selectedUserType}`);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Brand Hero Panel (Desktop) */}
      <AuthSidePanel
        heading="Start your hassle-free student housing journey"
        subheading="Join SmartRent BD to find mess seats, shared flats, or list your student rental properties with zero intermediary broker fees."
      />

      {/* Right Column: Clean, Compact Registration Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="w-full max-w-[480px] mx-auto space-y-4">
          {/* Mobile-only brand logo */}
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
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Join SmartRent BD to find or list verified student rentals and messes
            </p>
          </div>

          {/* Google Sign-up Action */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isSubmittingForm}
            className="w-full h-10 inline-flex items-center justify-center gap-2.5 px-4 rounded-xs border border-border bg-card hover:bg-secondary/40 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Sign up with Google</span>
          </button>

          {/* Divider — guaranteed non-wrapping with whitespace-nowrap */}
          <div className="relative my-3" aria-hidden="true">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-[11px] font-medium tracking-wider text-muted-foreground whitespace-nowrap select-none">
                Or fill details manually
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            {/* User Type Selection: Compact 2-Option Segmented Tab */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                I want to join as:
              </label>
              <div className="grid grid-cols-2 p-1 bg-secondary/40 rounded-xs border border-border gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserType("student");
                    setValue("userType", "student", { shouldValidate: true });
                  }}
                  className={`h-9 px-3 rounded-xs text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedUserType === "student"
                      ? "bg-card text-primary font-semibold shadow-2xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-primary" />
                  <span>Student / Tenant</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUserType("owner");
                    setValue("userType", "owner", { shouldValidate: true });
                  }}
                  className={`h-9 px-3 rounded-xs text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    selectedUserType === "owner"
                      ? "bg-card text-primary font-semibold shadow-2xs border border-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building className="w-4 h-4 text-primary" />
                  <span>Property Owner</span>
                </button>
              </div>
            </div>

            {/* 2-Column Responsive: Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="fullName"
                  className="text-xs font-semibold text-foreground block"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Rayhan Ahmed"
                    {...register("fullName")}
                    className={`w-full h-10 pl-9 pr-3 text-xs rounded-xs border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 transition-colors ${
                      errors.fullName
                        ? "border-destructive focus:ring-destructive"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email Address */}
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
            </div>

            {/* 2-Column Responsive: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-foreground block"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`w-full h-10 pl-9 pr-9 text-xs rounded-xs border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 transition-colors ${
                      errors.password
                        ? "border-destructive focus:ring-destructive"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-foreground block"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className={`w-full h-10 pl-9 pr-9 text-xs rounded-xs border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 transition-colors ${
                      errors.confirmPassword
                        ? "border-destructive focus:ring-destructive"
                        : "border-border focus:border-primary focus:ring-primary/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and conditions using reusable AppCheckbox */}
            <div className="space-y-1 pt-1">
              <Controller
                name="acceptTerms"
                control={control}
                render={({ field }) => (
                  <AppCheckbox
                    id="acceptTerms"
                    checked={field.value === true}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      setValue("acceptTerms", checked, { shouldValidate: true });
                    }}
                    label={
                      <span className="text-[11px] text-muted-foreground leading-tight font-normal">
                        I agree to the{" "}
                        <span className="text-primary hover:underline font-medium">
                          Terms of Service
                        </span>{" "}
                        and{" "}
                        <span className="text-primary hover:underline font-medium">
                          Privacy Policy
                        </span>
                      </span>
                    }
                  />
                )}
              />
              {errors.acceptTerms && (
                <p className="text-[11px] text-destructive">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingForm}
              className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <span>
                {isSubmittingForm ? "Creating Account..." : "Create Account"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer link to Login */}
          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              Sign In
            </Link>
          </p>

          {/* Security note */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Direct owner connect • Verified student community</span>
          </div>
        </div>
      </div>
    </div>
  );
}
