import type {
  FlatMember,
  MemberFinancialSummary,
  SettlementTransaction,
  HouseholdExpenseData,
} from "../types/expense";

/**
 * Calculates financial summaries and independent who-owes-whom settlements for a household.
 * Strictly isolates Rent & Utilities from Mess Meal Accounts so liabilities are never cross-cancelled.
 */
export function calculateHouseholdFinances(data: HouseholdExpenseData): {
  memberSummaries: MemberFinancialSummary[];
  rentSettlements: SettlementTransaction[];
  messSettlements: SettlementTransaction[];
  settlementTransactions: SettlementTransaction[];
  totalExpenses: number;
  totalRentAndBills: number;
  totalBazaar: number;
  totalMeals: number;
  mealRate: number;
} {
  const {
    members = [],
    expenses = [],
    bazaarEntries = [],
    mealCounts = {},
    settledTransactions = [],
  } = data || {};

  if (!members || members.length === 0) {
    return {
      memberSummaries: [],
      rentSettlements: [],
      messSettlements: [],
      settlementTransactions: [],
      totalExpenses: 0,
      totalRentAndBills: 0,
      totalBazaar: 0,
      totalMeals: 0,
      mealRate: 0,
    };
  }

  // 1. Initialize independent tracking structures
  const fixedPaidMap: Record<string, number> = {};
  const fixedShareMap: Record<string, number> = {};
  const messPaidMap: Record<string, number> = {};

  members.forEach((m) => {
    fixedPaidMap[m.id] = 0;
    fixedShareMap[m.id] = 0;
    messPaidMap[m.id] = 0;
  });

  const defaultFlatManagerId =
    members.find((m) => m.isFlatManager)?.id || members[0]?.id;
  const defaultMessManagerId =
    members.find((m) => m.isMessManager)?.id || members[0]?.id;

  // 2. Process Shared Expenses (Rent, Bills, Maid, etc.) - Isolated Rent Account
  let totalRentAndBills = 0;

  expenses.forEach((expense) => {
    const rawAmt = Number(expense?.amount);
    const safeAmount = Number.isFinite(rawAmt) && rawAmt > 0 ? rawAmt : 0;
    if (safeAmount <= 0) return;

    totalRentAndBills += safeAmount;

    // Credit the payer in the Fixed/Rent account
    const payerId =
      expense.paidByMemberId && fixedPaidMap[expense.paidByMemberId] !== undefined
        ? expense.paidByMemberId
        : defaultFlatManagerId;

    if (payerId && fixedPaidMap[payerId] !== undefined) {
      fixedPaidMap[payerId] += safeAmount;
    }

    // Determine who splits this expense
    const targetMemberIds =
      expense.applicableMemberIds && expense.applicableMemberIds.length > 0
        ? expense.applicableMemberIds
        : members.map((m) => m.id);

    const targetMembers = members.filter((m) => targetMemberIds.includes(m.id));
    if (targetMembers.length === 0) {
      const perPerson = safeAmount / members.length;
      members.forEach((m) => {
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + perPerson;
      });
      return;
    }

    if (expense.splitMethod === "room_weighted") {
      const totalWeight = targetMembers.reduce((sum, m) => {
        const w = Number(m.rentWeightPercent);
        return sum + (Number.isFinite(w) && w > 0 ? w : 0);
      }, 0);

      targetMembers.forEach((m) => {
        const w = Number(m.rentWeightPercent);
        const validWeight = Number.isFinite(w) && w > 0 ? w : 0;
        const ratio = totalWeight > 0 ? validWeight / totalWeight : 1 / targetMembers.length;
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + safeAmount * ratio;
      });
    } else if (expense.splitMethod === "custom" && expense.customShares) {
      targetMembers.forEach((m) => {
        const customAmt = Number(expense.customShares?.[m.id]);
        const validCustomAmt = Number.isFinite(customAmt) && customAmt > 0 ? customAmt : 0;
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + validCustomAmt;
      });
    } else {
      // Default: Equal split (1/N)
      const perPerson = safeAmount / targetMembers.length;
      targetMembers.forEach((m) => {
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + perPerson;
      });
    }
  });

  // 3. Process Bazaar / Grocery Shopping - Isolated Mess Account
  let totalBazaar = 0;
  bazaarEntries.forEach((entry) => {
    const rawAmt = Number(entry?.amount);
    const safeAmount = Number.isFinite(rawAmt) && rawAmt > 0 ? rawAmt : 0;
    if (safeAmount <= 0) return;

    totalBazaar += safeAmount;

    const payerId =
      entry.paidByMemberId && messPaidMap[entry.paidByMemberId] !== undefined
        ? entry.paidByMemberId
        : defaultMessManagerId;

    if (payerId && messPaidMap[payerId] !== undefined) {
      messPaidMap[payerId] += safeAmount;
    }
  });

  // 4. Process Mess Meals & Dynamic Meal Rate
  let totalMeals = 0;
  members.forEach((m) => {
    const rawMeals = Number(mealCounts?.[m.id]);
    const meals = Number.isFinite(rawMeals) && rawMeals > 0 ? rawMeals : 0;
    totalMeals += meals;
  });

  const mealRate = totalMeals > 0 ? totalBazaar / totalMeals : 0;

  // 5. Build Member Summaries with strict dual-account independence
  const memberSummaries: MemberFinancialSummary[] = members.map((m) => {
    const rawFixedPaid = fixedPaidMap[m.id] || 0;
    const rawFixedShare = fixedShareMap[m.id] || 0;
    const fixedPaid = Math.round(rawFixedPaid);
    const fixedShare = Math.round(rawFixedShare);
    const fixedBalance = fixedPaid - fixedShare; // Rent balance

    const rawMessPaid = messPaidMap[m.id] || 0;
    const rawMeals = Number(mealCounts?.[m.id]);
    const mealCount = Number.isFinite(rawMeals) && rawMeals > 0 ? rawMeals : 0;
    const rawMessCost = mealCount * mealRate;
    const messPaid = Math.round(rawMessPaid);
    const messCost = Math.round(rawMessCost);
    const messBalance = messPaid - messCost; // Mess balance

    const totalPaid = fixedPaid + messPaid;
    const totalDue = fixedShare + messCost;
    const netBalance = fixedBalance + messBalance; // Combined net position

    return {
      memberId: m.id,
      name: m.name,
      avatar: m.avatar,
      roomName: m.roomName,
      fixedPaid,
      fixedShare,
      fixedBalance,
      messPaid,
      mealCount,
      messCost,
      messBalance,
      totalPaid,
      totalDue,
      netBalance,
    };
  });

  // 6. Calculate SEPARATE settlement plans so liabilities are never cross-offset
  const rentSettlements = calculateSubAccountSettlements(
    memberSummaries.map((s) => ({
      memberId: s.memberId,
      name: s.name,
      balance: s.fixedBalance,
    })),
    "rent_utility",
    "Rent & Fixed Utilities",
    "Flat / Rent Manager (Landlord Payer)",
    settledTransactions
  );

  const messSettlements = calculateSubAccountSettlements(
    memberSummaries.map((s) => ({
      memberId: s.memberId,
      name: s.name,
      balance: s.messBalance,
    })),
    "mess_food",
    "Mess Meal Account",
    "Mess Manager (Grocery Payer)",
    settledTransactions
  );

  const settlementTransactions = [...rentSettlements, ...messSettlements];
  const totalExpenses = totalRentAndBills + totalBazaar;

  return {
    memberSummaries,
    rentSettlements,
    messSettlements,
    settlementTransactions,
    totalExpenses: Math.round(totalExpenses),
    totalRentAndBills: Math.round(totalRentAndBills),
    totalBazaar: Math.round(totalBazaar),
    totalMeals,
    mealRate: Math.round(mealRate * 10) / 10,
  };
}

