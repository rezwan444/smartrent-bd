import * as z from "zod";

// Profile
export const profileSchema = z.object({
  firstName: z.string().min(3, "First name must be at least 3 characters"),
  lastName: z.string().min(3, "Last name must be at least 3 characters"),
  location: z.string().min(1, "Location is required"),
  phone: z.string().min(1, "Phone is required"),
});

export type ProfileSchema = z.infer<typeof profileSchema>;

// Platform Contact Info
export const platformContactSchema = z.object({
  // location, email, phone number, x profile link, instagram profile link, facebook profile link
  location: z.string().min(1, "Address is required"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  xProfileLink: z.string().min(1, "X Profile link is required"),
  instagramProfileLink: z.string().min(1, "Instagram profile link is required"),
  facebookProfileLink: z.string().min(1, "Facebook profile link is required"),
});

export type PlatformContactSchema = z.infer<typeof platformContactSchema>;

// Password
export const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(1, "New password is required"),
  })
  .refine((pass) => pass.oldPassword !== pass.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export type PasswordSchema = z.infer<typeof passwordSchema>;
