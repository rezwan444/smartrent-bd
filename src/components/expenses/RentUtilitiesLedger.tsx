"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SharedExpense, FlatMember, ExpenseCategory } from "@/types/expense";
import { AppSelect } from "@/components/shared/AppSelect";
import {
  Plus,
  Trash2,
  Edit2,
  Zap,
  Flame,
  Wifi,
  Home,
  Users2,
  Trash,
  Droplets,
  Layers,
  FileText,
} from "lucide-react";

interface RentUtilitiesLedgerProps {
  expenses: SharedExpense[];
  members: FlatMember[];
  onAddExpense: () => void;
  onEditExpense: (expense: SharedExpense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  { value: "rent", label: "Flat Rent" },
  { value: "electricity", label: "Electricity / DESCO" },
  { value: "gas", label: "Gas Cylinder / Bill" },
  { value: "internet", label: "Fiber Internet / WiFi" },
  { value: "maid", label: "Maid / Khala Salary" },
  { value: "waste", label: "Waste & Maintenance" },
  { value: "other", label: "Other Bills" },
];

export function RentUtilitiesLedger({
  expenses,
  members,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
}: RentUtilitiesLedgerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategory === "all") return true;
    return exp.category === selectedCategory;
  });

  const getCategoryIcon = (cat: ExpenseCategory) => {
    switch (cat) {
      case "rent":
        return <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "electricity":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "gas":
        return <Flame className="w-4 h-4 text-orange-500" />;
      case "internet":
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case "maid":
        return <Users2 className="w-4 h-4 text-purple-500" />;
      case "water":
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case "waste":
        return <Trash className="w-4 h-4 text-rose-500" />;
      default:
        return <Layers className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-sm font-bold text-foreground font-heading">
            Fixed Rent & Utility Bills Ledger
          </h2>
          <p className="text-xs text-muted-foreground">
            Monthly fixed house overheads with flexible equal or room-size weighted cost distribution.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <AppSelect
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            options={CATEGORY_FILTERS}
            className="w-full sm:w-48"
            triggerClassName="h-9 text-xs"
          />

          <button
            type="button"
            onClick={onAddExpense}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bill / Rent</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredExpenses.length === 0 ? (
        <div className="p-10 text-center bg-background border border-dashed border-border rounded-xs space-y-2">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No Expenses Found</h3>
          <p className="text-xs text-muted-foreground">
            {selectedCategory === "all"
              ? "No fixed expenses have been recorded yet."
              : "No expenses match the selected category filter."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-2.5 px-3">Expense</th>
                  <th className="py-2.5 px-3">Split Method</th>
                  <th className="py-2.5 px-3">Paid By</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredExpenses.map((expense) => {
                  const payer = getMemberById(expense.paidByMemberId);
                  const isRoomWeighted = expense.splitMethod === "room_weighted";

                  return (
                    <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-xs bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{expense.title}</div>
                            {expense.notes && (
                              <div className="text-[11px] text-muted-foreground mt-0.5 max-w-xs truncate" title={expense.notes}>
                                {expense.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold ${
                            isRoomWeighted
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                              : "bg-secondary text-primary border border-primary/20"
                          }`}
                        >
                          {isRoomWeighted ? "Room-Weighted" : "Equal Split"}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Split among {expense.applicableMemberIds?.length || members.length} members
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {payer?.avatar && (
                            <div className="relative w-5 h-5 rounded-full overflow-hidden border border-border shrink-0">
                              <Image
                                src={payer.avatar}
                                alt={payer.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <span className="font-medium text-foreground">
                            {payer?.name || "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-muted-foreground">
                        {expense.date}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-foreground font-mono">
                        ৳ {expense.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditExpense(expense)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xs transition-colors"
                            title="Edit Expense"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(expense.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xs transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredExpenses.map((expense) => {
              const payer = getMemberById(expense.paidByMemberId);
              const isRoomWeighted = expense.splitMethod === "room_weighted";

              return (
                <div
                  key={expense.id}
                  className="border border-border rounded-xs p-3.5 bg-background space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-xs bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground">{expense.title}</h3>
                        <p className="text-[11px] text-muted-foreground">{expense.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-foreground">
                        ৳ {expense.amount.toLocaleString()}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded-xs text-[9px] font-semibold mt-0.5 ${
                          isRoomWeighted
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : "bg-secondary text-primary"
                        }`}
                      >
                        {isRoomWeighted ? "Room Weighted" : "Equal"}
                      </span>
                    </div>
                  </div>

                  {expense.notes && (
                    <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-xs">
                      {expense.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>Paid by:</span>
                      <strong className="text-foreground">{payer?.name || "Unknown"}</strong>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditExpense(expense)}
                        className="px-2 py-1 text-xs text-foreground bg-secondary hover:bg-secondary/80 rounded-xs transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(expense.id)}
                        className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
