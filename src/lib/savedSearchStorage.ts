import { SavedSearchCriteria, MatchedListingAlert } from "@/types/savedSearch";
import {
  INITIAL_SAVED_SEARCHES,
  INITIAL_MATCHED_ALERTS,
} from "@/data/mockSavedSearches";

const SEARCHES_STORAGE_KEY = "smartrent_bd_saved_searches";
const ALERTS_STORAGE_KEY = "smartrent_bd_matched_alerts";

export function loadSavedSearches(): SavedSearchCriteria[] {
  if (typeof window === "undefined") {
    return INITIAL_SAVED_SEARCHES;
  }
  try {
    const raw = localStorage.getItem(SEARCHES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        SEARCHES_STORAGE_KEY,
        JSON.stringify(INITIAL_SAVED_SEARCHES)
      );
      return INITIAL_SAVED_SEARCHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAVED_SEARCHES;
  } catch (e) {
    console.error("Failed to load saved searches", e);
    return INITIAL_SAVED_SEARCHES;
  }
}

export function saveSavedSearches(data: SavedSearchCriteria[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SEARCHES_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save saved searches", e);
  }
}

export function loadMatchedAlerts(): MatchedListingAlert[] {
  if (typeof window === "undefined") {
    return INITIAL_MATCHED_ALERTS;
  }
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(
        ALERTS_STORAGE_KEY,
        JSON.stringify(INITIAL_MATCHED_ALERTS)
      );
      return INITIAL_MATCHED_ALERTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_MATCHED_ALERTS;
  } catch (e) {
    console.error("Failed to load matched alerts", e);
    return INITIAL_MATCHED_ALERTS;
  }
}

export function saveMatchedAlerts(data: MatchedListingAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save matched alerts", e);
  }
}
