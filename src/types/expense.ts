export type ExpenseCategory =
  | "rent"
  | "electricity"
  | "gas"
  | "water"
  | "internet"
  | "maid"
  | "waste"
  | "other";

export type SplitMethod = "equal" | "room_weighted" | "custom";

export interface FlatMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  roomName: string;
  roomSizeSqFt: number;
  rentWeightPercent: number; // e.g., 32 for 32%
  isCurrentUser: boolean;
  isFlatManager?: boolean; // Responsible for Landlord Rent & Utility Bills
  isMessManager?: boolean; // Responsible for Grocery Bazaar & Mess Meal Account
}

export interface SharedExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidByMemberId: string;
  date: string;
  splitMethod: SplitMethod;
  applicableMemberIds: string[];
  notes?: string;
  customShares?: Record<string, number>; // memberId -> exact amount or ratio
}

export interface BazaarEntry {
  id: string;
  date: string;
  description: string;
  marketName: string;
  amount: number;
  paidByMemberId: string;
  items?: string[];
}

export interface DailyMealRecord {
  id: string;
  date: string;
  memberMeals: Record<string, number>; // memberId -> number of meals (e.g. 2, 2.5)
  notes?: string;
}

export interface MemberFinancialSummary {
  memberId: string;
  name: string;
  avatar: string;
  roomName: string;
  // Rent & Utilities Account (Independent)
  fixedPaid: number; // Total money paid towards rent & utilities
  fixedShare: number; // Fair share of rent + utilities
  fixedBalance: number; // fixedPaid - fixedShare (positive = overpaid, negative = owes rent)
  // Mess & Food Account (Independent)
  messPaid: number; // Total money paid towards grocery bazaar
  mealCount: number; // Total meals consumed in the mess
  messCost: number; // mealCount * mealRate
  messBalance: number; // messPaid - messCost (positive = overpaid, negative = owes food bill)
  // Combined Totals (For reference only; never cross-cancels settlement obligations)
  totalPaid: number; // fixedPaid + messPaid
  totalDue: number; // fixedShare + messCost
  netBalance: number; // totalPaid - totalDue = fixedBalance + messBalance
}

export interface SettlementTransaction {
  id: string;
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amount: number;
  type: "rent_utility" | "mess_food";
  categoryLabel: string; // e.g. "Rent & Fixed Utilities" vs "Mess Meal Account"
  recipientRole: string; // e.g. "Flat Manager / Payer" vs "Mess Manager / Payer"
  status: "pending" | "settled";
}

export interface HouseholdExpenseData {
  householdName: string;
  address: string;
  month: string; // e.g. "October 2026"
  monthKey: string; // e.g. "2026-10" or "2026-09"
  isArchived?: boolean; // true for closed/past months
  totalMonthlyRent: number;
  members: FlatMember[];
  expenses: SharedExpense[];
  bazaarEntries: BazaarEntry[];
  mealCounts: Record<string, number>; // memberId -> total meals this month
  settledTransactions?: string[]; // IDs of settled transactions
}

export interface MultiMonthStore {
  activeMonthKey: string;
  months: Record<string, HouseholdExpenseData>;
}