/**
 * Greedy pairing algorithm for debtor-creditor settlement simplification.
 * Operates independently on a specific sub-account (Rent or Mess).
 */
export function calculateSubAccountSettlements(
  nodes: { memberId: string; name: string; balance: number }[],
  type: "rent_utility" | "mess_food",
  categoryLabel: string,
  recipientRole: string,
  settledIds: string[] = []
): SettlementTransaction[] {
  interface BalanceNode {
    memberId: string;
    name: string;
    balance: number;
  }

  const debtors: BalanceNode[] = [];
  const creditors: BalanceNode[] = [];

  nodes.forEach((s) => {
    if (s.balance < 0) {
      debtors.push({ memberId: s.memberId, name: s.name, balance: s.balance });
    } else if (s.balance > 0) {
      creditors.push({ memberId: s.memberId, name: s.name, balance: s.balance });
    }
  });

  // Sort descending by magnitude
  debtors.sort((a, b) => a.balance - b.balance); // most negative first
  creditors.sort((a, b) => b.balance - a.balance); // most positive first

  const transactions: SettlementTransaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const oweAmount = -debtor.balance;
    const canReceive = creditor.balance;

    const settledAmount = Math.min(oweAmount, canReceive);

    if (settledAmount > 0) {
      const typePrefix = type === "rent_utility" ? "settle-rent" : "settle-mess";
      const txId = `${typePrefix}-${debtor.memberId}-${creditor.memberId}`;
      const legacyTxId = `settle-${debtor.memberId}-${creditor.memberId}`;
      const isSettled = settledIds.includes(txId) || settledIds.includes(legacyTxId);

      transactions.push({
        id: txId,
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amount: Math.round(settledAmount),
        type,
        categoryLabel,
        recipientRole,
        status: isSettled ? "settled" : "pending",
      });

      debtor.balance += settledAmount;
      creditor.balance -= settledAmount;
    }

    if (Math.abs(debtor.balance) < 0.001) {
      dIdx++;
    }
    if (Math.abs(creditor.balance) < 0.001) {
      cIdx++;
    }
  }

  return transactions;
}

