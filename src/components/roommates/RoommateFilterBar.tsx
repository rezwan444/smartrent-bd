"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, RotateCcw, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";

export interface RoommateFiltersState {
  searchQuery: string;
  university: string;
  gender: string;
  maxBudget: string;
  sleepSchedule: string;
  smokingHabit: string;
  studyEnvironment: string;
  cleanliness: string;
  sortBy: string;
}

interface RoommateFilterBarProps {
  filters: RoommateFiltersState;
  onFilterChange: (filters: RoommateFiltersState) => void;
  onResetFilters: () => void;
  onOpenPreferences: () => void;
  activeFilterCount: number;
}

export function RoommateFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onOpenPreferences,
  activeFilterCount,
}: RoommateFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof RoommateFiltersState, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-card border border-border rounded-xs p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Search Input & Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            placeholder="Search by student name, university, department, or zone (e.g. PUB, Bogura, DU, Nilkhet)..."
            className="pl-10 h-10 text-xs sm:text-sm rounded-xs bg-background border-border"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Advanced Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
              showAdvanced || activeFilterCount > 0
                ? "bg-secondary text-primary border-primary/30"
                : "bg-background text-foreground border-border hover:bg-secondary/50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xs transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}

          {/* Compare Baseline Habit Button */}
          <button
            type="button"
            onClick={onOpenPreferences}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 border border-primary/20 rounded-xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>My Habits</span>
          </button>
        </div>
      </div>

      {/* Primary Quick Filter Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            University
          </label>
          <AppSelect
            value={filters.university}
            onValueChange={(val) => updateFilter("university", val)}
            options={[
              { value: "all", label: "All Universities" },
              { value: "pub", label: "Pundro University of Science & Technology (PUB), Bogura" },
              { value: "ahc", label: "Govt. Azizul Haque College (Bogura)" },
              { value: "du", label: "University of Dhaka (DU)" },
              { value: "buet", label: "BUET" },
              { value: "ewu", label: "East West Univ (EWU)" },
              { value: "nsu", label: "North South Univ (NSU)" },
              { value: "brac", label: "Brac University" },
              { value: "dmc", label: "Dhaka Medical (DMC)" },
              { value: "iub", label: "IUB" },
            ]}
            triggerClassName="h-9 text-xs"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Looking For
          </label>
          <AppSelect
            value={filters.gender}
            onValueChange={(val) => updateFilter("gender", val)}
            options={[
              { value: "all", label: "All Roommates" },
              { value: "male", label: "Male Students Only" },
              { value: "female", label: "Female Students Only" },
            ]}
            triggerClassName="h-9 text-xs"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Max Seat Budget
          </label>
          <AppSelect
            value={filters.maxBudget}
            onValueChange={(val) => updateFilter("maxBudget", val)}
            options={[
              { value: "all", label: "Any Budget" },
              { value: "4500", label: "Up to ৳4,500/mo" },
              { value: "6500", label: "Up to ৳6,500/mo" },
              { value: "8500", label: "Up to ৳8,500/mo" },
              { value: "10000", label: "Up to ৳10,000/mo" },
            ]}
            triggerClassName="h-9 text-xs"
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-muted-foreground block mb-1">
            Sort Order
          </label>
          <AppSelect
            value={filters.sortBy}
            onValueChange={(val) => updateFilter("sortBy", val)}
            options={[
              { value: "compatibility", label: "Highest Compatibility" },
              { value: "budget_asc", label: "Budget: Low to High" },
              { value: "budget_desc", label: "Budget: High to Low" },
              { value: "name_asc", label: "Name: A to Z" },
            ]}
            triggerClassName="h-9 text-xs"
          />
        </div>
      </div>

      {/* Advanced Lifestyle Filters (Collapsible) */}
      {showAdvanced && (
        <div className="pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Sleep Schedule
            </label>
            <AppSelect
              value={filters.sleepSchedule}
              onValueChange={(val) => updateFilter("sleepSchedule", val)}
              options={[
                { value: "all", label: "Any Routine" },
                { value: "early_bird", label: "Early Bird (< 11 PM)" },
                { value: "moderate", label: "Moderate (11 PM - 1 AM)" },
                { value: "night_owl", label: "Night Owl (> 1 AM)" },
              ]}
              triggerClassName="h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Smoking Habit
            </label>
            <AppSelect
              value={filters.smokingHabit}
              onValueChange={(val) => updateFilter("smokingHabit", val)}
              options={[
                { value: "all", label: "Any Habit" },
                { value: "non_smoker", label: "Strict Non-Smoker" },
                { value: "outside_only", label: "Outside / Balcony" },
              ]}
              triggerClassName="h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Study Environment
            </label>
            <AppSelect
              value={filters.studyEnvironment}
              onValueChange={(val) => updateFilter("studyEnvironment", val)}
              options={[
                { value: "all", label: "Any Environment" },
                { value: "silent", label: "Quiet / Silent Study" },
                { value: "ambient_music", label: "Soft Music" },
                { value: "group_friendly", label: "Group Discussions" },
              ]}
              triggerClassName="h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground block mb-1">
              Cleanliness
            </label>
            <AppSelect
              value={filters.cleanliness}
              onValueChange={(val) => updateFilter("cleanliness", val)}
              options={[
                { value: "all", label: "Any Cleanliness" },
                { value: "strict", label: "Strict / Daily" },
                { value: "moderate", label: "Moderate / Weekly" },
              ]}
              triggerClassName="h-9 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
