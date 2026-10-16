"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { IProperty, PropertySortOption } from "@/types/property";
import { PropertyCard } from "./PropertyCard";
import { EmptyResults } from "./EmptyResults";
import { PropertyDetailsModal } from "./PropertyDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropertyGridProps {
  properties: IProperty[];
  totalCount: number;
  sortOption: PropertySortOption;
  onSortChange: (newSort: PropertySortOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  activeLocation?: string;
}

const SORT_OPTIONS: { value: PropertySortOption; label: string; bangla: string }[] = [
  { value: "recommended", label: "Recommended", bangla: "প্রস্তাবিত" },
  { value: "price_asc", label: "Rent: Low to High", bangla: "কম ভাড়া আগে" },
  { value: "price_desc", label: "Rent: High to Low", bangla: "বেশি ভাড়া আগে" },
  { value: "newest", label: "Newest Listings", bangla: "নতুন যুক্ত হওয়া" },
];

export function PropertyGrid({
  properties,
  totalCount,
  sortOption,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  activeLocation,
}: PropertyGridProps) {
  const [selectedProperty, setSelectedProperty] = useState<IProperty | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("smartrent_favorites");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const handleViewDetails = (property: IProperty) => {
    setSelectedProperty(property);
    setIsDetailsOpen(true);
  };

  const handleToggleFavorite = (propertyId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("smartrent_favorites", JSON.stringify(updated));
        } catch {
          // ignore storage error
        }
      }
      return updated;
    });
  };

  return (
    <section id="explore" className="py-10 sm:py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Exact Alignment */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-border">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Places worth exploring
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalCount === 0 ? (
                "কোন বাসা বা মেস খুঁজে পাওয়া যায়নি"
              ) : (
                <>
                  মোট{" "}
                  <span className="font-semibold text-foreground">
                    {totalCount}
                  </span>{" "}
                  টি লিস্টিং পাওয়া গেছে
                  {activeLocation ? ` (“${activeLocation}” এলাকায়)` : ""}
                </>
              )}
            </p>
          </div>

          {/* Custom Radix Sort Dropdown (NO NATIVE SELECT) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>বাছাই (Sort):</span>
            </span>
            <div className="w-full sm:w-auto min-w-[200px] sm:min-w-[245px] flex-1 sm:flex-initial">
              <Select
                value={sortOption}
                onValueChange={(val) => onSortChange(val as PropertySortOption)}
              >
                <SelectTrigger
                  id="sort-select-trigger"
                  className="h-10 w-full bg-card border-border rounded-xs text-xs sm:text-sm font-medium text-foreground hover:border-primary/40"
                >
                  <SelectValue placeholder="Sort listings" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border rounded-xs shadow-md">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-[11px] text-muted-foreground ml-1.5 whitespace-nowrap">
                        ({opt.bangla})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Grid or Empty State */}
        <div className="mt-7">
          {properties.length === 0 ? (
            <EmptyResults
              onClearFilters={onClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onViewDetails={handleViewDetails}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </section>
  );
}
