import { HouseholdExpenseData } from "@/types/expense";
import { INITIAL_HOUSEHOLD_DATA } from "@/data/mockExpenses";

const STORAGE_KEY = "smartrent_bd_expenses_data";

/**
 * Loads household data from localStorage if available, or returns initial mock data.
 * Safe for server-side rendering (SSR).
 */
export function loadHouseholdData(): HouseholdExpenseData {
  if (typeof window === "undefined") {
    return INITIAL_HOUSEHOLD_DATA;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HOUSEHOLD_DATA));
      return INITIAL_HOUSEHOLD_DATA;
    }
    const parsed = JSON.parse(raw) as HouseholdExpenseData;
    // Basic sanity check
    if (!parsed.members || !Array.isArray(parsed.expenses)) {
      return INITIAL_HOUSEHOLD_DATA;
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse household expense data from localStorage", err);
    return INITIAL_HOUSEHOLD_DATA;
  }
}

/**
 * Saves household data to localStorage.
 */
export function saveHouseholdData(data: HouseholdExpenseData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save household expense data to localStorage", err);
  }
}

/**
 * Resets household data back to the default initial mock data.
 */
export function resetHouseholdData(): HouseholdExpenseData {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_HOUSEHOLD_DATA));
    } catch (err) {
      console.error("Failed to reset household expense data", err);
    }
  }
  return INITIAL_HOUSEHOLD_DATA;
}
