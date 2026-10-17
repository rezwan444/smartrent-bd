import {
  FlatMember,
  MemberFinancialSummary,
  SettlementTransaction,
  HouseholdExpenseData,
} from "@/types/expense";

/**
 * Calculates financial summaries and who-owes-whom settlement for a household.
 */
export function calculateHouseholdFinances(data: HouseholdExpenseData): {
  memberSummaries: MemberFinancialSummary[];
  settlementTransactions: SettlementTransaction[];
  totalExpenses: number;
  totalRentAndBills: number;
  totalBazaar: number;
  totalMeals: number;
  mealRate: number;
} {
  const { members, expenses, bazaarEntries, mealCounts, settledTransactions = [] } = data;

  // 1. Initialize tracking structures
  const paidMap: Record<string, number> = {};
  const fixedShareMap: Record<string, number> = {};

  members.forEach((m) => {
    paidMap[m.id] = 0;
    fixedShareMap[m.id] = 0;
  });

  // 2. Process Shared Expenses (Rent, Bills, Maid, etc.)
  let totalRentAndBills = 0;

  expenses.forEach((expense) => {
    totalRentAndBills += expense.amount;

    // Credit the payer
    if (paidMap[expense.paidByMemberId] !== undefined) {
      paidMap[expense.paidByMemberId] += expense.amount;
    }

    // Determine who splits this expense
    const targetMemberIds =
      expense.applicableMemberIds && expense.applicableMemberIds.length > 0
        ? expense.applicableMemberIds
        : members.map((m) => m.id);

    const targetMembers = members.filter((m) => targetMemberIds.includes(m.id));
    if (targetMembers.length === 0) return;

    if (expense.splitMethod === "room_weighted") {
      // Normalize rent weights among participating members
      const totalWeight = targetMembers.reduce(
        (sum, m) => sum + (m.rentWeightPercent || 0),
        0
      );

      targetMembers.forEach((m) => {
        const ratio = totalWeight > 0 ? (m.rentWeightPercent || 0) / totalWeight : 1 / targetMembers.length;
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + expense.amount * ratio;
      });
    } else if (expense.splitMethod === "custom" && expense.customShares) {
      targetMembers.forEach((m) => {
        const customAmt = expense.customShares?.[m.id] || 0;
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + customAmt;
      });
    } else {
      // Default: Equal split
      const perPerson = expense.amount / targetMembers.length;
      targetMembers.forEach((m) => {
        fixedShareMap[m.id] = (fixedShareMap[m.id] || 0) + perPerson;
      });
    }
  });

  // 3. Process Bazaar / Grocery Shopping
  let totalBazaar = 0;
  bazaarEntries.forEach((entry) => {
    totalBazaar += entry.amount;
    if (paidMap[entry.paidByMemberId] !== undefined) {
      paidMap[entry.paidByMemberId] += entry.amount;
    }
  });

  // 4. Process Mess Meals & Meal Rate
  let totalMeals = 0;
  members.forEach((m) => {
    const meals = mealCounts[m.id] || 0;
    totalMeals += meals;
  });

  const mealRate = totalMeals > 0 ? totalBazaar / totalMeals : 0;

  // 5. Build Member Summaries
  const memberSummaries: MemberFinancialSummary[] = members.map((m) => {
    const totalPaid = paidMap[m.id] || 0;
    const fixedShare = fixedShareMap[m.id] || 0;
    const mealCount = mealCounts[m.id] || 0;
    const messCost = mealCount * mealRate;
    const totalDue = fixedShare + messCost;
    const netBalance = totalPaid - totalDue;

    return {
      memberId: m.id,
      name: m.name,
      avatar: m.avatar,
      roomName: m.roomName,
      totalPaid: Math.round(totalPaid),
      fixedShare: Math.round(fixedShare),
      mealCount,
      messCost: Math.round(messCost),
      totalDue: Math.round(totalDue),
      netBalance: Math.round(netBalance),
    };
  });

  // 6. Calculate Greedy Simplified Settlement Plan ("Who Owes Whom")
  const settlementTransactions = calculateSettlementPlan(
    memberSummaries,
    settledTransactions
  );

  const totalExpenses = totalRentAndBills + totalBazaar;

  return {
    memberSummaries,
    settlementTransactions,
    totalExpenses: Math.round(totalExpenses),
    totalRentAndBills: Math.round(totalRentAndBills),
    totalBazaar: Math.round(totalBazaar),
    totalMeals,
    mealRate: Math.round(mealRate * 10) / 10, // 1 decimal place e.g. 78.5
  };
}

/**
 * Greedy pairing algorithm for debtor-creditor settlement simplification.
 * Minimizes the number of cash/bKash handoffs required.
 */
export function calculateSettlementPlan(
  summaries: MemberFinancialSummary[],
  settledIds: string[] = []
): SettlementTransaction[] {
  interface BalanceNode {
    memberId: string;
    name: string;
    balance: number;
  }

  // Clones to mutate
  const debtors: BalanceNode[] = [];
  const creditors: BalanceNode[] = [];

  summaries.forEach((s) => {
    if (s.netBalance < -1) {
      debtors.push({ memberId: s.memberId, name: s.name, balance: s.netBalance });
    } else if (s.netBalance > 1) {
      creditors.push({ memberId: s.memberId, name: s.name, balance: s.netBalance });
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
      const txId = `settle-${debtor.memberId}-${creditor.memberId}`;
      const isSettled = settledIds.includes(txId);

      transactions.push({
        id: txId,
        fromMemberId: debtor.memberId,
        fromName: debtor.name,
        toMemberId: creditor.memberId,
        toName: creditor.name,
        amount: Math.round(settledAmount),
        status: isSettled ? "settled" : "pending",
      });

      debtor.balance += settledAmount;
      creditor.balance -= settledAmount;
    }

    if (Math.abs(debtor.balance) < 1) {
      dIdx++;
    }
    if (creditor.balance < 1) {
      cIdx++;
    }
  }

  return transactions;
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
  const totalSqFt = members.reduce((sum, m) => sum + (m.roomSizeSqFt || 0), 0);
  const equalRent = members.length > 0 ? totalRent / members.length : 0;

  return members.map((m) => {
    const weightPercent = totalSqFt > 0 ? ((m.roomSizeSqFt || 0) / totalSqFt) * 100 : 100 / members.length;
    const weightedRent = (totalRent * weightPercent) / 100;
    const difference = weightedRent - equalRent;

    return {
      memberId: m.id,
      name: m.name,
      roomName: m.roomName,
      roomSizeSqFt: m.roomSizeSqFt,
      weightPercent: Math.round(weightPercent * 10) / 10,
      weightedRent: Math.round(weightedRent),
      equalRent: Math.round(equalRent),
      difference: Math.round(difference),
    };
  });
}
