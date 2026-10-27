"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useAppDispatch } from "@/redux/hook";
import { setTokens, setUser } from "@/redux/features/user/authSlice";
import { IAllStatusEnum, IRole } from "@/types/global";
import { AuthSidePanel } from "@/components/auth/AuthSidePanel";
import { AppCheckbox } from "@/components/shared/AppCheckbox";
import Cookies from "js-cookie";

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

function LoginFormContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmittingForm(true);
    clearErrors();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const { user: authUser, accessToken } = result.data;

        let userRole: IRole = IRole.STUDENT;
        let dashboardPath = "/dashboard/student";

        if (
          authUser.role === "ADMIN" ||
          authUser.role === "SUPER_ADMIN" ||
          authUser.role === "STAFF"
        ) {
          userRole = IRole.ADMIN;
          dashboardPath = "/dashboard/admin";
        } else if (authUser.role === "OWNER") {
          userRole = IRole.OWNER;
          dashboardPath = "/dashboard/owner";
        }

        dispatch(
          setUser({
            id: authUser._id || authUser.id,
            email: authUser.email,
            firstName: authUser.fullName?.split(" ")[0] || "User",
            lastName: authUser.fullName?.split(" ").slice(1).join(" ") || "",
            phone: authUser.phone || "+880 1700-000000",
            location: authUser.location || "Dhaka, Bangladesh",
            profilePictureUrl: authUser.avatar || null,
            role: userRole,
            status: IAllStatusEnum.ACTIVE,
            twoFactor: false,
            createdAt: String(authUser.createdAt || new Date().toISOString()),
            updatedAt: String(authUser.updatedAt || new Date().toISOString()),
          })
        );

        dispatch(setTokens({ accessToken }));
        Cookies.set("userRole", userRole.toString());

        toast.success(`Welcome back, ${authUser.fullName}!`);

        const destination =
          redirectTarget &&
          redirectTarget !== "/" &&
          redirectTarget !== "/login" &&
          redirectTarget !== "/register" &&
          redirectTarget !== "/dashboard"
            ? redirectTarget
            : dashboardPath;

        // Perform authoritative full browser navigation to ensure cookies are sent to server components
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = destination;
        return;
      }

      setError("password", {
        message: result.error || "Invalid email or password.",
      });
      toast.error(result.error || "Invalid email or password.");
    } catch {
      toast.error("Connection failed. Please check your internet connection.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Direct browser navigation required for external OAuth redirect flow
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/api/auth/google";
  };

  return (
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
          Welcome Back
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Sign in to manage bookings, saved rooms, and visit requests
        </p>
      </div>

      {/* Google Sign-in */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmittingForm}
        className="w-full h-10 inline-flex items-center justify-center gap-2.5 px-4 rounded-xs border border-border bg-card hover:bg-secondary/40 text-foreground text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div className="relative my-3" aria-hidden="true">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-[11px] font-medium tracking-wider text-muted-foreground whitespace-nowrap select-none">
            Or sign in with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Email Field */}
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

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-foreground"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full h-10 pl-9 pr-10 text-xs rounded-xs border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 transition-colors ${
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

        {/* Remember Me */}
        <div className="pt-0.5">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <AppCheckbox
                id="rememberMe"
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                label={
                  <span className="text-xs text-muted-foreground font-normal">
                    Remember me on this browser
                  </span>
                }
              />
            )}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmittingForm}
          className="w-full h-10 inline-flex items-center justify-center gap-2 px-5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
        >
          <span>{isSubmittingForm ? "Signing In..." : "Sign In"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Footer link to Register */}
      <p className="text-center text-xs text-muted-foreground pt-1">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          Create an Account
        </Link>
      </p>

      {/* Security note */}
      <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
        <span>256-bit encrypted session • Zero broker fees</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Brand Hero Panel (Desktop) */}
      <AuthSidePanel
        heading="Find verified student accommodations in Dhaka & Bogura"
        subheading="Join thousands of students and verified property owners on SmartRent BD. Direct visits, clear house rules, zero broker fees."
      />

      {/* Right Column: Clean, Compact Auth Form */}
      <div className="col-span-1 lg:col-span-7 xl:col-span-7 flex flex-col justify-center items-center px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
        <Suspense fallback={<div className="text-xs text-muted-foreground">Loading sign in...</div>}>
          <LoginFormContent />
        </Suspense>
      </div>
    </div>
  );
}