/**
 * Backward-compatible helper for combined settlement plan
 */
export function calculateSettlementPlan(
  summaries: MemberFinancialSummary[],
  settledIds: string[] = []
): SettlementTransaction[] {
  const rent = calculateSubAccountSettlements(
    summaries.map((s) => ({
      memberId: s.memberId,
      name: s.name,
      balance: s.fixedBalance !== undefined ? s.fixedBalance : (s.netBalance || 0),
    })),
    "rent_utility",
    "Rent & Fixed Utilities",
    "Flat / Rent Manager",
    settledIds
  );

  const mess = calculateSubAccountSettlements(
    summaries.map((s) => ({
      memberId: s.memberId,
      name: s.name,
      balance: s.messBalance !== undefined ? s.messBalance : 0,
    })),
    "mess_food",
    "Mess Meal Account",
    "Mess Manager",
    settledIds
  );

  return [...rent, ...mess];
}

/**
 * Computes room-size weighted shares vs equal shares for comparison
 */
export function calculateRoomWeightComparison(
  members: FlatMember[],
  totalRent: number
): {
  memberId: string;
  name: string;
  roomName: string;
  roomSizeSqFt: number;
  weightPercent: number;
  weightedRent: number;
  equalRent: number;
  difference: number; // positive = pays more under weighted, negative = pays less
}[] {
  if (!members || members.length === 0) return [];
  const safeRent = Number.isFinite(totalRent) && totalRent > 0 ? totalRent : 0;
  const totalSqFt = members.reduce((sum, m) => {
    const s = Number(m.roomSizeSqFt);
    return sum + (Number.isFinite(s) && s > 0 ? s : 0);
  }, 0);
  const equalRent = safeRent / members.length;

  return members.map((m) => {
    const rawSqFt = Number(m.roomSizeSqFt);
    const sqFt = Number.isFinite(rawSqFt) && rawSqFt > 0 ? rawSqFt : 0;
    const weightPercent = totalSqFt > 0 ? (sqFt / totalSqFt) * 100 : 100 / members.length;
    const weightedRent = (safeRent * weightPercent) / 100;
    const difference = weightedRent - equalRent;

    return {
      memberId: m.id,
      name: m.name,
      roomName: m.roomName,
      roomSizeSqFt: sqFt,
      weightPercent: Math.round(weightPercent * 10) / 10,
      weightedRent: Math.round(weightedRent),
      equalRent: Math.round(equalRent),
      difference: Math.round(difference),
    };
  });
}
