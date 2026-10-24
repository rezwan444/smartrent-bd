import {
  HouseholdExpenseData,
  SharedExpense,
  BazaarEntry,
  MultiMonthStore,
  FlatMember,
} from "../types/expense";
import {
  DEFAULT_MULTI_MONTH_DATA,
  OCTOBER_2026_DATA,
  SEPTEMBER_2026_DATA,
} from "../data/mockExpenses";

const MULTI_MONTH_STORAGE_KEY = "smartrent_bd_multi_month_expenses_v2";
const LEGACY_STORAGE_KEY = "smartrent_bd_expenses_data";

function sanitizeHouseholdMonth(
  parsed: Record<string, unknown>,
  fallback: HouseholdExpenseData
): HouseholdExpenseData {
  const membersList = Array.isArray(parsed?.members)
    ? (parsed.members as Record<string, unknown>[])
    : (fallback.members as unknown as Record<string, unknown>[]);

  const sanitizedMembers: FlatMember[] = membersList.map((m, idx) => ({
    id: String(m?.id || `member-${idx + 1}`),
    name: String(m?.name || `Member ${idx + 1}`),
    email: String(m?.email || ""),
    phone: String(m?.phone || ""),
    avatar: String(m?.avatar || "/placeholder/avatar1.jpg"),
    roomName: String(m?.roomName || `Room ${idx + 1}`),
    roomSizeSqFt: Number(m?.roomSizeSqFt) || 120,
    rentWeightPercent: Number(m?.rentWeightPercent) || 25,
    isCurrentUser: Boolean(m?.isCurrentUser),
    isFlatManager: Boolean(m?.isFlatManager),
    isMessManager: Boolean(m?.isMessManager),
  }));

  return {
    householdName:
      typeof parsed?.householdName === "string" && parsed.householdName.trim()
        ? parsed.householdName
        : fallback.householdName,
    address:
      typeof parsed?.address === "string" && parsed.address.trim()
        ? parsed.address
        : fallback.address,
    month:
      typeof parsed?.month === "string" && parsed.month.trim()
        ? parsed.month
        : fallback.month,
    monthKey:
      typeof parsed?.monthKey === "string" && parsed.monthKey.trim()
        ? parsed.monthKey
        : fallback.monthKey,
    isArchived: Boolean(parsed?.isArchived ?? fallback.isArchived),
    totalMonthlyRent:
      typeof parsed?.totalMonthlyRent === "number" && parsed.totalMonthlyRent > 0
        ? parsed.totalMonthlyRent
        : fallback.totalMonthlyRent,
    members: sanitizedMembers,
    expenses: Array.isArray(parsed?.expenses)
      ? (parsed.expenses as SharedExpense[]).filter(
          (e) => e && typeof e === "object" && typeof e.title === "string"
        )
      : fallback.expenses,
    bazaarEntries: Array.isArray(parsed?.bazaarEntries)
      ? (parsed.bazaarEntries as BazaarEntry[]).filter(
          (b) => b && typeof b === "object" && typeof b.description === "string"
        )
      : fallback.bazaarEntries,
    mealCounts:
      parsed?.mealCounts && typeof parsed.mealCounts === "object"
        ? (parsed.mealCounts as Record<string, number>)
        : fallback.mealCounts,
    settledTransactions: Array.isArray(parsed?.settledTransactions)
      ? (parsed.settledTransactions as string[]).filter((s) => typeof s === "string")
      : fallback.settledTransactions,
  };
}

/**
 * Loads the full multi-month store from localStorage.
 */
export function loadMultiMonthData(): MultiMonthStore {
  if (typeof window === "undefined") {
    return DEFAULT_MULTI_MONTH_DATA;
  }

  try {
    const raw = localStorage.getItem(MULTI_MONTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.months) {
        const activeMonthKey =
          typeof parsed.activeMonthKey === "string" &&
          parsed.months[parsed.activeMonthKey]
            ? parsed.activeMonthKey
            : "2026-10";

        const sanitizedMonths: Record<string, HouseholdExpenseData> = {};

        Object.entries(parsed.months as Record<string, Record<string, unknown>>).forEach(
          ([key, monthData]) => {
            const fallback =
              key === "2026-09" ? SEPTEMBER_2026_DATA : OCTOBER_2026_DATA;
            sanitizedMonths[key] = sanitizeHouseholdMonth(monthData, fallback);
          }
        );

        if (!sanitizedMonths["2026-10"]) {
          sanitizedMonths["2026-10"] = OCTOBER_2026_DATA;
        }
        if (!sanitizedMonths["2026-09"]) {
          sanitizedMonths["2026-09"] = SEPTEMBER_2026_DATA;
        }

        return {
          activeMonthKey,
          months: sanitizedMonths,
        };
      }
    }

    // Check for legacy single-month stored data to migrate smoothly
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      try {
        const legacyParsed = JSON.parse(legacyRaw);
        if (legacyParsed && typeof legacyParsed === "object") {
          const migratedOct = sanitizeHouseholdMonth(legacyParsed, OCTOBER_2026_DATA);
          const store: MultiMonthStore = {
            activeMonthKey: "2026-10",
            months: {
              "2026-10": migratedOct,
              "2026-09": SEPTEMBER_2026_DATA,
            },
          };
          saveMultiMonthData(store);
          return store;
        }
      } catch (e) {
        console.warn("Could not migrate legacy expense data", e);
      }
    }

    // Default seed
    saveMultiMonthData(DEFAULT_MULTI_MONTH_DATA);
    return DEFAULT_MULTI_MONTH_DATA;
  } catch (err) {
    console.error("Failed to load multi-month expense data", err);
    return DEFAULT_MULTI_MONTH_DATA;
  }
}

/**
 * Saves the multi-month store to localStorage.
 */
export function saveMultiMonthData(store: MultiMonthStore): void {
  if (typeof window === "undefined" || !store) return;
  try {
    localStorage.setItem(MULTI_MONTH_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error("Failed to save multi-month expense data", err);
  }
}

/**
 * Sets the active month key in multi-month storage.
 */
export function setActiveMonthKey(key: string): void {
  const store = loadMultiMonthData();
  if (store.months[key]) {
    store.activeMonthKey = key;
    saveMultiMonthData(store);
  }
}

/**
 * Loads household data for a specific month (defaults to active month).
 */
export function loadHouseholdData(monthKey?: string): HouseholdExpenseData {
  const store = loadMultiMonthData();
  const targetKey = monthKey || store.activeMonthKey;
  return store.months[targetKey] || OCTOBER_2026_DATA;
}

/**
 * Saves household data for a specific month and syncs to store.
 */
export function saveHouseholdData(
  data: HouseholdExpenseData,
  monthKey?: string
): void {
  const store = loadMultiMonthData();
  const targetKey = monthKey || data.monthKey || store.activeMonthKey;
  store.months[targetKey] = data;
  saveMultiMonthData(store);
}

/**
 * Resets all household data back to the default multi-month initial demo state.
 */
export function resetHouseholdData(): HouseholdExpenseData {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(MULTI_MONTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      saveMultiMonthData(DEFAULT_MULTI_MONTH_DATA);
    } catch (err) {
      console.error("Failed to reset household expense data", err);
    }
  }
  return OCTOBER_2026_DATA;
}
