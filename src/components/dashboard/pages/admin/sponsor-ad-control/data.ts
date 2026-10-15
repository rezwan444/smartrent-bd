export type AdStatus = "Active" | "Stopped";
export type AdType = "Banner" | "Video" | "Overlay";
export type PlacementType = "Pre-match" | "Sidebar" | "Bottom Banner";
export type DisplayFrequency =
  | "Every match"
  | "1 in 3 matches"
  | "1 in 5 matches";

export interface ISponsorAd {
  id: string;
  sponsor: string;
  adName: string;
  adType: AdType;
  placement: PlacementType;
  revenueShare: number;
  totalRevenue: number;
  daysRemaining: number;
  duration: number;
  frequency: DisplayFrequency;
  status: AdStatus;
}

export const SPONSOR_ADS: ISponsorAd[] = [
  {
    id: "ad_001",
    sponsor: "GameFuel Energy",
    adName: "GameFuel Launch Campaign",
    adType: "Video",
    placement: "Pre-match",
    revenueShare: 15,
    totalRevenue: 45000,
    daysRemaining: 351,
    duration: 60,
    frequency: "Every match",
    status: "Active",
  },
  {
    id: "ad_002",
    sponsor: "HyperX",
    adName: "HyperX Banner Promo",
    adType: "Banner",
    placement: "Sidebar",
    revenueShare: 12,
    totalRevenue: 18000,
    daysRemaining: 210,
    duration: 30,
    frequency: "1 in 3 matches",
    status: "Active",
  },
  {
    id: "ad_003",
    sponsor: "Razer",
    adName: "Razer Overlay Ad",
    adType: "Overlay",
    placement: "Bottom Banner",
    revenueShare: 10,
    totalRevenue: 9600,
    daysRemaining: 95,
    duration: 15,
    frequency: "1 in 5 matches",
    status: "Stopped",
  },
  {
    id: "ad_004",
    sponsor: "Red Bull Gaming",
    adName: "Red Bull Clutch Moments",
    adType: "Video",
    placement: "Pre-match",
    revenueShare: 18,
    totalRevenue: 72000,
    daysRemaining: 420,
    duration: 90,
    frequency: "Every match",
    status: "Active",
  },
  {
    id: "ad_005",
    sponsor: "Logitech G",
    adName: "Logitech Pro Gear",
    adType: "Banner",
    placement: "Sidebar",
    revenueShare: 14,
    totalRevenue: 25500,
    daysRemaining: 180,
    duration: 45,
    frequency: "1 in 3 matches",
    status: "Active",
  },
  {
    id: "ad_006",
    sponsor: "SteelSeries",
    adName: "SteelSeries Aim Faster",
    adType: "Overlay",
    placement: "Bottom Banner",
    revenueShare: 11,
    totalRevenue: 13200,
    daysRemaining: 120,
    duration: 20,
    frequency: "1 in 5 matches",
    status: "Active",
  },
  {
    id: "ad_007",
    sponsor: "NVIDIA",
    adName: "RTX Performance Boost",
    adType: "Video",
    placement: "Pre-match",
    revenueShare: 20,
    totalRevenue: 98000,
    daysRemaining: 500,
    duration: 120,
    frequency: "Every match",
    status: "Active",
  },
  {
    id: "ad_008",
    sponsor: "Corsair",
    adName: "Corsair RGB Series",
    adType: "Banner",
    placement: "Sidebar",
    revenueShare: 13,
    totalRevenue: 16400,
    daysRemaining: 75,
    duration: 25,
    frequency: "1 in 3 matches",
    status: "Stopped",
  },
  {
    id: "ad_009",
    sponsor: "Intel Gaming",
    adName: "Intel Core Power Play",
    adType: "Video",
    placement: "Pre-match",
    revenueShare: 17,
    totalRevenue: 56000,
    daysRemaining: 300,
    duration: 60,
    frequency: "Every match",
    status: "Active",
  },
  {
    id: "ad_010",
    sponsor: "Secretlab",
    adName: "Secretlab Chair Comfort",
    adType: "Overlay",
    placement: "Bottom Banner",
    revenueShare: 9,
    totalRevenue: 8800,
    daysRemaining: 60,
    duration: 15,
    frequency: "1 in 5 matches",
    status: "Active",
  },
];

import { AdType as GlobalAdType } from "@/types/global";

export const AD_TYPES = Object.values(GlobalAdType);

export const PLACEMENT_TYPES = [
  "Pre-match",
  "Sidebar",
  "Bottom Banner",
] as const;

export const DISPLAY_FREQUENCIES = [
  "Every match",
  "1 in 3 matches",
  "1 in 5 matches",
] as const;
