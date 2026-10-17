"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/shared/AppSelect";
import { AppCheckbox } from "@/components/shared/AppCheckbox";
import {
  FlatMember,
  SharedExpense,
  ExpenseCategory,
  SplitMethod,
} from "@/types/expense";
import { Plus, Edit2, AlertCircle } from "lucide-react";

interface AddEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: SharedExpense) => void;
  expenseToEdit?: SharedExpense | null;
  members: FlatMember[];
}

const CATEGORY_OPTIONS = [
  { value: "rent", label: "Flat Rent" },
  { value: "electricity", label: "Electricity / DESCO" },
  { value: "gas", label: "Gas Cylinder / Bill" },
  { value: "internet", label: "Fiber Internet / WiFi" },
  { value: "maid", label: "Maid / Khala Salary" },
  { value: "water", label: "Water / WASA" },
  { value: "waste", label: "Waste Disposal & Caretaker" },
  { value: "other", label: "Other Common Expense" },
];

const SPLIT_OPTIONS = [
  { value: "equal", label: "Equal Split (1/N per member)" },
  { value: "room_weighted", label: "Room-Size Weighted (Based on Sq Ft %)" },
];

interface ExpenseFormContentProps {
  onClose: () => void;
  onSave: (expense: SharedExpense) => void;
  expenseToEdit?: SharedExpense | null;
  members: FlatMember[];
}

function ExpenseFormContent({
  onClose,
  onSave,
  expenseToEdit,
  members,
}: ExpenseFormContentProps) {
  const [title, setTitle] = useState(expenseToEdit?.title || "");
  const [category, setCategory] = useState<ExpenseCategory>(
    expenseToEdit?.category || "electricity"
  );
  const [amount, setAmount] = useState<string>(
    expenseToEdit ? String(expenseToEdit.amount) : ""
  );
  const [paidByMemberId, setPaidByMemberId] = useState<string>(
    expenseToEdit?.paidByMemberId || members[0]?.id || ""
  );
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(
    expenseToEdit?.splitMethod || "equal"
  );
  const [applicableMemberIds, setApplicableMemberIds] = useState<string[]>(
    expenseToEdit?.applicableMemberIds || members.map((m) => m.id)
  );
  const [date, setDate] = useState<string>(
    expenseToEdit?.date || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(expenseToEdit?.notes || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const payerOptions = members.map((m) => ({
    value: m.id,
    label: m.name + (m.isCurrentUser ? " (You)" : ""),
    secondaryLabel: m.roomName,
  }));

  const handleToggleMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setApplicableMemberIds((prev) => [...prev, memberId]);
    } else {
      if (applicableMemberIds.length <= 1) {
        setErrorMessage("At least one roommate must participate in the expense.");
        return;
      }
      setErrorMessage(null);
      setApplicableMemberIds((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter an expense title.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid positive amount.");
      return;
    }

    if (!paidByMemberId) {
      setErrorMessage("Please select who paid this expense.");
      return;
    }

    if (applicableMemberIds.length === 0) {
      setErrorMessage("Select at least one member to split this expense.");
      return;
    }

    const payload: SharedExpense = {
      id: expenseToEdit ? expenseToEdit.id : `exp-${Date.now()}`,
      title: title.trim(),
      category,
      amount: Math.round(parsedAmount),
      paidByMemberId,
      splitMethod,
      applicableMemberIds,
      date,
      notes: notes.trim() || undefined,
    };

    onSave(payload);
    onClose();
  };

  return (
    <>
      {/* 1. Fixed Header */}
      <DialogHeader className="shrink-0 p-4 sm:p-5 border-b border-border bg-secondary/30 pr-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            {expenseToEdit ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              {expenseToEdit ? "Edit Shared Expense" : "Add Shared Expense"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              Log rent, utility bills, or household maintenance.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* 2. Form with Scrollable Body and Fixed Footer */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          {errorMessage && (
            <div className="p-3 rounded-xs bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-title" className="text-xs font-semibold">
              Expense Description <span className="text-destructive">*</span>
            </Label>
            <Input
              id="expense-title"
              placeholder="e.g. DESCO Prepaid Token, Internet Bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <AppSelect
                value={category}
                onValueChange={(val) => setCategory(val as ExpenseCategory)}
                options={CATEGORY_OPTIONS}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-amount" className="text-xs font-semibold">
                Amount (৳ BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="expense-amount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 2400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Paid By & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Paid Out of Pocket By <span className="text-destructive">*</span>
              </Label>
              <AppSelect
                value={paidByMemberId}
                onValueChange={setPaidByMemberId}
                options={payerOptions}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expense-date" className="text-xs font-semibold">
                Date
              </Label>
              <Input
                id="expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>

          {/* Split Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Split Formula</Label>
            <AppSelect
              value={splitMethod}
              onValueChange={(val) => setSplitMethod(val as SplitMethod)}
              options={SPLIT_OPTIONS}
              triggerClassName="h-10 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              {splitMethod === "equal"
                ? "Divided equally among participating members."
                : "Divided proportionally based on individual room square-footage %."}
            </p>
          </div>

          {/* Split Between Members Checkbox Group */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold">
              Split Between Roommates ({applicableMemberIds.length}/{members.length})
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/40 rounded-xs border border-border">
              {members.map((m) => {
                const isChecked = applicableMemberIds.includes(m.id);
                return (
                  <AppCheckbox
                    key={m.id}
                    id={`split-member-${m.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggleMember(m.id, checked)}
                    label={m.name + (m.isCurrentUser ? " (You)" : "")}
                    description={
                      splitMethod === "room_weighted"
                        ? `${m.rentWeightPercent}% room weight`
                        : m.roomName
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="expense-notes" className="text-xs font-semibold">
              Notes / Transaction ID (Optional)
            </Label>
            <Input
              id="expense-notes"
              placeholder="e.g. Paid via bKash TrxID #8AK3920"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10 text-xs"
            />
          </div>
        </div>

        {/* 3. Fixed Footer */}
        <DialogFooter className="shrink-0 p-3.5 sm:p-4 border-t border-border bg-secondary/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
          >
            {expenseToEdit ? "Save Changes" : "Record Expense"}
          </button>
        </DialogFooter>
      </form>
    </>
  );
}

export function AddEditExpenseModal({
  isOpen,
  onClose,
  onSave,
  expenseToEdit,
  members,
}: AddEditExpenseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg md:max-w-xl max-h-[90dvh] sm:max-h-[85vh] p-0 flex flex-col rounded-xs bg-card border border-border shadow-2xl overflow-hidden">
        {isOpen && (
          <ExpenseFormContent
            key={expenseToEdit?.id || "new-expense"}
            onClose={onClose}
            onSave={onSave}
            expenseToEdit={expenseToEdit}
            members={members}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
