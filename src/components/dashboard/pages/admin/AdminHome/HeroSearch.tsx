"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Sparkles,
  ChevronDown,
  CircleDollarSign,
  Check,
} from "lucide-react";
import { PropertyType } from "@/types/property";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeroSearchProps {
  initialLocation?: string;
  initialType?: PropertyType | "all";
  initialMinRent?: number | null;
  initialMaxRent?: number | null;
  onSearch: (params: {
    location: string;
    type: PropertyType | "all";
    minBudget: number | null;
    maxBudget: number | null;
  }) => void;
}

const PROPERTY_TYPES: { value: PropertyType | "all"; label: string; bangla: string }[] = [
  { value: "all", label: "All Types", bangla: "সকল প্রকার" },
  { value: "room", label: "Single / Sublet Room", bangla: "রুম / সাবলেট" },
  { value: "mess", label: "Student / Bachelor Mess", bangla: "মেস সিট" },
  { value: "flat", label: "Residential Flat", bangla: "সম্পূর্ণ ফ্ল্যাট" },
  { value: "hostel", label: "Student Hostel", bangla: "হোস্টেল সিট" },
];

const BUDGET_PRESETS = [
  { label: "যেকোনো বাজেট (Any Budget)", min: null, max: null },
  { label: "৳ ৫,০০০ এর নিচে (Below ৳5k)", min: null, max: 5000 },
  { label: "৳ ৫,০০০ – ৳ ১০,০০০", min: 5000, max: 10000 },
  { label: "৳ ১০,০০০ – ৳ ২০,০০০", min: 10000, max: 20000 },
  { label: "৳ ২০,০০০ এর উপরে (৳20k+)", min: 20000, max: null },
];

const POPULAR_LOCATIONS = [
  { label: "Bogura (সাতমাথা/কলেজ)", value: "Bogura" },
  { label: "Joleshwaritola, Bogura", value: "Joleshwaritola" },
  { label: "Banasree, Dhaka", value: "Banasree" },
  { label: "Mirpur, Dhaka", value: "Mirpur" },
  { label: "Mohammadpur, Dhaka", value: "Mohammadpur" },
  { label: "Farmgate, Dhaka", value: "Farmgate" },
  { label: "Uttara, Dhaka", value: "Uttara" },
  { label: "Bashundhara R/A", value: "Bashundhara" },
];

