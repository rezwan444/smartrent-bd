"use client";

import CancelSubmitButton from "@/components/shared/CancelSubmitButton";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { platformContactSchema, PlatformContactSchema } from "./schema";
import {
  useGetSiteInfoQuery,
  useUpdateSiteInfoMutation,
} from "@/redux/api/site-info/siteInfoApi";
import { useEffect } from "react";
import { toast } from "sonner";

const PlatformContactForm = () => {
  const { data: response, isLoading: isFetching } = useGetSiteInfoQuery();
  const [updateSiteInfo, { isLoading: isUpdating }] = useUpdateSiteInfoMutation();

  const platformContactForm = useForm<PlatformContactSchema>({
    resolver: zodResolver(platformContactSchema),
    defaultValues: {
      location: "",
      email: "",
      phone: "",
      xProfileLink: "",
      instagramProfileLink: "",
      facebookProfileLink: "",
    },
  });

  // Populate form when data arrives
  useEffect(() => {
    if (response?.data) {
      platformContactForm.reset({
        location: response.data.location || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        xProfileLink: response.data.xProfileLink || "",
        instagramProfileLink: response.data.instagramProfileLink || "",
        facebookProfileLink: response.data.facebookProfileLink || "",
      });
    }
  }, [response, platformContactForm]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: PlatformContactSchema) => {
    try {
      const res = await updateSiteInfo(data).unwrap();
      toast.success(res.message || "Site info updated successfully!");
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to update site info.");
    }
  };

  /* ================= CANCEL ================= */
  const handleCancel = () => {
    if (response?.data) {
      platformContactForm.reset(response.data);
    } else {
      platformContactForm.reset();
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={platformContactForm.handleSubmit(onSubmit)}>
        <div className="">
          <HeaderTitle
            title="Site Info"
            alignment="left"
            titleColor="white"
            titleSize="sm"
            titleClassName="font-normal"
          />

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 w-full mb-4">
            {/* ================= Location ================= */}
            <div className="flex-1">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-foreground"
              >
                Location
              </label>

              <input
                {...platformContactForm.register("location")}
                id="location"
                type="text"
                placeholder="Location"
                className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
              />

              {platformContactForm.formState.errors.location && (
                <p className="mt-1 text-xs text-destructive">
                  {platformContactForm.formState.errors.location.message}
                </p>
              )}
            </div>

            {/* ================= EMAIL ================= */}
            <div className="flex-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>

              <input
                {...platformContactForm.register("email")}
                id="email"
                type="email"
                placeholder="support@example.com"
                className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
              />

              {platformContactForm.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {platformContactForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* ================= PHONE NUMBER ================= */}
            <div className="flex-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-foreground"
              >
                Phone Number
              </label>

              <input
                {...platformContactForm.register("phone")}
                id="phone"
                type="tel"
                placeholder="123-456-7890"
                className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
              />

              {platformContactForm.formState.errors.phone && (
                <p className="mt-1 text-xs text-destructive">
                  {platformContactForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* ================= X Profile Link ================= */}
            <div>
              <label
                htmlFor="xProfileLink"
                className="block text-sm font-medium text-foreground"
              >
                X Profile Link
              </label>

              <input
                {...platformContactForm.register("xProfileLink")}
                id="xProfileLink"
                type="url"
                placeholder="https://x.com/username"
                className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
              />

              {platformContactForm.formState.errors.xProfileLink && (
                <p className="mt-1 text-xs text-destructive">
                  {platformContactForm.formState.errors.xProfileLink.message}
                </p>
              )}
            </div>

            {/* ================= Instagram Profile Link ================= */}
            <div>
              <label
                htmlFor="instagramProfileLink"
                className="block text-sm font-medium text-foreground"
              >
                Instagram Profile Link
              </label>

              <input
                {...platformContactForm.register("instagramProfileLink")}
                id="instagramProfileLink"
                type="url"
                placeholder="https://instagram.com/username"
                className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
              />

              {platformContactForm.formState.errors.instagramProfileLink && (
                <p className="mt-1 text-xs text-destructive">
                  {
                    platformContactForm.formState.errors.instagramProfileLink
                      .message
                  }
                </p>
              )}
            </div>
            {/* ================= Facebook Profile Link ================= */}
            <div>
              <label
                htmlFor="facebookProfileLink"
                className="block text-sm font-medium text-foreground"
              >
                Facebook Profile Link
              </label>

              <input
                {...platformContactForm.register("facebookProfileLink")}
                id="facebookProfileLink"
                type="url"
                placeholder="https://facebook.com/username"
                className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
              />

              {platformContactForm.formState.errors.facebookProfileLink && (
                <p className="mt-1 text-xs text-destructive">
                  {
                    platformContactForm.formState.errors.facebookProfileLink
                      .message
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <CancelSubmitButton 
          handleCancel={handleCancel} 
          isLoading={isUpdating} 
          disabled={isFetching || isUpdating} 
        />
      </form>
    </div>
  );
};

export default PlatformContactForm;
