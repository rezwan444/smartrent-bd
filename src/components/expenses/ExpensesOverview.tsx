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
  Download,
  Copy,
  Receipt,
  Crown,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface ExpensesOverviewProps {
  householdName: string;
  address: string;
  month: string;
  isArchived?: boolean;
  totalExpenses: number;
  totalRentAndBills: number;
  totalBazaar: number;
  totalMeals: number;
  mealRate: number;
  memberSummaries: MemberFinancialSummary[];
  rentSettlements: SettlementTransaction[];
  messSettlements: SettlementTransaction[];
  settlementTransactions: SettlementTransaction[];
  members: FlatMember[];
  onToggleSettlement: (transactionId: string) => void;
  onOpenManageFlatmates?: () => void;
}

export function ExpensesOverview({
  householdName,
  address,
  month,
  isArchived = false,
  totalExpenses,
  totalRentAndBills,
  totalBazaar,
  totalMeals,
  mealRate,
  memberSummaries,
  rentSettlements,
  messSettlements,
  members,
  onToggleSettlement,
  onOpenManageFlatmates,
}: ExpensesOverviewProps) {
  const currentMember = members.find((m) => m.isCurrentUser) || members[0];
  const currentSummary = memberSummaries.find(
    (s) => s.memberId === currentMember?.id
  );

  const currentUserNet = currentSummary?.netBalance || 0;
  const currentUserFixed = currentSummary?.fixedBalance || 0;
  const currentUserMess = currentSummary?.messBalance || 0;

  const flatManager = members.find((m) => m.isFlatManager) || members[0];
  const messManager = members.find((m) => m.isMessManager) || members[1] || members[0];

  const handleExportCSV = () => {
    let csv = `SMARTRENT BD - MONTHLY HOUSEHOLD EXPENSE SUMMARY\n`;
    csv += `Household: "${householdName.replace(/"/g, '""')}"\n`;
    csv += `Address: "${address.replace(/"/g, '""')}"\n`;
    csv += `Month: "${month}" (${isArchived ? "Historical Archive" : "Active"})\n\n`;

    csv += `FINANCIAL OVERVIEW\n`;
    csv += `Total Expenses,৳ ${totalExpenses}\n`;
    csv += `Rent & Utility Bills,৳ ${totalRentAndBills}\n`;
    csv += `Total Bazaar / Grocery,৳ ${totalBazaar}\n`;
    csv += `Total Meals Consumed,${totalMeals}\n`;
    csv += `Dynamic Meal Rate,৳ ${mealRate.toFixed(1)} / meal\n\n`;

    csv += `INDEPENDENT ROOMMATE BALANCE SHEET\n`;
    csv += `Name,Room / Seat,Rent Paid (BDT),Rent Share (BDT),Rent Balance (BDT),Mess Paid (BDT),Meals Consumed,Mess Cost (BDT),Mess Balance (BDT),Total Paid (BDT),Total Due (BDT),Net Position (BDT)\n`;
    memberSummaries.forEach((s) => {
      csv += `"${s.name}","${s.roomName}",${s.fixedPaid},${s.fixedShare},${s.fixedBalance},${s.messPaid},${s.mealCount},${s.messCost},${s.messBalance},${s.totalPaid},${s.totalDue},${s.netBalance}\n`;
    });

    csv += `\nRENT & UTILITY BILL SETTLEMENTS (PAYABLE TO FLAT MANAGER: ${flatManager?.name})\n`;
    csv += `From (Debtor),To (Creditor),Amount (BDT),Category,Status\n`;
    if (rentSettlements.length === 0) {
      csv += `None,None,0,"Rent & Utilities","FULLY SETTLED"\n`;
    } else {
      rentSettlements.forEach((tx) => {
        csv += `"${tx.fromName}","${tx.toName}",${tx.amount},"${tx.categoryLabel}","${tx.status.toUpperCase()}"\n`;
      });
    }

    csv += `\nMESS MEAL ACCOUNT SETTLEMENTS (PAYABLE TO MESS MANAGER: ${messManager?.name})\n`;
    csv += `From (Debtor),To (Creditor),Amount (BDT),Category,Status\n`;
    if (messSettlements.length === 0) {
      csv += `None,None,0,"Mess Meals","FULLY SETTLED"\n`;
    } else {
      messSettlements.forEach((tx) => {
        csv += `"${tx.fromName}","${tx.toName}",${tx.amount},"${tx.categoryLabel}","${tx.status.toUpperCase()}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SmartRent_Expenses_${month.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Monthly expense sheet downloaded as CSV!");
  };

  const handleCopyTextReport = () => {
    let report = `📋 *${householdName} — ${month} Expenses*\n`;
    report += `📍 ${address}\n`;
    report += `💰 Total Expenses: ৳ ${totalExpenses.toLocaleString()} (Rent/Bills: ৳ ${totalRentAndBills.toLocaleString()} | Bazaar: ৳ ${totalBazaar.toLocaleString()})\n`;
    report += `🍽️ Meal Rate: ৳ ${mealRate.toFixed(1)} / meal (${totalMeals} total meals)\n\n`;

    report += `*Independent Roommate Balances:*\n`;
    memberSummaries.forEach((s) => {
      const rentSign = s.fixedBalance >= 0 ? "+" : "-";
      const messSign = s.messBalance >= 0 ? "+" : "-";
      const netSign = s.netBalance >= 0 ? "+" : "-";
      report += `• ${s.name} (${s.roomName}): Rent ${rentSign}৳${Math.abs(s.fixedBalance).toLocaleString()} | Mess ${messSign}৳${Math.abs(s.messBalance).toLocaleString()} ➔ Net: ${netSign}৳${Math.abs(s.netBalance).toLocaleString()}\n`;
    });

    report += `\n*1. Rent & Utilities Settlement (Pay to Flat Manager ${flatManager?.name}):*\n`;
    if (rentSettlements.length === 0) {
      report += `• All rent & utility accounts are balanced.\n`;
    } else {
      rentSettlements.forEach((tx) => {
        report += `• ${tx.fromName} ➔ ${tx.toName}: ৳ ${tx.amount.toLocaleString()} [${tx.status.toUpperCase()}]\n`;
      });
    }

    report += `\n*2. Mess Meal Settlement (Pay to Mess Manager ${messManager?.name}):*\n`;
    if (messSettlements.length === 0) {
      report += `• All mess grocery accounts are balanced.\n`;
    } else {
      messSettlements.forEach((tx) => {
        report += `• ${tx.fromName} ➔ ${tx.toName}: ৳ ${tx.amount.toLocaleString()} [${tx.status.toUpperCase()}]\n`;
      });
    }

    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(report);
      toast.success("Monthly summary report copied to clipboard!");
    } else {
      toast.info("Clipboard access unavailable.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xs p-3.5 flex items-start sm:items-center gap-3 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
        <div className="flex-1 leading-relaxed">
          <strong className="font-semibold">Simulated Demo Data:</strong> All flat members, seats, and financial records shown below are strictly fictional for testing student mess and rental expense workflows. No real bank accounts or bKash transfers are executed.
        </div>
      </div>

      {/* Historical Archive Notice if viewing archived month */}
      {isArchived && (
        <div className="bg-muted border border-border rounded-xs p-3.5 flex items-center gap-3 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1">
            <strong className="font-semibold text-foreground">Historical Record ({month}):</strong> This month is an archived demonstration dataset. Balances and settlements are preserved for audit and cannot be modified.
          </div>
        </div>
      )}

      {/* Metric Cards Grid - Fully Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total {month} Expenses
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              ৳ {totalExpenses.toLocaleString()}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
              <span>Rent & Bills: ৳ {totalRentAndBills.toLocaleString()}</span>
              <span>•</span>
              <span>Bazaar: ৳ {totalBazaar.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Mess Meal Rate */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Dynamic Meal Rate
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-heading text-primary">
              ৳ {mealRate.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ meal</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ৳ {totalBazaar.toLocaleString()} bazaar ÷ {totalMeals} meals
            </p>
          </div>
        </div>

        {/* Your Personal Position (Split by Account) */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground truncate" title={currentMember?.name}>
              Your Position ({currentMember?.name})
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={`text-xl sm:text-2xl font-bold font-heading ${
                currentUserNet >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {currentUserNet >= 0 ? `+ ৳ ${currentUserNet.toLocaleString()}` : `- ৳ ${Math.abs(currentUserNet).toLocaleString()}`}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5 font-mono">
              <span className={currentUserFixed >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                Rent: {currentUserFixed >= 0 ? `+৳${currentUserFixed}` : `-৳${Math.abs(currentUserFixed)}`}
              </span>
              <span>|</span>
              <span className={currentUserMess >= 0 ? "text-emerald-600 font-semibold" : "text-rose-600 font-semibold"}>
                Mess: {currentUserMess >= 0 ? `+৳${currentUserMess}` : `-৳${Math.abs(currentUserMess)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Household Overview */}
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Flat Household Roles
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              {members.length} Members
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 space-y-0.5">
              <div className="flex items-center gap-1 truncate" title={`Flat Manager: ${flatManager?.name}`}>
                <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                <span>Rent: {flatManager?.name}</span>
              </div>
              <div className="flex items-center gap-1 truncate" title={`Mess Manager: ${messManager?.name}`}>
                <Utensils className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>Mess: {messManager?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEPARATE SETTLEMENT ACCOUNTS SECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground font-heading flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>Independent Settlement Plans</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Rent liabilities and Mess food liabilities are strictly segregated. Food money is never offset against landlord rent.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-xs bg-secondary text-primary border border-primary/20 shrink-0 self-start sm:self-auto">
            {rentSettlements.filter((t) => t.status === "settled").length +
              messSettlements.filter((t) => t.status === "settled").length}{" "}
            of {rentSettlements.length + messSettlements.length} Settled
          </span>
        </div>

        {/* Two-Column Cards: Rent Settlement vs Mess Settlement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Rent & Fixed Utilities Settlement */}
          <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-1 border-b border-border pb-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                    1. Rent & Utilities Settlement
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  Flat Manager: {flatManager?.name}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Payable to the flat manager for landlord rent, DESCO electricity, and maid.
              </p>
            </div>

            {rentSettlements.length === 0 ? (
              <div className="p-6 text-center bg-background border border-dashed border-border rounded-xs space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-foreground">Rent Fully Settled</h4>
                <p className="text-[11px] text-muted-foreground">
                  All roommates have cleared their flat rent and utility liabilities.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1">
                {rentSettlements.map((tx) => {
                  const isSettled = tx.status === "settled";
                  return (
                    <div
                      key={tx.id}
                      className={`border rounded-xs p-3 transition-all flex flex-col justify-between gap-2.5 ${
                        isSettled
                          ? "bg-muted/30 border-border/60 opacity-75"
                          : "bg-background border-border shadow-2xs hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
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

                      <div className="flex flex-wrap items-center justify-between pt-1 border-t border-border/40 text-[11px] gap-2">
                        <span className="text-muted-foreground text-[10px]">
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="w-3 h-3" /> Paid to Landlord / Manager
                            </span>
                          ) : (
                            "Flat Rent & Utility Liability"
                          )}
                        </span>
                        {!isArchived && (
                          <button
                            type="button"
                            onClick={() => onToggleSettlement(tx.id)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors cursor-pointer ${
                              isSettled
                                ? "text-muted-foreground hover:text-foreground bg-secondary/50"
                                : "text-primary hover:text-primary-foreground hover:bg-primary bg-secondary border border-primary/20"
                            }`}
                          >
                            {isSettled ? "Undo" : "Mark Paid"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Mess Meal Account Settlement */}
          <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-1 border-b border-border pb-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                    2. Mess Food Settlement
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Mess Manager: {messManager?.name}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Payable to the active mess manager for grocery shopping and consumed meals.
              </p>
            </div>

            {messSettlements.length === 0 ? (
              <div className="p-6 text-center bg-background border border-dashed border-border rounded-xs space-y-1.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <h4 className="text-xs font-bold text-foreground">Mess Food Fully Settled</h4>
                <p className="text-[11px] text-muted-foreground">
                  All roommates have cleared their mess food costs. Meal rate: ৳{mealRate.toFixed(1)}/meal.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1">
                {messSettlements.map((tx) => {
                  const isSettled = tx.status === "settled";
                  return (
                    <div
                      key={tx.id}
                      className={`border rounded-xs p-3 transition-all flex flex-col justify-between gap-2.5 ${
                        isSettled
                          ? "bg-muted/30 border-border/60 opacity-75"
                          : "bg-background border-border shadow-2xs hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
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

                      <div className="flex flex-wrap items-center justify-between pt-1 border-t border-border/40 text-[11px] gap-2">
                        <span className="text-muted-foreground text-[10px]">
                          {isSettled ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="w-3 h-3" /> Paid to Mess Manager
                            </span>
                          ) : (
                            "Daily Mess Meals & Grocery Liability"
                          )}
                        </span>
                        {!isArchived && (
                          <button
                            type="button"
                            onClick={() => onToggleSettlement(tx.id)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors cursor-pointer ${
                              isSettled
                                ? "text-muted-foreground hover:text-foreground bg-secondary/50"
                                : "text-primary hover:text-primary-foreground hover:bg-primary bg-secondary border border-primary/20"
                            }`}
                          >
                            {isSettled ? "Undo" : "Mark Paid"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Financial Balance Sheet Table */}
      <div className="bg-card border border-border rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-foreground font-heading">
              Roommate Independent Balance Sheet ({month})
            </h2>
            <p className="text-xs text-muted-foreground">
              Distinct tracking of Rent/Utilities liabilities vs Mess Meal consumption balances.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-2.5 py-1.5 text-xs font-medium text-foreground bg-secondary/80 hover:bg-secondary border border-border rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTextReport}
              className="px-2.5 py-1.5 text-xs font-medium text-foreground bg-secondary/80 hover:bg-secondary border border-border rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Copy summary report to clipboard"
            >
              <Copy className="w-3.5 h-3.5 text-primary" />
              <span>Copy Report</span>
            </button>
            {onOpenManageFlatmates && (
              <button
                type="button"
                onClick={onOpenManageFlatmates}
                className="px-2.5 py-1.5 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Flatmates ({members.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table with Independent Sub-accounts (Zero sq ft!) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Roommate</th>
                <th className="py-2.5 px-3">Seat / Room</th>
                <th className="py-2.5 px-3 text-right">Rent Paid</th>
                <th className="py-2.5 px-3 text-right">Rent Share</th>
                <th className="py-2.5 px-3 text-right">Rent Balance</th>
                <th className="py-2.5 px-3 text-right">Mess Paid</th>
                <th className="py-2.5 px-3 text-right">Meals (Cost)</th>
                <th className="py-2.5 px-3 text-right">Mess Balance</th>
                <th className="py-2.5 px-3 text-right">Net Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {memberSummaries.map((summary) => {
                const member = members.find((m) => m.id === summary.memberId);
                const isRentPositive = summary.fixedBalance >= 0;
                const isMessPositive = summary.messBalance >= 0;
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
                            {member?.isFlatManager && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold" title="Flat Manager">
                                👑
                              </span>
                            )}
                            {member?.isMessManager && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold" title="Mess Manager">
                                🍲
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
                        {member?.isFlatManager ? "Flat Manager" : member?.isMessManager ? "Mess Manager" : "Resident"}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      ৳ {summary.fixedPaid.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-muted-foreground">
                      ৳ {summary.fixedShare.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold font-mono ${
                          isRentPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isRentPositive ? `+৳${summary.fixedBalance}` : `-৳${Math.abs(summary.fixedBalance)}`}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      ৳ {summary.messPaid.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-medium text-foreground">{summary.mealCount} meals</span>
                      <div className="text-[11px] text-muted-foreground">
                        (৳ {summary.messCost.toLocaleString()})
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold font-mono ${
                          isMessPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isMessPositive ? `+৳${summary.messBalance}` : `-৳${Math.abs(summary.messBalance)}`}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-xs text-[11px] font-bold border ${
                          isNetPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
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

        {/* Mobile & Tablet Card List */}
        <div className="md:hidden space-y-3">
          {memberSummaries.map((summary) => {
            const member = members.find((m) => m.id === summary.memberId);
            const isRentPositive = summary.fixedBalance >= 0;
            const isMessPositive = summary.messBalance >= 0;
            const isNetPositive = summary.netBalance >= 0;

            return (
              <div
                key={summary.memberId}
                className="border border-border rounded-xs p-3.5 bg-background space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                      <Image
                        src={summary.avatar}
                        alt={summary.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span>{summary.name}</span>
                        {member?.isCurrentUser && (
                          <span className="text-[9px] px-1 py-0.2 rounded-xs bg-secondary text-primary font-bold">
                            You
                          </span>
                        )}
                        {member?.isFlatManager && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400" title="Flat Manager">👑</span>
                        )}
                        {member?.isMessManager && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400" title="Mess Manager">🍲</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{summary.roomName}</div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-xs border ${
                      isNetPositive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    Net: {isNetPositive ? `+ ৳ ${summary.netBalance.toLocaleString()}` : `- ৳ ${Math.abs(summary.netBalance).toLocaleString()}`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                  <div className="p-2 bg-muted/20 rounded-xs space-y-0.5">
                    <span className="text-muted-foreground text-[10px] block font-semibold uppercase">Rent Account</span>
                    <div className="text-[11px] text-foreground">Paid: ৳{summary.fixedPaid} / Share: ৳{summary.fixedShare}</div>
                    <div className={`font-mono font-bold text-[11px] ${isRentPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      Bal: {isRentPositive ? `+৳${summary.fixedBalance}` : `-৳${Math.abs(summary.fixedBalance)}`}
                    </div>
                  </div>

                  <div className="p-2 bg-muted/20 rounded-xs space-y-0.5">
                    <span className="text-muted-foreground text-[10px] block font-semibold uppercase">Mess Account</span>
                    <div className="text-[11px] text-foreground">{summary.mealCount} meals (৳{summary.messCost})</div>
                    <div className={`font-mono font-bold text-[11px] ${isMessPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      Bal: {isMessPositive ? `+৳${summary.messBalance}` : `-৳${Math.abs(summary.messBalance)}`}
                    </div>
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
