import type { Metadata } from "next";
import { RoommatesClient } from "@/components/roommates/RoommatesClient";

export const metadata: Metadata = {
  title: "Roommate Matching & Lifestyle Compatibility | SmartRent BD",
  description:
    "Find verified student roommates across Dhaka and Bogura with deterministic lifestyle compatibility scoring and privacy-first mutual consent contact sharing.",
};

export default function RoommatesPage() {
  return <RoommatesClient />;
}
