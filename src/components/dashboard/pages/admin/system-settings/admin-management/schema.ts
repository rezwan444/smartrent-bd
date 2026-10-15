import * as z from "zod";

// admin add schema

const adminSchema = z.object({
  adminName: z.string().min(1, "Admin name is required"),
  emailAddress: z.string().email("Please enter a valid email address"),
  customMessage: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default adminSchema;
export type AdminSchemaType = z.infer<typeof adminSchema>;
