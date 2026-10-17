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
  totalPaid: number; // Total money this member paid out of pocket
  fixedShare: number; // Share of rent + utilities
  mealCount: number; // Total meals consumed in the mess
  messCost: number; // mealCount * mealRate
  totalDue: number; // fixedShare + messCost
  netBalance: number; // totalPaid - totalDue (positive = should receive, negative = owes)
}

export interface SettlementTransaction {
  id: string;
  fromMemberId: string;
  fromName: string;
  toMemberId: string;
  toName: string;
  amount: number;
  status: "pending" | "settled";
}

export interface HouseholdExpenseData {
  householdName: string;
  address: string;
  month: string;
  totalMonthlyRent: number;
  members: FlatMember[];
  expenses: SharedExpense[];
  bazaarEntries: BazaarEntry[];
  mealCounts: Record<string, number>; // memberId -> total meals this month
  settledTransactions?: string[]; // IDs of settled transactions
}
