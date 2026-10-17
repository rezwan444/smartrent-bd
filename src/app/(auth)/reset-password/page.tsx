/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { SiteBrand } from "@/components/shared/SiteBrand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { useResetPasswordMutation } from "@/redux/api/auth/authApi";
import { clearResetPassToken } from "@/redux/features/user/authSlice";
import { selectEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.resetPassToken);
  const [resetPassword, { data, isLoading: isLoadingResetPassword }] =
    useResetPasswordMutation();

  // get stored email for verify otp from redux
  const emailFromStore = useAppSelector(selectEmail);

  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      // Simulate API call

      if (emailFromStore && token) {
        const result = await resetPassword({
          newPassword: data.confirmPassword,
          confirmPassword: data.confirmPassword,
          token: token,
        }).unwrap();
        console.log(result);

        if (result?.success) {
          toast.success(result?.message);
          // Clear form after success
          reset();

          //   remove stored accessToken -> user have to login now
          dispatch(clearResetPassToken());

          // Show success message
          setSuccessMessage("Password reset successfully. Please login again!");
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
          router.push("/reset-success");
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg =
        error?.message || error?.data?.message || "Something went wrong";
      toast.error(errMsg);
      //   toast.error("Password reset failed!");
      //   console.error("Password reset failed:", error);
    }
  };
  //   if email not found in store redirect to login page
  useEffect(() => {
    if (!emailFromStore) return router.replace("/login");
  }, [router, emailFromStore]);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center py-10 sm:items-center">
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

              <h1 className="text-xl font-semibold text-foreground font-heading">
                Reset Password
              </h1>

              <p className="text-sm text-muted-foreground">
                Please enter your new password below.
                <br />
                Make sure it&apos;s strong and secure
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-8 space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm mb-2 text-gray-200">
                    New Password (Min. 8 characters)
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      {...register("newPassword")}
                      className="
                  h-12 pl-10 pr-10
                  border-primary-dark
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
      ease-in-out
                "
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm mb-2 text-gray-200">
                    Confirm New Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      {...register("confirmPassword")}
                      className="
                  h-12 pl-10 pr-10
                  border-primary-dark
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
      ease-in-out
                "
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-5 w-5" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
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
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 rounded-xs bg-primary hover:bg-primary-dark text-primary-foreground font-medium disabled:opacity-60 cursor-pointer"
                  >
                    {isSubmitting ? "Resetting..." : "Confirm"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
