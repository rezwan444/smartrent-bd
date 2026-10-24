import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateHouseholdFinances,
  calculateSettlementPlan,
  calculateRoomWeightComparison,
} from "./expenseSettlement.ts";
import type { HouseholdExpenseData, FlatMember } from "../types/expense";

const MOCK_MEMBERS: FlatMember[] = [
  {
    id: "m-01",
    name: "Tanvir Hasan",
    email: "tanvir@du.ac.bd",
    phone: "+880 1711-223344",
    avatar: "/placeholder/avatar1.jpg",
    roomName: "Master Bedroom 1",
    roomSizeSqFt: 180,
    rentWeightPercent: 35,
    isCurrentUser: true,
  },
  {
    id: "m-02",
    name: "Rafiqul Islam",
    email: "rafiqul@buet.ac.bd",
    phone: "+880 1819-334455",
    avatar: "/placeholder/avatar2.jpg",
    roomName: "Balcony Room 2",
    roomSizeSqFt: 140,
    rentWeightPercent: 27,
    isCurrentUser: false,
  },
  {
    id: "m-03",
    name: "Sohanur Rahman",
    email: "sohan@du.ac.bd",
    phone: "+880 1912-445566",
    avatar: "/placeholder/avatar1.jpg",
    roomName: "Medium Room 3",
    roomSizeSqFt: 110,
    rentWeightPercent: 21,
    isCurrentUser: false,
  },
  {
    id: "m-04",
    name: "Mahmudul Hasan",
    email: "mahmudul@pub.ac.bd",
    phone: "+880 1623-556677",
    avatar: "/placeholder/avatar2.jpg",
    roomName: "Single Room 4",
    roomSizeSqFt: 90,
    rentWeightPercent: 17,
    isCurrentUser: false,
  },
];

