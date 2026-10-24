"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FlatMember } from "@/types/expense";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Scale,
  Sparkles,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface RoomWeightCalculatorProps {
  members: FlatMember[];
  initialRent?: number;
  onApplyWeightsToMembers?: (updatedMembers: FlatMember[]) => void;
}

export function RoomWeightCalculator({
  members,
  initialRent = 24000,
  onApplyWeightsToMembers,
}: RoomWeightCalculatorProps) {
  const [rentInput, setRentInput] = useState<string>(String(initialRent));
  const [customSizes, setCustomSizes] = useState<Record<string, number>>(
    Object.fromEntries(members.map((m) => [m.id, m.roomSizeSqFt]))
  );

  const totalRent = parseFloat(rentInput) || 0;
  const totalSqFt = Object.values(customSizes).reduce((sum, s) => sum + (s || 0), 0);
  const equalRent = members.length > 0 ? totalRent / members.length : 0;

  const comparison = members.map((m) => {
    const size = customSizes[m.id] || 0;
    const weightPercent = totalSqFt > 0 ? (size / totalSqFt) * 100 : 100 / members.length;
    const weightedRent = (totalRent * weightPercent) / 100;
    const difference = weightedRent - equalRent;

    return {
      ...m,
      currentSize: size,
      weightPercent: Math.round(weightPercent * 10) / 10,
      weightedRent: Math.round(weightedRent),
      equalRent: Math.round(equalRent),
      difference: Math.round(difference),
    };
  });

  const handleSizeChange = (memberId: string, val: string) => {
    const parsed = parseFloat(val) || 0;
    setCustomSizes((prev) => ({
      ...prev,
      [memberId]: parsed,
    }));
  };

  const handleApplyWeights = () => {
    if (!onApplyWeightsToMembers) return;
    const updated = members.map((m) => {
      const match = comparison.find((c) => c.id === m.id);
      return {
        ...m,
        roomSizeSqFt: customSizes[m.id] || m.roomSizeSqFt,
        rentWeightPercent: match ? Math.round(match.weightPercent) : m.rentWeightPercent,
      };
    });
    onApplyWeightsToMembers(updated);
    toast.success("Updated room square footage & rent weights applied to household!");
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground font-heading">
                Fair Rent Distribution by Room Size (Optional Tool)
              </h2>
              <p className="text-xs text-muted-foreground">
                Optional calculator to compute square footage ratios. Standard equal split remains the default.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="flat-rent-input" className="text-xs font-semibold whitespace-nowrap">
                Base Rent:
              </Label>
              <div className="relative w-32">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                  ৳
                </span>
                <Input
                  id="flat-rent-input"
                  type="number"
                  min="1000"
                  step="500"
                  value={rentInput}
                  onChange={(e) => setRentInput(e.target.value)}
                  className="h-8 pl-6 text-xs font-bold font-mono"
                />
              </div>
            </div>

            {onApplyWeightsToMembers && (
              <button
                type="button"
                onClick={handleApplyWeights}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Apply Weights to Members</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-secondary/30 rounded-xs border border-border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              1. Measure Bedroom Sq Ft
            </span>
            <p className="text-[11px] text-muted-foreground">
              Calculate length × width for each room. Total bedroom area = {totalSqFt} sq ft.
            </p>
          </div>

          <div className="p-3 bg-secondary/30 rounded-xs border border-border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
              2. Weight Formulation
            </span>
            <p className="text-[11px] text-muted-foreground">
              Weight % = (Individual Room Sq Ft ÷ Total Flat Bedroom Sq Ft) × 100%.
            </p>
          </div>

          <div className="p-3 bg-secondary/30 rounded-xs border border-border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              3. Transparent Negotiation
            </span>
            <p className="text-[11px] text-muted-foreground">
              Master bed with attached bath/balcony pays fair premium over smaller rooms.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground font-heading">
              Equal Split vs Room-Area Weighted Rent
            </h3>
            <p className="text-xs text-muted-foreground">
              See the exact difference between splitting equally (৳ {Math.round(equalRent).toLocaleString()}/person) vs proportional sq ft.
            </p>
          </div>
          <span className="text-xs font-semibold text-foreground">
            Total Flat Area: <strong className="text-primary">{totalSqFt} sq ft</strong>
          </span>
        </div>

        {/* Desktop Comparison Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Roommate</th>
                <th className="py-2.5 px-3">Room Name</th>
                <th className="py-2.5 px-3 w-32">Room Size (Sq Ft)</th>
                <th className="py-2.5 px-3 text-right">Area Ratio</th>
                <th className="py-2.5 px-3 text-right">Equal Share</th>
                <th className="py-2.5 px-3 text-right">Weighted Share</th>
                <th className="py-2.5 px-3 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {comparison.map((row) => {
                const isPremium = row.difference > 0;
                const isDiscount = row.difference < 0;

                return (
                  <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border shrink-0">
                          <Image
                            src={row.avatar}
                            alt={row.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="font-semibold text-foreground">{row.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-muted-foreground">{row.roomName}</td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 w-24">
                        <Input
                          type="number"
                          min="50"
                          step="5"
                          value={row.currentSize}
                          onChange={(e) => handleSizeChange(row.id, e.target.value)}
                          className="h-7 text-xs font-mono"
                        />
                        <span className="text-[11px] text-muted-foreground">sqft</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-foreground">
                      {row.weightPercent}%
                    </td>

                    <td className="py-3 px-3 text-right text-muted-foreground font-mono">
                      ৳ {row.equalRent.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-foreground font-mono">
                      ৳ {row.weightedRent.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xs text-[11px] font-bold ${
                          isPremium
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : isDiscount
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isPremium
                          ? `+ ৳ ${row.difference.toLocaleString()} (Premium)`
                          : isDiscount
                          ? `- ৳ ${Math.abs(row.difference).toLocaleString()} (Discount)`
                          : "৳ 0"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {comparison.map((row) => {
            const isPremium = row.difference > 0;
            const isDiscount = row.difference < 0;

            return (
              <div
                key={row.id}
                className="border border-border rounded-xs p-3.5 bg-background space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-border shrink-0">
                      <Image
                        src={row.avatar}
                        alt={row.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">{row.name}</div>
                      <div className="text-[10px] text-muted-foreground">{row.roomName}</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-xs bg-secondary text-primary">
                    {row.weightPercent}% Area
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 py-1 border-t border-b border-border/40 text-xs">
                  <span className="text-muted-foreground">Room Area:</span>
                  <div className="flex items-center gap-1.5 w-24">
                    <Input
                      type="number"
                      min="50"
                      step="5"
                      value={row.currentSize}
                      onChange={(e) => handleSizeChange(row.id, e.target.value)}
                      className="h-7 text-xs font-mono"
                    />
                    <span className="text-[11px] text-muted-foreground">sqft</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Equal Split:</span>
                    <span className="text-muted-foreground font-mono">৳ {row.equalRent.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[11px] block">Fair Weighted Rent:</span>
                    <strong className="text-foreground font-mono">৳ {row.weightedRent.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="pt-1 text-[11px]">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-xs font-semibold ${
                      isPremium
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        : isDiscount
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isPremium ? `+ ৳ ${row.difference.toLocaleString()} vs equal` : isDiscount ? `- ৳ ${Math.abs(row.difference).toLocaleString()} vs equal` : "৳ 0"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
