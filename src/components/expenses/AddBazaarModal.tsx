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
import { FlatMember, BazaarEntry } from "@/types/expense";
import { ShoppingBag, Edit2, AlertCircle } from "lucide-react";

interface AddBazaarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: BazaarEntry) => void;
  entryToEdit?: BazaarEntry | null;
  members: FlatMember[];
}

const COMMON_MARKETS = [
  { value: "Nilkhet Kacha Bazar", label: "Nilkhet Kacha Bazar" },
  { value: "Katabon Bazar", label: "Katabon Bazar" },
  { value: "Palashi Bazar", label: "Palashi Bazar (BUET Gate)" },
  { value: "New Market Kacha Bazar", label: "New Market Kacha Bazar" },
  { value: "Karwan Bazar", label: "Karwan Bazar Wholesale" },
  { value: "Shwapno Super Shop", label: "Shwapno Super Shop" },
  { value: "Meena Bazar", label: "Meena Bazar" },
  { value: "Local Neighborhood Van", label: "Local Van / Neighborhood Shop" },
];

interface BazaarFormContentProps {
  onClose: () => void;
  onSave: (entry: BazaarEntry) => void;
  entryToEdit?: BazaarEntry | null;
  members: FlatMember[];
}

function BazaarFormContent({
  onClose,
  onSave,
  entryToEdit,
  members,
}: BazaarFormContentProps) {
  const [description, setDescription] = useState(entryToEdit?.description || "");
  const [marketName, setMarketName] = useState(
    entryToEdit?.marketName || "Nilkhet Kacha Bazar"
  );
  const [amount, setAmount] = useState<string>(
    entryToEdit ? String(entryToEdit.amount) : ""
  );
  const [paidByMemberId, setPaidByMemberId] = useState<string>(
    entryToEdit?.paidByMemberId || members[0]?.id || ""
  );
  const [date, setDate] = useState<string>(
    entryToEdit?.date || new Date().toISOString().split("T")[0]
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const payerOptions = members.map((m) => ({
    value: m.id,
    label: m.name + (m.isCurrentUser ? " (You)" : ""),
    secondaryLabel: m.roomName,
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setErrorMessage("Please describe the grocery items purchased.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid positive bazaar amount.");
      return;
    }

    if (!paidByMemberId) {
      setErrorMessage("Please select who went to bazaar and paid.");
      return;
    }

    // Split items by comma if provided
    const items = description
      .split(/[,+\n]/)
      .map((i) => i.trim())
      .filter(Boolean);

    const payload: BazaarEntry = {
      id: entryToEdit ? entryToEdit.id : `baz-${Date.now()}`,
      description: description.trim(),
      marketName: marketName.trim() || "Local Market",
      amount: Math.round(parsedAmount),
      paidByMemberId,
      date,
      items: items.length > 0 ? items : undefined,
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
            {entryToEdit ? <Edit2 className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              {entryToEdit ? "Edit Mess Bazaar Entry" : "Log Mess Bazaar / Grocery"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              Grocery costs directly feed into the flat&apos;s dynamic meal rate.
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

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bazaar-description" className="text-xs font-semibold">
              Items Purchased <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bazaar-description"
              placeholder="e.g. Chicken 3kg, Eggs 2 crates, Potatoes, Onions, Oil"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Tip: Separate items with commas for neat tags in the mess ledger.
            </p>
          </div>

          {/* Market & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Market / Grocery Location</Label>
              <AppSelect
                value={marketName}
                onValueChange={setMarketName}
                options={COMMON_MARKETS}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bazaar-amount" className="text-xs font-semibold">
                Cost (৳ BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bazaar-amount"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1850"
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
                Bazaar Done & Paid By <span className="text-destructive">*</span>
              </Label>
              <AppSelect
                value={paidByMemberId}
                onValueChange={setPaidByMemberId}
                options={payerOptions}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bazaar-date" className="text-xs font-semibold">
                Purchase Date
              </Label>
              <Input
                id="bazaar-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
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
            {entryToEdit ? "Update Bazaar Entry" : "Save Bazaar Entry"}
          </button>
        </DialogFooter>
      </form>
    </>
  );
}

export function AddBazaarModal({
  isOpen,
  onClose,
  onSave,
  entryToEdit,
  members,
}: AddBazaarModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] p-0 flex flex-col rounded-xs bg-card border border-border shadow-2xl overflow-hidden">
        {isOpen && (
          <BazaarFormContent
            key={entryToEdit?.id || "new-bazaar"}
            onClose={onClose}
            onSave={onSave}
            entryToEdit={entryToEdit}
            members={members}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
