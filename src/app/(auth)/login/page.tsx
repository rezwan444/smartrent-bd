"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { SiteBrand } from "@/components/shared/SiteBrand";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { useLoginMutation } from "@/redux/api/auth/authApi";
import { logout, setTokens, setUser } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import type { ILoginPayload } from "@/types/global";

// Schema & Types

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Component

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  //   const [triggerGetMe] = useLazyGetMeQuery();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Log the login data for test
    // console.log("Login attempts", data);
    try {
      const result = await login(data as ILoginPayload).unwrap();
      console.log(result);
      //   const accessToken = result?.data?.accessToken;

      if (!result?.success || !result?.data) {
        // console.error("Unexpected login response:", result);
        toast.error("Something went wrong. Please try again.");
        return;
      }
      const { accessToken, ...rest } = result?.data;

      if (rest?.role !== "SUPER_ADMIN") {
        dispatch(logout());
        toast.error("You are not allowed to access this page.");
        return;
      }

      dispatch(setTokens({ accessToken }));

      //   const profile = await triggerGetMe().unwrap();
      //   console.log(profile);
      // Save user in store
      dispatch(setUser(rest ?? null));

      // Navigate & toast
      toast.success("Login successful");
      router.replace("/dashboard");
    } catch (err) {
      console.log(err);
      toast.error("Login failed!");
    }
  };

  const loading = isSubmitting || isLoginLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="relative rounded-2xl bg-card border border-border shadow-xl">
          {/* Header */}
          <div className="px-8 pt-8 text-center space-y-2">
            <SiteBrand
              logo={WEBSITE_DETAILS.SITE_LOGO}
              name={WEBSITE_DETAILS.SITE_ONLY_NAME}
              description={WEBSITE_DETAILS.SITE_DESCRIPTION}
              className="flex items-center justify-center"
            />

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Admin Login
            </h1>
            <p className="text-sm text-muted-foreground">
              Admin access only. All actions are logged for security.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm mb-2 text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@gofl.com"
                    className="h-12 pl-10 text-foreground  border-primary-dark
      focus:border-destructive
      focus:outline-none
      focus:ring-0
      focus:ring-offset-0
      focus-visible:border-destructive
      focus-visible:outline-none
      focus-visible:ring-0
      focus-visible:ring-offset-0
      transition-colors
      duration-200
      ease-in-out;"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-foreground">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-accent hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 pl-10 pr-10 border-primary-dark
      focus:border-destructive
      focus:outline-none
      focus:ring-0
      focus:ring-offset-0
      focus-visible:border-destructive
      focus-visible:outline-none
      focus-visible:ring-0
      focus-visible:ring-offset-0
      transition-colors
      duration-200
      ease-in-out;"
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground font-medium disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Logging in…
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
