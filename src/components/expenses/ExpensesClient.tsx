"use client";

import React, { useState } from "react";
import {
  HouseholdExpenseData,
  SharedExpense,
  BazaarEntry,
} from "@/types/expense";
import {
  loadHouseholdData,
  saveHouseholdData,
  resetHouseholdData,
  loadMultiMonthData,
  setActiveMonthKey,
} from "@/lib/expenseStorage";
import { calculateHouseholdFinances } from "@/lib/expenseSettlement";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExpensesOverview } from "./ExpensesOverview";
import { RentUtilitiesLedger } from "./RentUtilitiesLedger";
import { MessMealLedger } from "./MessMealLedger";
import { RoomWeightCalculator } from "./RoomWeightCalculator";
import { AddEditExpenseModal } from "./AddEditExpenseModal";
import { AddBazaarModal } from "./AddBazaarModal";
import { ManageFlatmatesModal } from "./ManageFlatmatesModal";
import { AppSelect } from "@/components/shared/AppSelect";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { toast } from "sonner";
import {
  Home,
  MapPin,
  RotateCcw,
  Plus,
  ShoppingBag,
  LayoutDashboard,
  Receipt,
  Utensils,
  Scale,
  Sparkles,
  Users,
  Lock,
  UserCheck,
} from "lucide-react";

const MONTH_OPTIONS = [
  {
    value: "2026-10",
    label: "October 2026 (Active)",
    secondaryLabel: "Current Month",
  },
  {
    value: "2026-09",
    label: "September 2026 (Archived Demo)",
    secondaryLabel: "Historical Record",
  },
];

