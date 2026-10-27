import { z } from "zod";

export const ownerVerificationSchema = z.object({
  nidNumber: z
    .string()
    .trim()
    .min(10, "National ID number must be at least 10 characters")
    .max(30, "National ID number is too long")
    .regex(/^[0-9\s-]+$/, "NID number must only contain digits, hyphens or spaces"),
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
    .refine(
      (val) => {
        const birth = new Date(val);
        if (isNaN(birth.getTime())) return false;
        const today = new Date();
        if (birth > today) return false;
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        return age >= 18 && age <= 120;
      },
      { message: "Owner must be at least 18 years of age based on NID Date of Birth" }
    ),
  holdingTaxNumber: z
    .string()
    .trim()
    .min(3, "Holding tax assessment number must be at least 3 characters")
    .max(60, "Holding tax number cannot exceed 60 characters"),
  propertyAddress: z
    .string()
    .trim()
    .min(5, "Property ownership address must be at least 5 characters")
    .max(250, "Property address cannot exceed 250 characters"),
  documentUrl: z.string().trim().optional(),
});

export type OwnerVerificationInput = z.infer<typeof ownerVerificationSchema>;
