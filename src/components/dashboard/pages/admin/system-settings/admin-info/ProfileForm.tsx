"use client";

import CancelSubmitButton from "@/components/shared/CancelSubmitButton";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { useGetOwnProfileQuery, useUpdateOwnProfileMutation } from "@/redux/api/user/userApi";
import { setUser } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import { Icons } from "@/utils/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { profileSchema, ProfileSchema } from "./schema";

const ProfileForm = () => {
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const dispatch = useAppDispatch();

  const { data: profileResponse, isLoading: isFetching } = useGetOwnProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateOwnProfileMutation();

  const profile = profileResponse?.data;

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      location: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        location: profile.location || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, profileForm]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: ProfileSchema) => {
    const formData = new FormData();
    // API expects fields individually according to Postman screenshot:
    // profilePicture (File), firstName, lastName, location, phone
    
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("location", data.location);
    formData.append("phone", data.phone);

    if (file) {
      formData.append("profilePicture", file);
    }

    try {
      const res = await updateProfile(formData).unwrap();
      if (res.success && res.data) {
        toast.success("Profile updated successfully!");
        setFile(null); // Reset file selection after successful update
        dispatch(setUser(res.data)); // Update global Redux state
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }, message?: string };
      toast.error(err?.data?.message || err?.message || "Failed to update profile");
    }
  };

  /* ================= CANCEL ================= */
  const handleCancel = () => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        location: profile.location || "",
        phone: profile.phone || "",
      });
      setPreview(profile.profilePictureUrl || "");
    } else {
      profileForm.reset();
      setPreview("");
    }
    setFile(null);
  };

  /* ================= IMAGE ================= */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  return (
    <div className="space-y-6 relative">
      {isFetching && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-2"></div>
        </div>
      )}

      <HeaderTitle
        title="Profile Picture"
        alignment="left"
        titleColor="white"
        titleSize="sm"
        titleClassName="font-normal"
      />

      {/* ================= PROFILE IMAGE ================= */}
      <div className="flex justify-start">
        <div className="relative w-28 h-28">
          <div className="w-full h-full rounded-full overflow-hidden relative">
            <Image
              src={preview || profile?.profilePictureUrl || "/placeholder/avatar2.jpg"}
              alt="Profile"
              fill
              sizes="112px"
              priority
              draggable={false}
              className="object-cover overflow-hidden rounded-full"
            />
          </div>

          <label className="absolute -bottom-1 -right-1 p-2 rounded-full cursor-pointer shadow-lg border-2 bg-card text-foreground z-10 hover:bg-card/80 transition-colors">
            <Icons.IoIosReverseCamera className="w-4 h-4 text-foreground " />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
      {/* ================= FORM ================= */}
      <form onSubmit={profileForm.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="md:flex gap-6 items-center justify-between">
          {/* First Name */}
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground">
              First Name
            </label>
            <input
              {...profileForm.register("firstName")}
              type="text"
              placeholder="John"
              className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
            />
            {profileForm.formState.errors.firstName && (
              <p className="mt-1 text-xs text-destructive">
                {profileForm.formState.errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground">
              Last Name
            </label>
            <input
              {...profileForm.register("lastName")}
              type="text"
              placeholder="Doe"
              className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
            />
            {profileForm.formState.errors.lastName && (
              <p className="mt-1 text-xs text-destructive">
                {profileForm.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Location & Phone */}
        <div className="md:flex gap-6 items-center justify-between">
          {/* Location */}
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground">
              Location
            </label>
            <input
              {...profileForm.register("location")}
              type="text"
              placeholder="New York, USA"
              className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
            />
            {profileForm.formState.errors.location && (
              <p className="mt-1 text-xs text-destructive">
                {profileForm.formState.errors.location.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="w-full">
            <label className="block text-sm font-medium text-foreground">
              Phone
            </label>
            <input
              {...profileForm.register("phone")}
              type="text"
              placeholder="+1234567890"
              className="mt-1 w-full rounded-md border  px-4 py-3 text-foreground outline-none"
            />
            {profileForm.formState.errors.phone && (
              <p className="mt-1 text-xs text-destructive">
                {profileForm.formState.errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2">
           <CancelSubmitButton 
              handleCancel={handleCancel} 
              btn2Text={isUpdating ? "Saving..." : "Save Changes"}
           />
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
