export type TStage = "round30" | "round16" | "round08" | "round04" | "final";

export type TRegion =
  | "north"
  | "south"
  | "east"
  | "west"
  | "mountain"
  | "pacific"
  | "midwest"
  | "northwest";

export const STAGE_TABS: { key: TStage; label: string }[] = [
  { key: "round30", label: "ROUND OF 30" },
  { key: "round16", label: "PLAYOFF / ROUND OF 16" },
  { key: "round08", label: "PLAYOFF / ROUND OF 08" },
  { key: "round04", label: "PLAYOFF / ROUND OF 04" },
  { key: "final", label: "GOFL CHAMPIONSHIP 👑" },
];

export const REGIONS: { key: TRegion; label: string }[] = [
  { key: "north", label: "North" },
  { key: "south", label: "South" },
  { key: "east", label: "East" },
  { key: "west", label: "West" },
  { key: "mountain", label: "Mountain" },
  { key: "pacific", label: "Pacific" },
  { key: "midwest", label: "Midwest" },
  { key: "northwest", label: "Northwest" },
];