describe("Expense Manager Settlement Logic", () => {
  it("calculates equal split correctly for 4 members", () => {
    const data: HouseholdExpenseData = {
      householdName: "Demo Flat",
      address: "Dhaka",
      month: "October 2026",
      totalMonthlyRent: 24000,
      members: MOCK_MEMBERS,
      expenses: [
        {
          id: "exp-01",
          title: "Flat Rent",
          category: "rent",
          amount: 24000,
          paidByMemberId: "m-01", // Tanvir paid entire 24000
          date: "2026-10-01",
          splitMethod: "equal",
          applicableMemberIds: ["m-01", "m-02", "m-03", "m-04"],
        },
      ],
      bazaarEntries: [],
      mealCounts: { "m-01": 0, "m-02": 0, "m-03": 0, "m-04": 0 },
      settledTransactions: [],
    };

    const result = calculateHouseholdFinances(data);

    assert.equal(result.totalExpenses, 24000);
    assert.equal(result.totalRentAndBills, 24000);
    assert.equal(result.totalBazaar, 0);
    assert.equal(result.mealRate, 0);

    // Each member fixedShare should be exactly 24000 / 4 = 6000
    result.memberSummaries.forEach((s) => {
      assert.equal(s.fixedShare, 6000);
      assert.equal(s.totalDue, 6000);
    });

    // Tanvir paid 24000, due 6000 -> netBalance +18000
    const tanvir = result.memberSummaries.find((s) => s.memberId === "m-01");
    assert.equal(tanvir?.totalPaid, 24000);
    assert.equal(tanvir?.netBalance, 18000);

    // Others paid 0, due 6000 -> netBalance -6000
    const rafiq = result.memberSummaries.find((s) => s.memberId === "m-02");
    assert.equal(rafiq?.totalPaid, 0);
    assert.equal(rafiq?.netBalance, -6000);

    // Settlements: each of the 3 owes Tanvir 6000
    assert.equal(result.settlementTransactions.length, 3);
    result.settlementTransactions.forEach((tx) => {
      assert.equal(tx.toMemberId, "m-01");
      assert.equal(tx.amount, 6000);
      assert.equal(tx.status, "pending");
    });
  });

  it("calculates room-size weighted split accurately", () => {
    const data: HouseholdExpenseData = {
      householdName: "Demo Flat",
      address: "Dhaka",
      month: "October 2026",
      totalMonthlyRent: 20000,
      members: MOCK_MEMBERS, // weights: 35, 27, 21, 17 (sum = 100)
      expenses: [
        {
          id: "exp-rent-weighted",
          title: "Base Apartment Rent",
          category: "rent",
          amount: 20000,
          paidByMemberId: "m-01",
          date: "2026-10-01",
          splitMethod: "room_weighted",
          applicableMemberIds: ["m-01", "m-02", "m-03", "m-04"],
        },
      ],
      bazaarEntries: [],
      mealCounts: { "m-01": 0, "m-02": 0, "m-03": 0, "m-04": 0 },
    };

    const result = calculateHouseholdFinances(data);

    const m1 = result.memberSummaries.find((s) => s.memberId === "m-01"); // 35% of 20000 = 7000
    const m2 = result.memberSummaries.find((s) => s.memberId === "m-02"); // 27% of 20000 = 5400
    const m3 = result.memberSummaries.find((s) => s.memberId === "m-03"); // 21% of 20000 = 4200
    const m4 = result.memberSummaries.find((s) => s.memberId === "m-04"); // 17% of 20000 = 3400

    assert.equal(m1?.fixedShare, 7000);
    assert.equal(m2?.fixedShare, 5400);
    assert.equal(m3?.fixedShare, 4200);
    assert.equal(m4?.fixedShare, 3400);

    const totalFixedShares = result.memberSummaries.reduce((sum, s) => sum + s.fixedShare, 0);
    assert.equal(totalFixedShares, 20000);
  });

  it("calculates mess meal rate and individual meal liabilities", () => {
    const data: HouseholdExpenseData = {
      householdName: "Demo Flat",
      address: "Dhaka",
      month: "October 2026",
      totalMonthlyRent: 0,
      members: MOCK_MEMBERS,
      expenses: [],
      bazaarEntries: [
        {
          id: "baz-01",
          date: "2026-10-05",
          description: "Rice, Oil, Chicken",
          marketName: "Nilkhet",
          amount: 6000,
          paidByMemberId: "m-01", // Tanvir paid 6000
        },
        {
          id: "baz-02",
          date: "2026-10-10",
          description: "Vegetables, Spices",
          marketName: "Palashi",
          amount: 4000,
          paidByMemberId: "m-02", // Rafiq paid 4000
        },
      ],
      // Total bazaar = 10,000. Total meals = 100 -> Meal rate = 100 Taka/meal
      mealCounts: {
        "m-01": 30, // 30 * 100 = 3000
        "m-02": 30, // 30 * 100 = 3000
        "m-03": 25, // 25 * 100 = 2500
        "m-04": 15, // 15 * 100 = 1500
      },
    };

    const result = calculateHouseholdFinances(data);

    assert.equal(result.totalBazaar, 10000);
    assert.equal(result.totalMeals, 100);
    assert.equal(result.mealRate, 100);

    const m1 = result.memberSummaries.find((s) => s.memberId === "m-01");
    assert.equal(m1?.messCost, 3000);
    assert.equal(m1?.totalPaid, 6000);
    assert.equal(m1?.netBalance, 3000); // paid 6000, cost 3000 -> +3000

    const m2 = result.memberSummaries.find((s) => s.memberId === "m-02");
    assert.equal(m2?.messCost, 3000);
    assert.equal(m2?.totalPaid, 4000);
    assert.equal(m2?.netBalance, 1000); // paid 4000, cost 3000 -> +1000

    const m3 = result.memberSummaries.find((s) => s.memberId === "m-03");
    assert.equal(m3?.messCost, 2500);
    assert.equal(m3?.totalPaid, 0);
    assert.equal(m3?.netBalance, -2500); // owes 2500

    const m4 = result.memberSummaries.find((s) => s.memberId === "m-04");
    assert.equal(m4?.messCost, 1500);
    assert.equal(m4?.totalPaid, 0);
    assert.equal(m4?.netBalance, -1500); // owes 1500

    // Sum of net balances should always be zero (closed financial system)
    const sumNetBalances = result.memberSummaries.reduce((sum, s) => sum + s.netBalance, 0);
    assert.equal(sumNetBalances, 0);
  });

  it("handles edge cases: zero meals, NaN amounts, negative numbers, and empty lists", () => {
    const corruptedData: HouseholdExpenseData = {
      householdName: "Corrupted Test",
      address: "Bogura",
      month: "October 2026",
      totalMonthlyRent: 15000,
      members: MOCK_MEMBERS,
      expenses: [
        {
          id: "exp-corrupted",
          title: "Bad Amount",
          category: "other",
          amount: -5000, // Negative should be ignored
          paidByMemberId: "m-01",
          date: "2026-10-01",
          splitMethod: "equal",
          applicableMemberIds: ["m-01"],
        },
        {
          id: "exp-nan",
          title: "NaN Amount",
          category: "other",
          amount: NaN, // NaN should be ignored
          paidByMemberId: "m-01",
          date: "2026-10-01",
          splitMethod: "equal",
          applicableMemberIds: ["m-01"],
        },
      ],
      bazaarEntries: [
        {
          id: "baz-bad",
          date: "2026-10-01",
          description: "Bad",
          marketName: "None",
          amount: -100, // Negative ignored
          paidByMemberId: "m-02",
        },
      ],
      mealCounts: { "m-01": 0, "m-02": 0 }, // 0 meals total -> mealRate should be 0 without divide-by-zero
    };

    const result = calculateHouseholdFinances(corruptedData);

    assert.equal(result.totalExpenses, 0);
    assert.equal(result.totalRentAndBills, 0);
    assert.equal(result.totalBazaar, 0);
    assert.equal(result.totalMeals, 0);
    assert.equal(result.mealRate, 0);
    assert.equal(result.settlementTransactions.length, 0);
  });

  it("calculates room weight comparisons correctly", () => {
    const comparison = calculateRoomWeightComparison(MOCK_MEMBERS, 20000);
    assert.equal(comparison.length, 4);

    const totalWeightedRent = comparison.reduce((sum, c) => sum + c.weightedRent, 0);
    assert.equal(Math.abs(totalWeightedRent - 20000) <= 2, true); // within rounding tolerance

    // Equal rent is 20000 / 4 = 5000
    comparison.forEach((c) => {
      assert.equal(c.equalRent, 5000);
      assert.equal(c.difference, c.weightedRent - c.equalRent);
    });
  });

  it("preserves settled status when transaction ID matches settledTransactions", () => {
    const txId = "settle-rent-m-02-m-01";
    const transactions = calculateSettlementPlan(
      [
        {
          memberId: "m-01",
          name: "Tanvir",
          avatar: "",
          roomName: "",
          fixedPaid: 6000,
          fixedShare: 3000,
          fixedBalance: 3000,
          messPaid: 0,
          mealCount: 0,
          messCost: 0,
          messBalance: 0,
          totalPaid: 6000,
          totalDue: 3000,
          netBalance: 3000,
        },
        {
          memberId: "m-02",
          name: "Rafiqul",
          avatar: "",
          roomName: "",
          fixedPaid: 0,
          fixedShare: 3000,
          fixedBalance: -3000,
          messPaid: 0,
          mealCount: 0,
          messCost: 0,
          messBalance: 0,
          totalPaid: 0,
          totalDue: 3000,
          netBalance: -3000,
        },
      ],
      [txId]
    );

    assert.equal(transactions.length, 1);
    assert.equal(transactions[0].id, txId);
    assert.equal(transactions[0].amount, 3000);
    assert.equal(transactions[0].status, "settled");
  });

  it("strictly separates Rent and Mess liabilities without cross-cancelling landlord vs food debts", () => {
    // Scenario:
    // Tanvir (m-01) is Flat Manager and paid 24,000 rent.
    // Rafiqul (m-02) is Mess Manager and paid 8,000 for groceries.
    // Meals: Tanvir consumed 40 meals, Rafiqul consumed 40 meals (total 80 meals).
    // Meal rate: 8000 / 80 = 100/meal.
    // Rent: 24,000 / 2 = 12,000 each.
    // Tanvir in Rent: paid 24,000, share 12,000 -> fixedBalance = +12,000.
    // Rafiqul in Rent: paid 0, share 12,000 -> fixedBalance = -12,000 (Owes Tanvir 12,000).
    // Tanvir in Mess: paid 0, cost 4,000 -> messBalance = -4,000 (Owes Rafiqul 4,000).
    // Rafiqul in Mess: paid 8,000, cost 4,000 -> messBalance = +4,000.
    // Under STRICT DUAL-ACCOUNT SEPARATION:
    // Rent settlement must demand 12,000 from Rafiqul to Tanvir (Flat Manager).
    // Mess settlement must demand 4,000 from Tanvir to Rafiqul (Mess Manager).
    // They must NOT be merged into a single net 8,000 transaction!

    const twoMembers: FlatMember[] = [
      {
        ...MOCK_MEMBERS[0],
        isFlatManager: true,
        isMessManager: false,
      },
      {
        ...MOCK_MEMBERS[1],
        isFlatManager: false,
        isMessManager: true,
      },
    ];

    const data: HouseholdExpenseData = {
      householdName: "Two Person Test",
      address: "Dhaka",
      month: "October 2026",
      totalMonthlyRent: 24000,
      members: twoMembers,
      expenses: [
        {
          id: "exp-rent",
          title: "Apartment Rent",
          category: "rent",
          amount: 24000,
          paidByMemberId: "m-01",
          date: "2026-10-01",
          splitMethod: "equal",
          applicableMemberIds: ["m-01", "m-02"],
        },
      ],
      bazaarEntries: [
        {
          id: "baz-01",
          date: "2026-10-02",
          description: "Grocery",
          marketName: "Nilkhet",
          amount: 8000,
          paidByMemberId: "m-02",
        },
      ],
      mealCounts: {
        "m-01": 40,
        "m-02": 40,
      },
      settledTransactions: [],
    };

    const result = calculateHouseholdFinances(data);

    // 1. Check Independent Balances in summaries
    const tanvir = result.memberSummaries.find((s) => s.memberId === "m-01");
    const rafiq = result.memberSummaries.find((s) => s.memberId === "m-02");

    assert.equal(tanvir?.fixedBalance, 12000); // Tanvir is owed 12,000 for rent
    assert.equal(tanvir?.messBalance, -4000);  // Tanvir owes 4,000 for mess food
    assert.equal(tanvir?.netBalance, 8000);    // Combined net is +8,000

    assert.equal(rafiq?.fixedBalance, -12000); // Rafiq owes 12,000 for rent
    assert.equal(rafiq?.messBalance, 4000);   // Rafiq is owed 4,000 for mess food
    assert.equal(rafiq?.netBalance, -8000);    // Combined net is -8,000

    // 2. Check Independent Settlement Transactions
    assert.equal(result.rentSettlements.length, 1);
    assert.equal(result.rentSettlements[0].fromMemberId, "m-02");
    assert.equal(result.rentSettlements[0].toMemberId, "m-01");
    assert.equal(result.rentSettlements[0].amount, 12000);
    assert.equal(result.rentSettlements[0].type, "rent_utility");

    assert.equal(result.messSettlements.length, 1);
    assert.equal(result.messSettlements[0].fromMemberId, "m-01");
    assert.equal(result.messSettlements[0].toMemberId, "m-02");
    assert.equal(result.messSettlements[0].amount, 4000);
    assert.equal(result.messSettlements[0].type, "mess_food");

    // Both independent transactions must exist in the overall list
    assert.equal(result.settlementTransactions.length, 2);
  });

  it("supports custom resident-level rent allocation accurately", () => {
    const data: HouseholdExpenseData = {
      householdName: "Custom Share Flat",
      address: "Dhaka",
      month: "October 2026",
      totalMonthlyRent: 20000,
      members: MOCK_MEMBERS,
      expenses: [
        {
          id: "exp-custom-seat",
          title: "Custom Room Seat Allocation",
          category: "rent",
          amount: 20000,
          paidByMemberId: "m-01",
          date: "2026-10-01",
          splitMethod: "custom",
          applicableMemberIds: ["m-01", "m-02", "m-03", "m-04"],
          customShares: {
            "m-01": 7500, // Master room with AC
            "m-02": 5500, // Balcony room
            "m-03": 4000, // Medium room
            "m-04": 3000, // Small bed seat
          },
        },
      ],
      bazaarEntries: [],
      mealCounts: { "m-01": 0, "m-02": 0, "m-03": 0, "m-04": 0 },
    };

    const result = calculateHouseholdFinances(data);

    const m1 = result.memberSummaries.find((s) => s.memberId === "m-01");
    const m2 = result.memberSummaries.find((s) => s.memberId === "m-02");
    const m3 = result.memberSummaries.find((s) => s.memberId === "m-03");
    const m4 = result.memberSummaries.find((s) => s.memberId === "m-04");

    assert.equal(m1?.fixedShare, 7500);
    assert.equal(m2?.fixedShare, 5500);
    assert.equal(m3?.fixedShare, 4000);
    assert.equal(m4?.fixedShare, 3000);

    const totalAllocated = result.memberSummaries.reduce((sum, s) => sum + s.fixedShare, 0);
    assert.equal(totalAllocated, 20000);
  });

  it("safely detects non-zero balances to guard member deletion", () => {
    const data: HouseholdExpenseData = {
      householdName: "Safety Test Flat",
      address: "Dhaka",
      month: "October 2026",
      totalMonthlyRent: 10000,
      members: MOCK_MEMBERS.slice(0, 2),
      expenses: [
        {
          id: "exp-01",
          title: "Electricity",
          category: "electricity",
          amount: 2000,
          paidByMemberId: "m-01",
          date: "2026-10-01",
          splitMethod: "equal",
          applicableMemberIds: ["m-01", "m-02"],
        },
      ],
      bazaarEntries: [],
      mealCounts: { "m-01": 0, "m-02": 0 },
    };

    const result = calculateHouseholdFinances(data);
    const m2Summary = result.memberSummaries.find((s) => s.memberId === "m-02");

    // Member 2 owes 1000 Taka
    assert.equal(m2Summary?.fixedBalance, -1000);

    // Guard rule: if fixedBalance !== 0 || messBalance !== 0, deletion must trigger warning
    const hasUnsettledBalance =
      Math.abs(m2Summary?.fixedBalance || 0) > 0 ||
      Math.abs(m2Summary?.messBalance || 0) > 0;

    assert.equal(hasUnsettledBalance, true);
  });
});
