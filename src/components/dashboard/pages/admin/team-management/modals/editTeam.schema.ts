// editTeam.schema.ts
import { z } from "zod";

export const editTeamSchema = z.object({
  cityName: z.string().min(2, "City name is required"),
  mascotName: z.string().min(2, "Mascot name is required"),
  tier: z.string().min(1, "Tier is required"),
  region: z.string().min(1, "Region is required"),
  //   division: z.string().min(2, "Division is required"),
});

export type EditTeamFormValues = z.infer<typeof editTeamSchema>;
