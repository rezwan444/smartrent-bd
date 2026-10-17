"use client";

import { useState } from "react";
import {
  Wifi,
  Bath,
  Armchair,
  Sun,
  Users,
  Zap,
  ArrowUpDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  X,
} from "lucide-react";
import { PropertyFacility } from "@/types/property";
import { FACILITY_DEFINITIONS } from "@/lib/propertyFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppCheckbox } from "@/components/shared/AppCheckbox";

interface QuickFiltersProps {
  selectedFacilities: PropertyFacility[];
  onToggleFacility: (facility: PropertyFacility) => void;
  onlyVerified: boolean;
  onToggleVerified: () => void;
  genderPreference: "any" | "male_only" | "female_only" | "family_only";
  onChangeGenderPreference: (
    val: "any" | "male_only" | "female_only" | "family_only"
  ) => void;
  onClearAll: () => void;
  activeFilterCount: number;
}

const FACILITY_ICONS: Record<
  PropertyFacility,
  React.ComponentType<{ className?: string }>
> = {
  wifi: Wifi,
  attached_bath: Bath,
  furnished: Armchair,
  balcony: Sun,
  family_friendly: Users,
  generator: Zap,
  lift: ArrowUpDown,
  cctv: ShieldCheck,
  kitchen: Armchair,
};

export function QuickFilters({
  selectedFacilities,
  onToggleFacility,
  onlyVerified,
  onToggleVerified,
  genderPreference,
  onChangeGenderPreference,
  onClearAll,
  activeFilterCount,
}: QuickFiltersProps) {
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const primaryFacilities: PropertyFacility[] = [
    "wifi",
    "attached_bath",
    "furnished",
    "balcony",
    "family_friendly",
    "generator",
    "lift",
  ];

  return (
    <div className="bg-background border-b border-border py-3.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Quick Facility Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1 hidden sm:inline">
              Filters:
            </span>

            {primaryFacilities.map((facId) => {
              const def = FACILITY_DEFINITIONS.find((f) => f.id === facId);
              if (!def) return null;
              const isSelected = selectedFacilities.includes(facId);
              const Icon = FACILITY_ICONS[facId];

              return (
                <button
                  key={facId}
                  type="button"
                  onClick={() => onToggleFacility(facId)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary/30"
                  }`}
                  aria-pressed={isSelected}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{def.label}</span>
                  {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                </button>
              );
            })}

            {/* More Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
                onlyVerified || genderPreference !== "any" || showMoreFilters
                  ? "bg-secondary text-primary border-primary/40 font-semibold"
                  : "bg-card text-foreground border-border hover:bg-secondary/30"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
              {(onlyVerified || genderPreference !== "any") && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          </div>

          {/* Active Filter Clear Action */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:text-accent transition-colors shrink-0 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}
        </div>

        {/* More Filters Panel - Custom Radix Dropdown */}
        {showMoreFilters && (
          <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card p-4 rounded-xs border">
            {/* Custom Radix Select for Gender / Tenant Preference */}
            <div>
              <label
                htmlFor="gender-filter-select"
                className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider"
              >
                Tenant Category
              </label>
              <Select
                value={genderPreference}
                onValueChange={(val) =>
                  onChangeGenderPreference(
                    val as "any" | "male_only" | "female_only" | "family_only"
                  )
                }
              >
                <SelectTrigger
                  id="gender-filter-select"
                  className="w-full h-10 bg-background border-border text-xs text-foreground rounded-xs"
                >
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border rounded-xs shadow-md">
                  <SelectItem value="any">Open to Anyone (All Tenants)</SelectItem>
                  <SelectItem value="male_only">Male Students / Bachelors</SelectItem>
                  <SelectItem value="female_only">Female Students / Job Holders</SelectItem>
                  <SelectItem value="family_only">Family Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verified Badge Toggle using reusable AppCheckbox */}
            <div className="flex items-center">
              <AppCheckbox
                id="verified-listings-filter"
                checked={onlyVerified}
                onCheckedChange={() => onToggleVerified()}
                className="mt-4 sm:mt-0"
                label={
                  <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Verified Listings Only
                  </span>
                }
              />
            </div>

            {/* Done button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowMoreFilters(false)}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xs hover:bg-secondary/40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