export function ExpensesClient() {
  const [activeMonthKeyVal, setActiveMonthKeyVal] = useState<string>(() => {
    const store = loadMultiMonthData();
    return store.activeMonthKey || "2026-10";
  });

  const [householdData, setHouseholdData] = useState<HouseholdExpenseData>(() =>
    loadHouseholdData(activeMonthKeyVal)
  );
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<SharedExpense | null>(null);

  const [isBazaarModalOpen, setIsBazaarModalOpen] = useState(false);
  const [bazaarToEdit, setBazaarToEdit] = useState<BazaarEntry | null>(null);

  const [isFlatmatesModalOpen, setIsFlatmatesModalOpen] = useState(false);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "destructive" | "warning" | "default";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Sync to storage on modification
  const updateData = (newData: HouseholdExpenseData) => {
    setHouseholdData(newData);
    saveHouseholdData(newData, activeMonthKeyVal);
  };

  // Derive finances reactively
  const finances = calculateHouseholdFinances(householdData);

  // Current active user perspective ID
  const currentMember = householdData.members.find((m) => m.isCurrentUser) || householdData.members[0];
  const currentUserId = currentMember?.id || householdData.members[0]?.id || "";

  // Perspective Switcher Options (answers user question on how members see data)
  const memberPerspectiveOptions = householdData.members.map((m) => ({
    value: m.id,
    label: m.name,
    secondaryLabel: m.isFlatManager
      ? "👑 Flat Manager"
      : m.isMessManager
      ? "🍲 Mess Manager"
      : m.roomName,
  }));

  const handleSwitchUserPerspective = (newMemberId: string) => {
    const target = householdData.members.find((m) => m.id === newMemberId);
    if (!target) return;
    const updatedMembers = householdData.members.map((m) => ({
      ...m,
      isCurrentUser: m.id === newMemberId,
    }));
    updateData({
      ...householdData,
      members: updatedMembers,
    });
    toast.success(`Switched dashboard view to: ${target.name}`);
  };

  // --- Month Switcher Handler ---
  const handleMonthChange = (newKey: string) => {
    setActiveMonthKeyVal(newKey);
    setActiveMonthKey(newKey);
    const dataForMonth = loadHouseholdData(newKey);
    setHouseholdData(dataForMonth);
    toast.info(`Switched view to ${dataForMonth.month} records.`);
  };

  // --- Handlers ---
  const handleSaveExpense = (savedExpense: SharedExpense) => {
    if (householdData.isArchived) {
      toast.error("Cannot modify historical records for an archived month.");
      return;
    }

    const exists = householdData.expenses.some((e) => e.id === savedExpense.id);
    let newExpenses: SharedExpense[];

    if (exists) {
      newExpenses = householdData.expenses.map((e) =>
        e.id === savedExpense.id ? savedExpense : e
      );
    } else {
      newExpenses = [savedExpense, ...householdData.expenses];
    }

    updateData({
      ...householdData,
      expenses: newExpenses,
    });
    toast.success("Shared expense saved successfully!");
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (householdData.isArchived) {
      toast.error("Cannot delete historical records from an archived month.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Delete Expense Record",
      description: "Are you sure you want to delete this shared expense record? This action will immediately recalculate everyone's balances.",
      confirmText: "Delete Record",
      variant: "destructive",
      onConfirm: () => {
        const newExpenses = householdData.expenses.filter((e) => e.id !== expenseId);
        updateData({
          ...householdData,
          expenses: newExpenses,
        });
        toast.info("Shared expense record deleted.");
      },
    });
  };

  const handleSaveBazaar = (savedEntry: BazaarEntry) => {
    if (householdData.isArchived) {
      toast.error("Cannot add or edit bazaar entries in an archived month.");
      return;
    }

    const exists = householdData.bazaarEntries.some((b) => b.id === savedEntry.id);
    let newEntries: BazaarEntry[];

    if (exists) {
      newEntries = householdData.bazaarEntries.map((b) =>
        b.id === savedEntry.id ? savedEntry : b
      );
    } else {
      newEntries = [savedEntry, ...householdData.bazaarEntries];
    }

    updateData({
      ...householdData,
      bazaarEntries: newEntries,
    });
    toast.success("Mess bazaar entry logged successfully!");
  };

  const handleDeleteBazaar = (entryId: string) => {
    if (householdData.isArchived) {
      toast.error("Cannot remove bazaar entries from an archived month.");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Remove Bazaar Entry",
      description: "Are you sure you want to remove this grocery bazaar entry? The meal rate will be recalculated accordingly.",
      confirmText: "Remove Entry",
      variant: "destructive",
      onConfirm: () => {
        const newEntries = householdData.bazaarEntries.filter((b) => b.id !== entryId);
        updateData({
          ...householdData,
          bazaarEntries: newEntries,
        });
        toast.info("Bazaar grocery entry removed.");
      },
    });
  };

  const handleUpdateMealCount = (memberId: string, count: number) => {
    if (householdData.isArchived) {
      toast.error("Cannot adjust meal counts in an archived month.");
      return;
    }

    updateData({
      ...householdData,
      mealCounts: {
        ...householdData.mealCounts,
        [memberId]: Math.max(0, count),
      },
    });
  };

  const handleToggleSettlement = (transactionId: string) => {
    if (householdData.isArchived) {
      toast.error("Historical settlements are locked and cannot be toggled.");
      return;
    }

    const current = householdData.settledTransactions || [];
    const isSettled = current.includes(transactionId);
    const updated = isSettled
      ? current.filter((id) => id !== transactionId)
      : [...current, transactionId];

    updateData({
      ...householdData,
      settledTransactions: updated,
    });
    toast.success(isSettled ? "Settlement payment unmarked." : "Payment marked as settled!");
  };

  const handleReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Demo Ledger",
      description: "Reset all shared expense records, months, and mess ledger entries back to initial demo defaults?",
      confirmText: "Reset Demo",
      variant: "warning",
      onConfirm: () => {
        const reset = resetHouseholdData();
        setActiveMonthKeyVal("2026-10");
        setHouseholdData(reset);
        toast.info("Household expenses reset to default demo records.");
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* REDESIGNED PROPER RESPONSIVE HEADER BANNER */}
      <div className="bg-card border border-border rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Row 1: Badges & Month Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feature 9 • Shared Expense & Mess Manager</span>
            </span>
            <span className="text-xs text-muted-foreground">• Demo Prototype</span>
            {householdData.isArchived && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-xs bg-muted text-muted-foreground border border-border font-medium">
                <Lock className="w-3 h-3" />
                <span>Archived Month</span>
              </span>
            )}
          </div>

          {/* Month Selector: Clean and dedicated */}
          <div className="w-full sm:w-56 shrink-0">
            <AppSelect
              value={activeMonthKeyVal}
              onValueChange={handleMonthChange}
              options={MONTH_OPTIONS}
              triggerClassName="h-9 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Row 2: Household Title & Perspective Persona Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
              <Home className="w-5 h-5 text-primary shrink-0" />
              <span>{householdData.householdName}</span>
            </h1>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="line-clamp-1">{householdData.address}</span>
            </div>
          </div>

          {/* Interactive Persona Perspective Switcher (Simulate Any Flatmate's Dashboard) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-secondary/40 border border-border/80 rounded-xs p-2 sm:px-3 self-start lg:self-auto w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
              <UserCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Viewing dashboard as:</span>
            </div>
            <div className="w-full sm:w-52">
              <AppSelect
                value={currentUserId}
                onValueChange={handleSwitchUserPerspective}
                options={memberPerspectiveOptions}
                triggerClassName="h-8 text-xs bg-card border-border/80 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Row 3: Responsive Action Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-border/60">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFlatmatesModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer shadow-2xs"
              title="Manage roommates and roles"
            >
              <Users className="w-3.5 h-3.5 text-primary" />
              <span>Manage Flatmates ({householdData.members.length})</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-xs transition-colors cursor-pointer"
              title="Reset to default mock flat data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {!householdData.isArchived && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setExpenseToEdit(null);
                  setIsExpenseModalOpen(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Bill / Rent</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBazaarToEdit(null);
                  setIsBazaarModalOpen(true);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                <span>+ Log Bazaar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="bg-card border border-border rounded-xs p-1 h-auto inline-flex gap-1 min-w-max">
            <TabsTrigger
              value="overview"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview & Settlement</span>
            </TabsTrigger>

            <TabsTrigger
              value="rent_bills"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Rent & Utility Bills ({householdData.expenses.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="mess_ledger"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Mess Ledger & Bazaar ({householdData.bazaarEntries.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="room_weight"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Room Weight (Optional)</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <ExpensesOverview
            householdName={householdData.householdName}
            address={householdData.address}
            month={householdData.month}
            isArchived={householdData.isArchived}
            totalExpenses={finances.totalExpenses}
            totalRentAndBills={finances.totalRentAndBills}
            totalBazaar={finances.totalBazaar}
            totalMeals={finances.totalMeals}
            mealRate={finances.mealRate}
            memberSummaries={finances.memberSummaries}
            rentSettlements={finances.rentSettlements}
            messSettlements={finances.messSettlements}
            settlementTransactions={finances.settlementTransactions}
            members={householdData.members}
            onToggleSettlement={handleToggleSettlement}
            onOpenManageFlatmates={() => setIsFlatmatesModalOpen(true)}
          />
        </TabsContent>

        {/* Tab 2: Rent & Utility Bills */}
        <TabsContent value="rent_bills" className="mt-0">
          <RentUtilitiesLedger
            expenses={householdData.expenses}
            members={householdData.members}
            onAddExpense={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={(exp) => {
              setExpenseToEdit(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
          />
        </TabsContent>

        {/* Tab 3: Mess Ledger & Bazaar */}
        <TabsContent value="mess_ledger" className="mt-0">
          <MessMealLedger
            bazaarEntries={householdData.bazaarEntries}
            mealCounts={householdData.mealCounts}
            members={householdData.members}
            mealRate={finances.mealRate}
            totalBazaar={finances.totalBazaar}
            totalMeals={finances.totalMeals}
            onUpdateMealCount={handleUpdateMealCount}
            onAddBazaar={() => {
              setBazaarToEdit(null);
              setIsBazaarModalOpen(true);
            }}
            onEditBazaar={(entry) => {
              setBazaarToEdit(entry);
              setIsBazaarModalOpen(true);
            }}
            onDeleteBazaar={handleDeleteBazaar}
          />
        </TabsContent>

        {/* Tab 4: Room-Size Weight Calculator (Optional) */}
        <TabsContent value="room_weight" className="mt-0">
          <RoomWeightCalculator
            members={householdData.members}
            initialRent={householdData.totalMonthlyRent}
            onApplyWeightsToMembers={(updated) => {
              updateData({
                ...householdData,
                members: updated,
              });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddEditExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        onSave={handleSaveExpense}
        expenseToEdit={expenseToEdit}
        members={householdData.members}
      />

      <AddBazaarModal
        isOpen={isBazaarModalOpen}
        onClose={() => {
          setIsBazaarModalOpen(false);
          setBazaarToEdit(null);
        }}
        onSave={handleSaveBazaar}
        entryToEdit={bazaarToEdit}
        members={householdData.members}
      />

      <ManageFlatmatesModal
        isOpen={isFlatmatesModalOpen}
        onClose={() => setIsFlatmatesModalOpen(false)}
        members={householdData.members}
        memberSummaries={finances.memberSummaries}
        onUpdateMembers={(newMembers) => {
          updateData({
            ...householdData,
            members: newMembers,
          });
        }}
        isArchived={householdData.isArchived}
      />

      <AppConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