export function HeroSearch({
  initialLocation = "",
  initialType = "all",
  initialMinRent = null,
  initialMaxRent = null,
  onSearch,
}: HeroSearchProps) {
  const [location, setLocation] = useState(initialLocation);
  const [propertyType, setPropertyType] = useState<PropertyType | "all">(initialType);
  const [minBudget, setMinBudget] = useState<number | null>(initialMinRent);
  const [maxBudget, setMaxBudget] = useState<number | null>(initialMaxRent);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);

  // Local draft inputs for custom range
  const [customMin, setCustomMin] = useState(minBudget ? String(minBudget) : "");
  const [customMax, setCustomMax] = useState(maxBudget ? String(maxBudget) : "");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    onSearch({
      location: location.trim(),
      type: propertyType,
      minBudget,
      maxBudget,
    });

    const exploreSection = document.getElementById("explore");
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleApplyCustomBudget = () => {
    const minVal = customMin.trim() ? Number(customMin) : null;
    const maxVal = customMax.trim() ? Number(customMax) : null;

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setMinBudget(maxVal);
      setMaxBudget(minVal);
    } else {
      setMinBudget(minVal);
      setMaxBudget(maxVal);
    }

    setIsBudgetOpen(false);
  };

  const handleSelectPreset = (presetMin: number | null, presetMax: number | null) => {
    setMinBudget(presetMin);
    setMaxBudget(presetMax);
    setCustomMin(presetMin ? String(presetMin) : "");
    setCustomMax(presetMax ? String(presetMax) : "");
    setIsBudgetOpen(false);
  };

  const handleResetBudget = () => {
    setMinBudget(null);
    setMaxBudget(null);
    setCustomMin("");
    setCustomMax("");
    setIsBudgetOpen(false);
  };

  const handleQuickLocation = (locVal: string) => {
    setLocation(locVal);
    onSearch({
      location: locVal,
      type: propertyType,
      minBudget,
      maxBudget,
    });

    const exploreSection = document.getElementById("explore");
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Get human-readable budget trigger label
  const getBudgetLabel = () => {
    if (!minBudget && !maxBudget) return "যেকোনো বাজেট (Any)";
    if (minBudget && maxBudget) {
      return `৳ ${minBudget.toLocaleString()} – ৳ ${maxBudget.toLocaleString()}`;
    }
    if (minBudget && !maxBudget) {
      return `৳ ${minBudget.toLocaleString()}+`;
    }
    if (!minBudget && maxBudget) {
      return `সর্বোচ্চ ৳ ${maxBudget.toLocaleString()}`;
    }
    return "যেকোনো বাজেট";
  };

  return (
    <section className="bg-background border-b border-border pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Block */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-secondary border border-primary/15 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>বাংলাদেশি শিক্ষার্থী ও মেস আবাসন পোর্টাল</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-foreground leading-tight font-heading">
            Find a place that feels like home.
          </h1>

          <p className="mt-2.5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            ঢাকা, বগুড়া ও বিভাগীয় শহরের শিক্ষার্থী ও চাকরিজীবীদের জন্য রুম, মেস সিট, হোস্টেল এবং বাসা খোঁজার নির্ভরযোগ্য ঠিকানা।
          </p>
        </div>

        {/* Master Search Bar Container */}
        <div className="mt-8 bg-card border border-border rounded-xs shadow-xs p-4 sm:p-5">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
              {/* 1. Location Input */}
              <div className="md:col-span-4 flex flex-col justify-end">
                <label
                  htmlFor="search-location"
                  className="h-5 flex items-center text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
                >
                  এলাকা বা শহর (Area / City)
                </label>
                <div className="relative h-11">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="search-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="যেমন: বগুড়া, সাতমাথা, বনশ্রী, Mirpur..."
                    className="w-full h-11 box-border pl-9 pr-3 text-sm text-foreground bg-background border border-border rounded-xs focus:outline-hidden focus:ring-2 focus:ring-ring transition-colors placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* 2. Property Type Select (Radix UI) */}
              <div className="md:col-span-3 flex flex-col justify-end">
                <label
                  htmlFor="property-type-selector"
                  className="h-5 flex items-center text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
                >
                  আবাসন ধরণ (Property Type)
                </label>
                <div className="h-11">
                  <Select
                    value={propertyType}
                    onValueChange={(val) => setPropertyType(val as PropertyType | "all")}
                  >
                    <SelectTrigger
                      id="property-type-selector"
                      className="w-full h-11 box-border bg-background border-border rounded-xs text-sm text-foreground hover:border-primary/40 focus:ring-2 focus:ring-ring"
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border rounded-xs shadow-lg">
                      {PROPERTY_TYPES.map((pt) => (
                        <SelectItem key={pt.value} value={pt.value}>
                          <div className="flex items-baseline justify-between w-full gap-3">
                            <span className="font-medium">{pt.label}</span>
                            <span className="text-xs text-muted-foreground">({pt.bangla})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 3. Unified Budget Selector (Radix Popover) */}
              <div className="md:col-span-3 flex flex-col justify-end">
                <label className="h-5 flex items-center text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  মাসিক বাজেট (Monthly Rent)
                </label>
                <div className="h-11">
                  <Popover open={isBudgetOpen} onOpenChange={setIsBudgetOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="w-full h-11 box-border px-3 bg-background border border-border hover:border-primary/40 rounded-xs flex items-center justify-between text-sm text-foreground transition-colors cursor-pointer outline-hidden focus:ring-2 focus:ring-ring"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CircleDollarSign className="w-4 h-4 text-primary shrink-0" />
                          <span className="truncate font-medium">{getBudgetLabel()}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 opacity-70" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      avoidCollisions={false}
                      className="w-[calc(100vw-2.5rem)] sm:w-80 max-w-sm p-4 bg-popover border border-border rounded-xs shadow-xl space-y-3.5 z-50"
                    >
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                          বাজেট পছন্দ করুন (Select Range)
                        </h4>
                        <div className="space-y-1">
                          {BUDGET_PRESETS.map((preset, idx) => {
                            const isSelected =
                              minBudget === preset.min && maxBudget === preset.max;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectPreset(preset.min, preset.max)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xs text-left transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-secondary text-primary font-semibold"
                                    : "hover:bg-background text-foreground"
                                }`}
                              >
                                <span>{preset.label}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border space-y-2.5">
                        <p className="text-[11px] font-semibold uppercase text-muted-foreground">
                          কাস্টম বাজেট দিন (Custom BDT):
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={customMin}
                              onChange={(e) => setCustomMin(e.target.value)}
                              placeholder="Min (যেমন ৩০০০)"
                              className="w-full h-9 px-2.5 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-ring outline-hidden"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              min="0"
                              step="500"
                              value={customMax}
                              onChange={(e) => setCustomMax(e.target.value)}
                              placeholder="Max (যেমন ১০০০০)"
                              className="w-full h-9 px-2.5 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-ring outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={handleResetBudget}
                            className="text-xs text-destructive hover:underline cursor-pointer"
                          >
                            রিসেট
                          </button>
                          <button
                            type="button"
                            onClick={handleApplyCustomBudget}
                            className="px-3.5 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xs hover:bg-primary-dark cursor-pointer transition-colors"
                          >
                            প্রয়োগ করুন
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* 4. Action Button with matching label spacer for pixel alignment */}
              <div className="md:col-span-2 flex flex-col justify-end">
                <span className="hidden md:flex h-5 items-center select-none mb-1.5" aria-hidden="true">
                  &nbsp;
                </span>
                <div className="h-11">
                  <button
                    type="submit"
                    className="w-full h-11 box-border inline-flex items-center justify-center gap-2 px-4 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span className="truncate">অনুসন্ধান করুন</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Location Tags */}
          <div className="mt-4 pt-3.5 border-t border-border flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              জনপ্রিয় এলাকা:
            </span>
            {POPULAR_LOCATIONS.map((loc) => {
              const isActive =
                location.toLowerCase() === loc.value.toLowerCase() ||
                location.toLowerCase() === loc.label.toLowerCase();
              return (
                <button
                  key={loc.value}
                  type="button"
                  onClick={() => handleQuickLocation(loc.value)}
                  className={`text-xs px-2.5 py-1 rounded-xs border transition-colors cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-secondary/40"
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
