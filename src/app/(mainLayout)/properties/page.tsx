"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Building2,
  Filter,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import { PropertyCard } from "@/components/dashboard/pages/admin/AdminHome/PropertyCard";
import { AppSelect, type AppSelectOption } from "@/components/shared/AppSelect";
import type {
  IProperty,
  PropertyType,
  PropertyFacility,
  PropertySortOption,
} from "@/types/property";

const FACILITIES_LIST: { id: PropertyFacility; label: string }[] = [
  { id: "wifi", label: "WiFi" },
  { id: "attached_bath", label: "Attached Bath" },
  { id: "furnished", label: "Furnished" },
  { id: "balcony", label: "Balcony" },
  { id: "generator", label: "Generator / IPS" },
  { id: "lift", label: "Lift" },
  { id: "cctv", label: "CCTV" },
  { id: "kitchen", label: "Kitchen" },
];

function PropertiesContent() {
  const searchParams = useSearchParams();

  // Filters state initialized from URL search params
  const [query, setQuery] = useState(searchParams.get("query") || searchParams.get("q") || "");
  const [propertyType, setPropertyType] = useState<PropertyType | "all">(
    (searchParams.get("type") as PropertyType) || "all"
  );
  const [minRent, setMinRent] = useState<string>(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState<string>(searchParams.get("maxRent") || "");
  const [selectedFacilities, setSelectedFacilities] = useState<PropertyFacility[]>(() => {
    const f = searchParams.get("facilities");
    return f ? (f.split(",") as PropertyFacility[]) : [];
  });
  const [onlyVerified, setOnlyVerified] = useState(searchParams.get("verified") === "true");
  const [genderPreference, setGenderPreference] = useState(searchParams.get("gender") || "any");
  const [sortBy, setSortBy] = useState<PropertySortOption>(
    (searchParams.get("sortBy") as PropertySortOption) || "recommended"
  );
  const [page, setPage] = useState<number>(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });

  const [properties, setProperties] = useState<IProperty[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params without calling setState synchronously in effect body
  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("query", query.trim());
        if (propertyType !== "all") params.set("type", propertyType);
        if (minRent) params.set("minBudget", minRent);
        if (maxRent) params.set("maxBudget", maxRent);
        if (selectedFacilities.length > 0) params.set("facilities", selectedFacilities.join(","));
        if (onlyVerified) params.set("verified", "true");
        if (genderPreference !== "any") params.set("genderPreference", genderPreference);
        params.set("sortBy", sortBy);
        params.set("page", String(page));
        params.set("limit", "12");

        const res = await fetch(`/api/properties?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load properties.");

        const json = await res.json();
        if (!ignore && json.success) {
          setProperties(json.data || []);
          if (json.meta) {
            setTotalPages(json.meta.totalPages || 1);
            setTotalCount(json.meta.total || 0);
          } else {
            setTotalCount(json.data?.length || 0);
            setTotalPages(1);
          }
          setIsFallback(Boolean(json.isFallback));
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Fetch properties error:", err);
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [query, propertyType, minRent, maxRent, selectedFacilities, onlyVerified, genderPreference, sortBy, page]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setIsLoading(true);
  };

  const toggleFacility = (facility: PropertyFacility) => {
    setPage(1);
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleClearAll = () => {
    setQuery("");
    setPropertyType("all");
    setMinRent("");
    setMaxRent("");
    setSelectedFacilities([]);
    setOnlyVerified(false);
    setGenderPreference("any");
    setSortBy("recommended");
    setPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (query) count++;
    if (propertyType !== "all") count++;
    if (minRent || maxRent) count++;
    if (selectedFacilities.length > 0) count += selectedFacilities.length;
    if (onlyVerified) count++;
    if (genderPreference !== "any") count++;
    return count;
  }, [query, propertyType, minRent, maxRent, selectedFacilities, onlyVerified, genderPreference]);

  const propertyTypeOptions: AppSelectOption[] = [
    { value: "all", label: "All Property Types" },
    { value: "room", label: "Single Rooms (Sublet)" },
    { value: "flat", label: "Full Flats / Apartments" },
    { value: "mess", label: "Bachelor Mess Seats" },
    { value: "hostel", label: "Student Hostels" },
  ];

  const sortOptions: AppSelectOption[] = [
    { value: "recommended", label: "Recommended (Verified First)" },
    { value: "price_asc", label: "Rent: Low to High" },
    { value: "price_desc", label: "Rent: High to Low" },
    { value: "newest", label: "Newest Listings" },
  ];

  const genderOptions: AppSelectOption[] = [
    { value: "any", label: "All Gender Policies" },
    { value: "male_only", label: "Male Students Only" },
    { value: "female_only", label: "Female Students Only" },
    { value: "family_only", label: "Family Only" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-xs p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
                <Building2 className="w-3.5 h-3.5" />
                <span>Student Rental Directory</span>
              </span>
              {isFallback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <span>Curated Sample Listings</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
              Verified Student Accommodations
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Browse student sublets, bachelor messes, family flats, and hostels verified for safety and zero broker fees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-secondary text-foreground border border-border rounded-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>Filters ({activeFiltersCount})</span>
          </button>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by neighborhood (Banasree, Mirpur, Dhanmondi, Bogura) or title..."
              className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                  setIsLoading(true);
                }}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Main Layout Grid: Filters Sidebar + Property Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <div
          className={`space-y-5 bg-card border border-border rounded-xs p-5 shadow-2xs ${
            showMobileFilters ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-foreground">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-mono">
                  {activeFiltersCount}
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-primary hover:underline font-semibold cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Property Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Accommodation Type</label>
            <AppSelect
              value={propertyType}
              options={propertyTypeOptions}
              onValueChange={(val) => {
                setPropertyType(val as PropertyType | "all");
                setPage(1);
              }}
            />
          </div>

          {/* Monthly Budget Range */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Monthly Rent (BDT)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ৳"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                onBlur={() => {
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground"
              />
              <input
                type="number"
                placeholder="Max ৳"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                onBlur={() => {
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground"
              />
            </div>
          </div>

          {/* Gender Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Gender Policy</label>
            <AppSelect
              value={genderPreference}
              options={genderOptions}
              onValueChange={(val) => {
                setGenderPreference(val);
                setPage(1);
              }}
            />
          </div>

          {/* Verified Only Toggle */}
          <div className="pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setOnlyVerified(!onlyVerified);
                setPage(1);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xs border transition-colors cursor-pointer ${
                onlyVerified
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "bg-background border-border text-foreground hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">Verified Landlord Only</span>
              </div>
              <div
                className={`w-4 h-4 rounded-2xs border flex items-center justify-center ${
                  onlyVerified ? "bg-emerald-600 border-emerald-600 text-white" : "border-muted-foreground"
                }`}
              >
                {onlyVerified && <CheckCircle2 className="w-3 h-3" />}
              </div>
            </button>
          </div>

          {/* Facilities Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-foreground">Facilities & Amenities</label>
            <div className="space-y-1.5">
              {FACILITIES_LIST.map((fac) => {
                const isChecked = selectedFacilities.includes(fac.id);
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => toggleFacility(fac.id)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-2xs text-left text-xs transition-colors cursor-pointer ${
                      isChecked
                        ? "bg-secondary text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{fac.label}</span>
                    <div
                      className={`w-3.5 h-3.5 rounded-2xs border flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-primary border-primary text-white" : "border-border"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Property Grid Results Section */}
        <div className="lg:col-span-3 space-y-4">
          {/* Results Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card border border-border rounded-xs px-4 py-3 shadow-2xs">
            <p className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{properties.length}</strong> of{" "}
              <strong className="text-foreground">{totalCount}</strong> verified accommodations
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground shrink-0">Sort by:</span>
              <div className="w-48">
                <AppSelect
                  value={sortBy}
                  options={sortOptions}
                  onValueChange={(val) => {
                    setSortBy(val as PropertySortOption);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Content States */}
          {isLoading ? (
            <div className="py-24 text-center border border-border rounded-xs bg-card space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Loading verified accommodation listings...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border rounded-xs bg-card space-y-4 p-6">
              <div className="w-12 h-12 rounded-full bg-secondary text-primary mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">No Accommodations Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  We could not find any active verified listings matching your specific search filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-border">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xs border border-border hover:bg-secondary disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-xs text-muted-foreground">
                Page <strong className="text-foreground">{page}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong>
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-xs border border-border hover:bg-secondary disabled:opacity-40 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertiesDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      }
    >
      <PropertiesContent />
    </Suspense>
  );
}
