"use client";

import { SearchX, RotateCcw } from "lucide-react";

interface EmptyResultsProps {
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function EmptyResults({
  onClearFilters,
  hasActiveFilters,
}: EmptyResultsProps) {
  return (
    <div className="py-14 px-4 text-center bg-card border border-border rounded-sm max-w-xl mx-auto my-6">
      <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center mx-auto mb-3.5">
        <SearchX className="w-5 h-5" />
      </div>

      <h3 className="text-base font-semibold text-foreground">
        No properties found matching your criteria
      </h3>

      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        Try adjusting your budget range, selecting fewer amenity filters, or searching for nearby areas across Dhaka and Bogura.
      </p>

      {hasActiveFilters && (
        <div className="mt-5">
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}
