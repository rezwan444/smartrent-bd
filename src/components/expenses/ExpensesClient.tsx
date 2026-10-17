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
} from "@/lib/expenseStorage";
import { calculateHouseholdFinances } from "@/lib/expenseSettlement";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExpensesOverview } from "./ExpensesOverview";
import { RentUtilitiesLedger } from "./RentUtilitiesLedger";
import { MessMealLedger } from "./MessMealLedger";
import { RoomWeightCalculator } from "./RoomWeightCalculator";
import { AddEditExpenseModal } from "./AddEditExpenseModal";
import { AddBazaarModal } from "./AddBazaarModal";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import {
  Home,
  MapPin,
  Calendar,
  RotateCcw,
  Plus,
  ShoppingBag,
  LayoutDashboard,
  Receipt,
  Utensils,
  Scale,
  Sparkles,
} from "lucide-react";

export function ExpensesClient() {
  const [householdData, setHouseholdData] = useState<HouseholdExpenseData>(() =>
    loadHouseholdData()
  );
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modal States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<SharedExpense | null>(null);

  const [isBazaarModalOpen, setIsBazaarModalOpen] = useState(false);
  const [bazaarToEdit, setBazaarToEdit] = useState<BazaarEntry | null>(null);

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
    saveHouseholdData(newData);
  };

  // Derive finances reactively
  const finances = calculateHouseholdFinances(householdData);

  // --- Handlers ---
  const handleSaveExpense = (savedExpense: SharedExpense) => {
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
  };

  const handleDeleteExpense = (expenseId: string) => {
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
      },
    });
  };

  const handleSaveBazaar = (savedEntry: BazaarEntry) => {
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
  };

  const handleDeleteBazaar = (entryId: string) => {
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
      },
    });
  };

  const handleUpdateMealCount = (memberId: string, count: number) => {
    updateData({
      ...householdData,
      mealCounts: {
        ...householdData.mealCounts,
        [memberId]: Math.max(0, count),
      },
    });
  };

  const handleToggleSettlement = (transactionId: string) => {
    const current = householdData.settledTransactions || [];
    const isSettled = current.includes(transactionId);
    const updated = isSettled
      ? current.filter((id) => id !== transactionId)
      : [...current, transactionId];

    updateData({
      ...householdData,
      settledTransactions: updated,
    });
  };

  const handleReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Demo Ledger",
      description: "Reset all shared expense records and mess ledger entries back to initial demo defaults?",
      confirmText: "Reset Demo",
      variant: "warning",
      onConfirm: () => {
        const reset = resetHouseholdData();
        setHouseholdData(reset);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feature 9 • Shared Expense & Mess Manager</span>
            </span>
            <span className="text-xs text-muted-foreground">• Demo Prototype</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-primary shrink-0" />
            <span>{householdData.householdName}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>{householdData.address}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>Active Period: {householdData.month}</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-xs transition-colors"
            title="Reset to default mock flat data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill / Rent</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBazaarToEdit(null);
              setIsBazaarModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            <span>Log Bazaar</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-card border border-border rounded-xs p-1 h-auto inline-flex gap-1">
            <TabsTrigger
              value="overview"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview & Settlement</span>
            </TabsTrigger>

            <TabsTrigger
              value="rent_bills"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Rent & Utility Bills ({householdData.expenses.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="mess_ledger"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Mess Ledger & Bazaar ({householdData.bazaarEntries.length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="room_weight"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Room-Size Weight Tool</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <ExpensesOverview
            householdName={householdData.householdName}
            address={householdData.address}
            month={householdData.month}
            totalExpenses={finances.totalExpenses}
            totalRentAndBills={finances.totalRentAndBills}
            totalBazaar={finances.totalBazaar}
            totalMeals={finances.totalMeals}
            mealRate={finances.mealRate}
            memberSummaries={finances.memberSummaries}
            settlementTransactions={finances.settlementTransactions}
            members={householdData.members}
            onToggleSettlement={handleToggleSettlement}
            onOpenAddExpense={() => {
              setExpenseToEdit(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenAddBazaar={() => {
              setBazaarToEdit(null);
              setIsBazaarModalOpen(true);
            }}
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

        {/* Tab 4: Room-Size Weight Calculator */}
        <TabsContent value="room_weight" className="mt-0">
          <RoomWeightCalculator
            members={householdData.members}
            initialRent={householdData.totalMonthlyRent}
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
