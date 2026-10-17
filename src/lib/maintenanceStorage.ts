import { MaintenanceRequest } from "@/types/maintenance";
import { INITIAL_MAINTENANCE_REQUESTS } from "@/data/mockMaintenance";

const STORAGE_KEY = "smartrent_bd_maintenance_requests";

export function loadMaintenanceRequests(): MaintenanceRequest[] {
  if (typeof window === "undefined") {
    return INITIAL_MAINTENANCE_REQUESTS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(INITIAL_MAINTENANCE_REQUESTS)
      );
      return INITIAL_MAINTENANCE_REQUESTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MAINTENANCE_REQUESTS;
  } catch (e) {
    console.error("Failed to load maintenance requests", e);
    return INITIAL_MAINTENANCE_REQUESTS;
  }
}

export function saveMaintenanceRequests(data: MaintenanceRequest[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save maintenance requests", e);
  }
}

export function resetMaintenanceRequests(): MaintenanceRequest[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(INITIAL_MAINTENANCE_REQUESTS)
      );
    } catch (e) {
      console.error("Failed to reset maintenance requests", e);
    }
  }
  return INITIAL_MAINTENANCE_REQUESTS;
}
