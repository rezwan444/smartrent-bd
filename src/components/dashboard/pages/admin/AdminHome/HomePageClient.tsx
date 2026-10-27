"use client";

import { filterProperties, sortProperties } from "@/lib/propertyFilters";
import {
  PropertyFacility,
  PropertyFilterCriteria,
  PropertySortOption,
  PropertyType,
  IProperty,
} from "@/types/property";
import { getAllPublicProperties } from "@/lib/propertyModerationStorage";
import { useEffect, useMemo, useState } from "react";
import { HeroSearch } from "./HeroSearch";
import { HowItWorks } from "./HowItWorks";
import { PropertyGrid } from "./PropertyGrid";
import { QuickFilters } from "./QuickFilters";
import { RoommateTeaser } from "./RoommateTeaser";

export function HomePageClient() {
  // Smooth scroll to target hash section if navigated from another page
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Public non-scam, approved listings state (Track C3 Rule 8: Hidden listings excluded)
  const [publicListings, setPublicListings] = useState<IProperty[]>(() =>
    getAllPublicProperties()
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProperties() {
      try {
        const res = await fetch("/api/properties?limit=50");
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPublicListings(json.data as IProperty[]);
        }
      } catch {
        // Keep initial mock listings if network/database is unavailable
      }
    }

    loadProperties();

    const handleUpdate = () => {
      setPublicListings(getAllPublicProperties());
      loadProperties();
    };
    window.addEventListener("smartrent_moderation_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("smartrent_moderation_updated", handleUpdate);
    };
  }, []);

  // Search state
  const [location, setLocation] = useState<string>("");
  const [propertyType, setPropertyType] = useState<PropertyType | "all">("all");
  const [minBudget, setMinBudget] = useState<number | null>(null);
  const [maxBudget, setMaxBudget] = useState<number | null>(null);

  // Quick filters state
  const [selectedFacilities, setSelectedFacilities] = useState<
    PropertyFacility[]
  >([]);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [genderPreference, setGenderPreference] = useState<
    "any" | "male_only" | "female_only" | "family_only"
  >("any");

  // Sorting state
  const [sortOption, setSortOption] =
    useState<PropertySortOption>("recommended");

  // Toggle single facility
  const handleToggleFacility = (facility: PropertyFacility) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  // Toggle verified filter
  const handleToggleVerified = () => {
    setOnlyVerified((prev) => !prev);
  };

  // Handle Search Submission from Hero
  const handleHeroSearch = (params: {
    location: string;
    type: PropertyType | "all";
    minBudget: number | null;
    maxBudget: number | null;
  }) => {
    setLocation(params.location);
    setPropertyType(params.type);
    setMinBudget(params.minBudget);
    setMaxBudget(params.maxBudget);
  };

  // Clear all filters action
  const handleClearAll = () => {
    setLocation("");
    setPropertyType("all");
    setMinBudget(null);
    setMaxBudget(null);
    setSelectedFacilities([]);
    setOnlyVerified(false);
    setGenderPreference("any");
    setSortOption("recommended");
  };

  // Calculate active filter count
  const activeFilterCount =
    (location ? 1 : 0) +
    (propertyType !== "all" ? 1 : 0) +
    (minBudget ? 1 : 0) +
    (maxBudget ? 1 : 0) +
    selectedFacilities.length +
    (onlyVerified ? 1 : 0) +
    (genderPreference !== "any" ? 1 : 0);

  // Compute filtered & sorted properties
  const filteredProperties = useMemo(() => {
    const criteria: PropertyFilterCriteria = {
      query: location,
      propertyType,
      minBudget,
      maxBudget,
      facilities: selectedFacilities,
      genderPreference,
      onlyVerified,
    };

    const filtered = filterProperties(publicListings, criteria);
    return sortProperties(filtered, sortOption);
  }, [
    publicListings,
    location,
    propertyType,
    minBudget,
    maxBudget,
    selectedFacilities,
    genderPreference,
    onlyVerified,
    sortOption,
  ]);

  return (
    <div className="w-full">
      {/* Section B: Hero & Search Form */}
      <HeroSearch
        initialLocation={location}
        initialType={propertyType}
        initialMinRent={minBudget}
        initialMaxRent={maxBudget}
        onSearch={handleHeroSearch}
      />

      {/* Section C: Quick Facility & Attribute Filters */}
      <QuickFilters
        selectedFacilities={selectedFacilities}
        onToggleFacility={handleToggleFacility}
        onlyVerified={onlyVerified}
        onToggleVerified={handleToggleVerified}
        genderPreference={genderPreference}
        onChangeGenderPreference={setGenderPreference}
        onClearAll={handleClearAll}
        activeFilterCount={activeFilterCount}
      />

      {/* Section D & E: Places Worth Exploring Results Grid & Cards */}
      <PropertyGrid
        properties={filteredProperties}
        totalCount={filteredProperties.length}
        sortOption={sortOption}
        onSortChange={setSortOption}
        onClearFilters={handleClearAll}
        hasActiveFilters={activeFilterCount > 0}
        activeLocation={location}
      />

      {/* Supporting Section: Roommate Matching Teaser */}
      <RoommateTeaser />

      {/* Supporting Section: How It Works */}
      <HowItWorks />
    </div>
  );
}
