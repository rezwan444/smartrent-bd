import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d+)?$/, "Must be a valid number"),
  currency: z.string(),
  benefits: z.array(z.object({
    key: z.string(),
    value: z.string().min(1, "Benefit cannot be empty"),
  })),
});

// export const freeTrialSchema = z.object({
//   days: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
// });

export type PlanForm = z.infer<typeof planSchema>;
// export type FreeTrialForm = z.infer<typeof freeTrialSchema>;

// export type PlanType = "monthly" | "yearly";
export type PlanType = "elite" | "premium" | "standard" | "viewers";

export const defaultPlanValues: PlanForm = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
  benefits: [
    { key: "benefit1", value: "" },
    { key: "benefit2", value: "" },
    { key: "benefit3", value: "" },
    { key: "benefit4", value: "" },
    { key: "benefit5", value: "" },
    { key: "benefit6", value: "" },
  ],
};
