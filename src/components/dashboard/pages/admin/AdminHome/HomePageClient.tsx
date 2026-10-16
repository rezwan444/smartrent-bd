"use client";

import { Footer } from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { MOCK_PROPERTIES } from "@/data/mockProperties";
import { filterProperties, sortProperties } from "@/lib/propertyFilters";
import {
  PropertyFacility,
  PropertyFilterCriteria,
  PropertySortOption,
  PropertyType,
} from "@/types/property";
import { useMemo, useState } from "react";
import { HeroSearch } from "./HeroSearch";
import { HowItWorks } from "./HowItWorks";
import { PropertyGrid } from "./PropertyGrid";
import { QuickFilters } from "./QuickFilters";
import { RoommateTeaser } from "./RoommateTeaser";

export function HomePageClient() {
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

    const filtered = filterProperties(MOCK_PROPERTIES, criteria);
    return sortProperties(filtered, sortOption);
  }, [
    location,
    propertyType,
    minBudget,
    maxBudget,
    selectedFacilities,
    genderPreference,
    onlyVerified,
    sortOption,
  ]);

  const scrollToExplore = () => {
    const el = document.getElementById("explore");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Section A: Site Navigation */}
      <Navbar onFindPlaceClick={scrollToExplore} />

      <main className="flex-1">
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
      </main>

      {/* Section G: Footer */}
      <Footer onLocationSelect={(loc) => setLocation(loc)} />
    </div>
  );
}
