"use client";

import HeaderTitle from "@/components/shared/HeaderTitle";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import CancelSubmitButton from "@/components/shared/CancelSubmitButton";
import PassViewToggleBtn from "@/components/shared/PassViewToggleBtn";
import PasswordStrengthMeter from "./PasswordStrengthMeter";
import { PasswordSchema, passwordSchema } from "./schema";
import { useChangePasswordMutation } from "@/redux/api/auth/authApi";
import { toast } from "sonner";

const PasswordForm = () => {
  const [changePassword, { isLoading: isUpdating }] = useChangePasswordMutation();
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
  });

  const passwordForm = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: PasswordSchema) => {
    try {
      const res = await changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success(res.message || "Password changed successfully!");
      passwordForm.reset();
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to change password.");
    }
  };

  /* ================= CANCEL ================= */
  const handleCancel = () => {
    passwordForm.reset();
  };

  /* ================= WATCH ================= */
  const newPasswordValue = useWatch({
    control: passwordForm.control,
    name: "newPassword",
  });

  return (
    <div className="space-y-6">
      <form onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <HeaderTitle
            title="Change Password"
            alignment="left"
            titleColor="white"
            titleSize="sm"
            titleClassName="font-normal"
          />
          <div className="w-full md:w-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* ================= OLD PASSWORD ================= */}
              <div className="relative">
                <label
                  htmlFor="oldPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  Old Password
                </label>

                <input
                  {...passwordForm.register("oldPassword")}
                  id="oldPassword"
                  type={showPassword.oldPassword ? "text" : "password"}
                  placeholder="********"
                  className="mt-1 w-full rounded-md border  px-4 py-3 pr-10 text-foreground outline-none"
                />

                {passwordForm.formState.errors.oldPassword && (
                  <p className="mt-1 text-xs text-destructive">
                    {passwordForm.formState.errors.oldPassword.message}
                  </p>
                )}

                <PassViewToggleBtn
                  field="oldPassword"
                  showPassword={showPassword.oldPassword}
                  setShowPassword={setShowPassword}
                />
              </div>

              {/* ================= NEW PASSWORD ================= */}
              <div className="relative">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-foreground"
                >
                  New Password
                </label>

                <input
                  {...passwordForm.register("newPassword")}
                  id="newPassword"
                  type={showPassword.newPassword ? "text" : "password"}
                  placeholder="********"
                  className="mt-1 w-full rounded-md border  px-4 py-3 pr-10 text-foreground outline-none"
                />

                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}

                <PassViewToggleBtn
                  field="newPassword"
                  showPassword={showPassword.newPassword}
                  setShowPassword={setShowPassword}
                />
              </div>
            </div>

            {/* ================= STRENGTH METER ================= */}
            <div className="pt-2 max-w-48 mx-auto md:ml-auto md:mr-0">
              <PasswordStrengthMeter password={newPasswordValue ?? ""} />
            </div>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <CancelSubmitButton 
          handleCancel={handleCancel} 
          isLoading={isUpdating} 
          disabled={isUpdating} 
        />
      </form>
    </div>
  );
};

export default PasswordForm;
