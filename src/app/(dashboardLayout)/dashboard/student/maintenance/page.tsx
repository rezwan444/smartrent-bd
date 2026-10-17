import { Metadata } from "next";
import { MaintenanceClient } from "@/components/maintenance/MaintenanceClient";

export const metadata: Metadata = {
  title: "Flat Maintenance & Saved Search Alerts | SmartRent BD",
  description:
    "Submit household repair tickets, track technician progress, and manage automated listing alerts for student accommodations.",
};

export default function StudentMaintenancePage() {
  return <MaintenanceClient />;
}
