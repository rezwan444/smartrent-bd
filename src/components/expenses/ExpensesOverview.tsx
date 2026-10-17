"use client";

import React from "react";
import Image from "next/image";
import {
  MemberFinancialSummary,
  SettlementTransaction,
  FlatMember,
} from "@/types/expense";
import {
  DollarSign,
  Utensils,
  ArrowRight,
  CheckCircle2,
  Users,
  Wallet,
  ShieldAlert,
  Check,
} from "lucide-react";

interface ExpensesOverviewProps {
  householdName: string;
  address: string;
  month: string;
  totalExpenses: number;
  totalRentAndBills: number;
  totalBazaar: number;
  totalMeals: number;
  mealRate: number;
  memberSummaries: MemberFinancialSummary[];
  settlementTransactions: SettlementTransaction[];
  members: FlatMember[];
  onToggleSettlement: (transactionId: string) => void;
  onOpenAddExpense: () => void;
  onOpenAddBazaar: () => void;
}

export function ExpensesOverview({
  householdName,
  address,
  month,
  totalExpenses,
  totalRentAndBills,
  totalBazaar,
  totalMeals,
  mealRate,
  memberSummaries,
  settlementTransactions,
  members,
  onToggleSettlement,
  onOpenAddExpense,
  onOpenAddBazaar,
}: ExpensesOverviewProps) {
  const currentMember = members.find((m) => m.isCurrentUser) || members[0];
  const currentSummary = memberSummaries.find(
    (s) => s.memberId === currentMember?.id
  );

  const currentUserNet = currentSummary?.netBalance || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xs p-3.5 flex items-start sm:items-center gap-3 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <strong className="font-semibold">Simulated Demo Data:</strong> All flat members, room sizes, and financial balances shown below are strictly fictional for testing student mess and rental expense workflows. No real bank accounts or bKash transfers are executed.
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total {month} Expenses
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-foreground">
              ৳ {totalExpenses.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span>Rent & Bills: ৳ {totalRentAndBills.toLocaleString()}</span>
              <span>•</span>
              <span>Bazaar: ৳ {totalBazaar.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Mess Meal Rate */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Dynamic Meal Rate
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-primary">
              ৳ {mealRate.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ meal</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ৳ {totalBazaar.toLocaleString()} bazaar ÷ {totalMeals} meals consumed
            </p>
          </div>
        </div>

        {/* Your Personal Net Position */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Your Position ({currentMember?.name})
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold font-heading ${
                currentUserNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {currentUserNet >= 0 ? `+ ৳ ${currentUserNet.toLocaleString()}` : `- ৳ ${Math.abs(currentUserNet).toLocaleString()}`}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {currentUserNet >= 0
                ? "You are owed money by roommates"
                : "You owe money to flat manager / roommates"}
            </p>
          </div>
        </div>

        {/* Household Overview */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Flat Roommates
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-foreground">
              {members.length} Members
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={`${householdName} • ${address}`}>
              {householdName} • {address}
            </p>
          </div>
        </div>
      </div>

      {/* "Who Owes Whom" Settlement Plan */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">
                Who Owes Whom — Simplified Settlement Plan
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Greedy bilateral balance algorithm minimizes transactions to settle all flat accounts.
            </p>
          </div>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-xs bg-secondary text-primary border border-primary/20 shrink-0 self-start sm:self-auto">
            {settlementTransactions.filter((t) => t.status === "settled").length} of {settlementTransactions.length} Settled
          </span>
        </div>

        {settlementTransactions.length === 0 ? (
          <div className="p-8 text-center bg-background border border-dashed border-border rounded-xs space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-foreground">All Accounts Fully Balanced!</h3>
            <p className="text-xs text-muted-foreground">
              Every roommate has paid exactly their fair share. No pending settlements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {settlementTransactions.map((tx) => {
              const isSettled = tx.status === "settled";
              return (
                <div
                  key={tx.id}
                  className={`border rounded-xs p-3.5 transition-all flex flex-col justify-between gap-3 ${
                    isSettled
                      ? "bg-muted/30 border-border/60 opacity-75"
                      : "bg-background border-border shadow-2xs hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                      <span className={isSettled ? "line-through text-muted-foreground" : "text-foreground"}>
                        {tx.fromName}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className={isSettled ? "line-through text-muted-foreground" : "text-foreground"}>
                        {tx.toName}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-xs ${
                        isSettled
                          ? "bg-muted text-muted-foreground line-through"
                          : "bg-secondary text-primary"
                      }`}
                    >
                      ৳ {tx.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">
                      {isSettled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3" /> Marked as Received
                        </span>
                      ) : (
                        "Pending cash / bKash handoff"
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSettlement(tx.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors ${
                        isSettled
                          ? "text-muted-foreground hover:text-foreground bg-secondary/50"
                          : "text-primary hover:text-primary-foreground hover:bg-primary bg-secondary border border-primary/20"
                      }`}
                    >
                      {isSettled ? "Undo" : "Mark Received"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Financial Balance Sheet Table */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-foreground font-heading">
              Roommate Balance Sheet ({month})
            </h2>
            <p className="text-xs text-muted-foreground">
              Individual breakdown of out-of-pocket expenses vs fixed rent/bills & mess meal shares.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
            >
              + Add Bill/Rent
            </button>
            <button
              type="button"
              onClick={onOpenAddBazaar}
              className="px-3 py-1.5 text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors"
            >
              + Log Bazaar
            </button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Roommate</th>
                <th className="py-2.5 px-3">Room & Weight</th>
                <th className="py-2.5 px-3 text-right">Total Paid</th>
                <th className="py-2.5 px-3 text-right">Fixed Share</th>
                <th className="py-2.5 px-3 text-right">Meals (Cost)</th>
                <th className="py-2.5 px-3 text-right">Total Due</th>
                <th className="py-2.5 px-3 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {memberSummaries.map((summary) => {
                const member = members.find((m) => m.id === summary.memberId);
                const isNetPositive = summary.netBalance >= 0;

                return (
                  <tr key={summary.memberId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                          <Image
                            src={summary.avatar}
                            alt={summary.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            <span>{summary.name}</span>
                            {member?.isCurrentUser && (
                              <span className="text-[10px] px-1 py-0.2 rounded-xs bg-secondary text-primary font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{member?.phone}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-foreground">{summary.roomName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {member?.roomSizeSqFt} sq ft ({member?.rentWeightPercent}%)
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      ৳ {summary.totalPaid.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-muted-foreground">
                      ৳ {summary.fixedShare.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-medium text-foreground">{summary.mealCount} meals</span>
                      <div className="text-[11px] text-muted-foreground">
                        (৳ {summary.messCost.toLocaleString()})
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-semibold text-foreground">
                      ৳ {summary.totalDue.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold ${
                          isNetPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {isNetPositive ? `+ ৳ ${summary.netBalance.toLocaleString()}` : `- ৳ ${Math.abs(summary.netBalance).toLocaleString()}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-3">
          {memberSummaries.map((summary) => {
            const member = members.find((m) => m.id === summary.memberId);
            const isNetPositive = summary.netBalance >= 0;

            return (
              <div
                key={summary.memberId}
                className="border border-border rounded-xs p-3.5 bg-background space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-border shrink-0">
                      <Image
                        src={summary.avatar}
                        alt={summary.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span>{summary.name}</span>
                        {member?.isCurrentUser && (
                          <span className="text-[9px] px-1 py-0.2 rounded-xs bg-secondary text-primary font-bold">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{summary.roomName}</div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-xs ${
                      isNetPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {isNetPositive ? `+ ৳ ${summary.netBalance.toLocaleString()}` : `- ৳ ${Math.abs(summary.netBalance).toLocaleString()}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/40">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Paid Out of Pocket:</span>
                    <strong className="text-foreground">৳ {summary.totalPaid.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Total Due:</span>
                    <strong className="text-foreground">৳ {summary.totalDue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Fixed Share:</span>
                    <span className="text-foreground">৳ {summary.fixedShare.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Mess Cost ({summary.mealCount} meals):</span>
                    <span className="text-foreground">৳ {summary.messCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
