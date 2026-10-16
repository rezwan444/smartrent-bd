/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { SiteBrand } from "@/components/shared/SiteBrand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { useForgotPasswordMutation } from "@/redux/api/auth/authApi";
import { setResetPassToken } from "@/redux/features/user/authSlice";
import { setEmail } from "@/redux/features/verifyAuth/verifyAuth";
import { useAppDispatch } from "@/redux/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [resetPassword, { isLoading: isForgottingAndOTPSending }] =
    useForgotPasswordMutation();

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const result = await resetPassword({ email: data.email }).unwrap();
      //   console.log(result);

      if (result?.success && result?.data?.verificationToken) {
        toast.success(result?.message);
        dispatch(setEmail(data.email));
        dispatch(setResetPassToken(result.data.verificationToken));
        router.replace("/verify-email");
      }
    } catch (error: any) {
      //   console.log(error);
      const errMsg =
        error?.message || error?.data?.message || "Something went wrong";
      toast.error(errMsg);
    }
    // console.log("Login attempt:", data);
    // localStorage.setItem("verify-email", data?.email);
    // Add login logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] px-4">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="rounded-2xl bg-[#3a3a3a] border border-[#2a2a2a] shadow-2xl">
          {/* Header */}
          <div className="px-8 pt-8 text-center space-y-2">
            <SiteBrand
              logo={WEBSITE_DETAILS.SITE_LOGO}
              name={WEBSITE_DETAILS.SITE_ONLY_NAME}
              description={WEBSITE_DETAILS.SITE_DESCRIPTION}
              className="flex items-center justify-center"
            />

            <h1 className="text-xl font-semibold text-white">
              Forgot your <br /> admin password?
            </h1>

            <p className="text-sm text-gray-300">
              Enter your email and we&apos;ll send you a 4-digit code
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm mb-2 text-gray-200">
                  Email
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="admin@smartrentbd.com"
                    {...register("email")}
                    className="h-12 pl-10 border-primary-dark
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
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-11 rounded-lg border border-[#5a5a5a] bg-transparent text-gray-200! hover:bg-[#4a4a4a]"
                >
                  Back
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting || isForgottingAndOTPSending}
                  className="h-11 rounded-lg bg-[#e10613] hover:bg-[#b9050f] text-white font-medium disabled:opacity-60"
                >
                  {isSubmitting || isForgottingAndOTPSending
                    ? "Sending..."
                    : "Send Email"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
