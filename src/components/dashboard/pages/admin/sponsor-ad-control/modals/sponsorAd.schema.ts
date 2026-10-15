import { z } from "zod";

export const sponsorAdSchema = z.object({
  sponsorName: z.string().min(1, "Sponsor name is required"),

  startDate: z.string().min(1, "Start date is required"),

  endDate: z.string().min(1, "End date is required"),

  adType: z
    .string()
    .optional()
    .refine((val) => typeof val === "string" && val.length > 0, {
      message: "Ad type is required",
    }),

  duration: z
    .number({ message: "Duration is required" })
    .min(1, "Duration must be at least 1 second"),

  revenueShare: z
    .number({ message: "Revenue share is required" })
    .min(0, "Revenue share must be non-negative"),

  totalRevenue: z
    .number({ message: "Total revenue is required" })
    .min(0, "Total revenue must be non-negative"),

  adUrl: z.string().url("Must be a valid URL").min(1, "Ad URL is required"),
});

export type SponsorAdFormValues = z.infer<typeof sponsorAdSchema>;
