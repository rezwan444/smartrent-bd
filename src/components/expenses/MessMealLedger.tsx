"use client";

import React from "react";
import Image from "next/image";
import { BazaarEntry, FlatMember } from "@/types/expense";
import {
  Utensils,
  Plus,
  Minus,
  ShoppingBag,
  Trash2,
  Edit2,
  Info,
  Calendar,
  Store,
} from "lucide-react";

interface MessMealLedgerProps {
  bazaarEntries: BazaarEntry[];
  mealCounts: Record<string, number>;
  members: FlatMember[];
  mealRate: number;
  totalBazaar: number;
  totalMeals: number;
  onUpdateMealCount: (memberId: string, newCount: number) => void;
  onAddBazaar: () => void;
  onEditBazaar: (entry: BazaarEntry) => void;
  onDeleteBazaar: (entryId: string) => void;
}

export function MessMealLedger({
  bazaarEntries,
  mealCounts,
  members,
  mealRate,
  totalBazaar,
  totalMeals,
  onUpdateMealCount,
  onAddBazaar,
  onEditBazaar,
  onDeleteBazaar,
}: MessMealLedgerProps) {
  const getMemberById = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-6">
      {/* Dynamic Meal Rate Banner */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground font-heading">
                Bangladeshi Mess System & Dynamic Meal Rate
              </h2>
              <p className="text-xs text-muted-foreground">
                Meal rate fluctuates dynamically based on grocery expenses and individual meal consumption.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-muted-foreground font-medium">Current Meal Rate</div>
            <div className="text-xl sm:text-2xl font-bold font-heading text-primary">
              ৳ {mealRate.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ meal</span>
            </div>
          </div>
        </div>

        {/* Formula Explainer */}
        <div className="bg-secondary/40 border border-border rounded-xs p-3 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 text-foreground">
            <div>
              <strong className="font-semibold">Calculation Formula:</strong>{" "}
              <code className="px-1.5 py-0.5 bg-background rounded-xs font-mono text-[11px] border border-border">
                Meal Rate = Total Grocery (৳ {totalBazaar.toLocaleString()}) ÷ Total Meals ({totalMeals}) = ৳ {mealRate.toFixed(1)}
              </code>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Each flatmate&apos;s mess liability = (Individual Meals Consumed × Meal Rate) - (Any Bazaar paid out of pocket).
            </p>
          </div>
        </div>
      </div>

      {/* Roommate Meal Count Matrix */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground font-heading">
              Roommate Meal Consumption Ledger
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust meals on the fly. Calculations react immediately.
            </p>
          </div>
          <span className="text-xs font-semibold text-foreground">
            Total Flat Meals: <strong className="text-primary">{totalMeals}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {members.map((member) => {
            const count = mealCounts[member.id] || 0;
            const cost = Math.round(count * mealRate);

            return (
              <div
                key={member.id}
                className="border border-border rounded-xs p-3.5 bg-background space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shrink-0">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                      <span>{member.name}</span>
                      {member.isCurrentUser && (
                        <span className="text-[9px] px-1 py-0.2 rounded-xs bg-secondary text-primary font-bold">
                          You
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">{member.roomName}</p>
                  </div>
                </div>

                {/* Counter Controls */}
                <div className="flex items-center justify-between bg-muted/40 p-2 rounded-xs border border-border">
                  <button
                    type="button"
                    onClick={() => onUpdateMealCount(member.id, Math.max(0, count - 1))}
                    className="w-7 h-7 rounded-xs bg-card border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                    title="Decrease 1 meal"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-center">
                    <span className="text-base font-bold font-mono text-foreground">{count}</span>
                    <span className="text-[10px] text-muted-foreground block -mt-0.5">meals</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateMealCount(member.id, count + 1)}
                    className="w-7 h-7 rounded-xs bg-card border border-border flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                    title="Increase 1 meal"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-muted-foreground">Mess Cost:</span>
                  <strong className="text-foreground font-mono">৳ {cost.toLocaleString()}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bazaar & Grocery Shopping Log */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground font-heading">
              Mess Bazaar & Grocery Shopping Log
            </h3>
            <p className="text-xs text-muted-foreground">
              Track who bought groceries, market locations, itemized receipts, and amounts paid.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddBazaar}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Log Mess Bazaar</span>
          </button>
        </div>

        {bazaarEntries.length === 0 ? (
          <div className="p-10 text-center bg-background border border-dashed border-border rounded-xs space-y-2">
            <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">No Bazaar Entries Yet</h4>
            <p className="text-xs text-muted-foreground">
              Add your first grocery shopping run to establish the flat&apos;s meal rate.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Market / Shop</th>
                    <th className="py-2.5 px-3">Items Purchased</th>
                    <th className="py-2.5 px-3">Paid By</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {bazaarEntries.map((entry) => {
                    const payer = getMemberById(entry.paidByMemberId);

                    return (
                      <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">
                          {entry.date}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-foreground inline-flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{entry.marketName}</span>
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <p className="text-foreground max-w-sm">{entry.description}</p>
                          {entry.items && entry.items.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.items.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.2 bg-secondary text-foreground rounded-xs border border-border"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
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

                        <td className="py-3 px-3 text-right font-bold text-foreground font-mono whitespace-nowrap">
                          ৳ {entry.amount.toLocaleString()}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onEditBazaar(entry)}
                              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xs transition-colors"
                              title="Edit Entry"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteBazaar(entry.id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xs transition-colors"
                              title="Delete Entry"
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
              {bazaarEntries.map((entry) => {
                const payer = getMemberById(entry.paidByMemberId);

                return (
                  <div
                    key={entry.id}
                    className="border border-border rounded-xs p-3.5 bg-background space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                          <Store className="w-3.5 h-3.5 text-primary" />
                          <span>{entry.marketName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>{entry.date}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold font-mono text-foreground">
                          ৳ {entry.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-foreground bg-muted/40 p-2 rounded-xs">
                      {entry.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>Paid by:</span>
                        <strong className="text-foreground">{payer?.name || "Unknown"}</strong>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditBazaar(entry)}
                          className="px-2 py-1 text-xs text-foreground bg-secondary hover:bg-secondary/80 rounded-xs transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteBazaar(entry.id)}
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
    </div>
  );
}
