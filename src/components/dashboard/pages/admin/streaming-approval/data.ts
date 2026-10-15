export type StreamingStatus = "Active" | "Suspended";

export interface IStreamingApproval {
  id: string;
  name: string;
  gamertag: string;
  console: "PlayStation" | "Xbox";
  team: "Assigned" | "Unassigned";
  status: StreamingStatus;
}

export const STREAMING_APPROVAL_DATA: IStreamingApproval[] = [
  {
    id: "stream_001",
    name: "Marcus Johnson",
    gamertag: "TitanSlayer99",
    console: "PlayStation",
    team: "Assigned",
    status: "Active",
  },
  {
    id: "stream_002",
    name: "Sarah Chen",
    gamertag: "StormQueen",
    console: "Xbox",
    team: "Assigned",
    status: "Suspended",
  },
  {
    id: "stream_003",
    name: "David Miller",
    gamertag: "IronFistX",
    console: "PlayStation",
    team: "Assigned",
    status: "Active",
  },
  {
    id: "stream_004",
    name: "Emily Rodriguez",
    gamertag: "LunaStrike",
    console: "Xbox",
    team: "Assigned",
    status: "Suspended",
  },
  {
    id: "stream_005",
    name: "Alex Thompson",
    gamertag: "ShadowViper",
    console: "PlayStation",
    team: "Assigned",
    status: "Active",
  },
  {
    id: "stream_006",
    name: "Rachel Kim",
    gamertag: "PixelBlade",
    console: "Xbox",
    team: "Assigned",
    status: "Suspended",
  },
  {
    id: "stream_007",
    name: "Jason Wright",
    gamertag: "NeoRaptor",
    console: "PlayStation",
    team: "Assigned",
    status: "Active",
  },
  {
    id: "stream_008",
    name: "Sophia Patel",
    gamertag: "ZenFire",
    console: "Xbox",
    team: "Assigned",
    status: "Suspended",
  },
  {
    id: "stream_009",
    name: "Daniel Brooks",
    gamertag: "FuryClash",
    console: "PlayStation",
    team: "Assigned",
    status: "Active",
  },
  {
    id: "stream_010",
    name: "Olivia Turner",
    gamertag: "NovaPulse",
    console: "Xbox",
    team: "Assigned",
    status: "Suspended",
  },
  {
    id: "stream_011",
    name: "Marcus Johnson",
    gamertag: "TitanSlayer99",
    console: "PlayStation",
    team: "Assigned",
    status: "Active",
  },
];
