"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, SlidersHorizontal, RotateCcw, AlertCircle } from "lucide-react";
import {
  CompatibilityResult,
  RoommateConnectionRecord,
  RoommateProfile,
  UserPreferencesProfile,
} from "@/types/roommate";
import { MOCK_ROOMMATES } from "@/data/mockRoommates";
import {
  calculateCompatibility,
  DEFAULT_USER_PROFILE,
} from "@/lib/roommateCompatibility";
import {
  getAllConnections,
  resetConnectionRecord,
  respondToConnectionRequest,
  sendConnectionRequest,
} from "@/lib/roommateConnections";
import { RoommateCard } from "./RoommateCard";
import { RoommateFilterBar, RoommateFiltersState } from "./RoommateFilterBar";
import { RoommateCompatibilityModal } from "./RoommateCompatibilityModal";
import { RoommatePreferencesModal } from "./RoommatePreferencesModal";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hook";
import { selectUser } from "@/redux/features/user/authSlice";

const USER_PREFS_KEY = "smartrent_user_roommate_preferences";

const INITIAL_FILTERS: RoommateFiltersState = {
  searchQuery: "",
  university: "all",
  gender: "all",
  maxBudget: "all",
  sleepSchedule: "all",
  smokingHabit: "all",
  studyEnvironment: "all",
  cleanliness: "all",
  sortBy: "compatibility",
};

export function RoommatesClient() {
  const authUser = useAppSelector(selectUser);

  // User comparison baseline
  const [userProfile, setUserProfile] = useState<UserPreferencesProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(USER_PREFS_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load user preferences:", e);
      }
    }
    return DEFAULT_USER_PROFILE;
  });

  const authUserName = authUser
    ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() || undefined
    : undefined;

  // Derived effective profile incorporating logged-in user name
  const effectiveUserProfile = useMemo(() => {
    if (authUserName && userProfile.name === DEFAULT_USER_PROFILE.name) {
      return { ...userProfile, name: authUserName };
    }
    return userProfile;
  }, [authUserName, userProfile]);

  // Connection states with lazy initializer
  const [connections, setConnections] = useState<Record<string, RoommateConnectionRecord>>(
    () => getAllConnections()
  );

  useEffect(() => {
    const handleStorage = () => setConnections(getAllConnections());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Filter & UI State
  const [filters, setFilters] = useState<RoommateFiltersState>(INITIAL_FILTERS);
  const [selectedProfile, setSelectedProfile] = useState<RoommateProfile | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // Save updated user preferences
  const handleSavePreferences = (updated: UserPreferencesProfile) => {
    setUserProfile(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USER_PREFS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save user preferences:", e);
      }
    }
  };

  // Connection actions
  const handleRequestConnect = (profileId: string) => {
    const updated = sendConnectionRequest(profileId);
    setConnections((prev) => ({ ...prev, [profileId]: updated }));
    const profile = MOCK_ROOMMATES.find((p) => p.id === profileId);
    toast.success(
      `Consent request sent to ${profile?.name || "roommate"}! Contacts will unlock upon mutual consent.`
    );
  };

  const handleSimulateResponse = (profileId: string, accept: boolean) => {
    const updated = respondToConnectionRequest(profileId, accept);
    setConnections((prev) => ({ ...prev, [profileId]: updated }));
    const profile = MOCK_ROOMMATES.find((p) => p.id === profileId);
    if (accept) {
      toast.success(
        `Mutual consent granted! Phone number & email for ${profile?.name || "roommate"} are now unlocked.`
      );
    } else {
      toast.error(
        `${profile?.name || "Roommate"} declined the consent request. Contacts remain masked.`
      );
    }
  };

  const handleResetConnection = (profileId: string) => {
    resetConnectionRecord(profileId);
    setConnections((prev) => {
      const copy = { ...prev };
      delete copy[profileId];
      return copy;
    });
    toast.info("Connection status reset to initial demo state.");
  };

  const handleOpenDetails = (profile: RoommateProfile) => {
    setSelectedProfile(profile);
    setIsDetailsModalOpen(true);
  };

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery.trim()) count++;
    if (filters.university !== "all") count++;
    if (filters.gender !== "all") count++;
    if (filters.maxBudget !== "all") count++;
    if (filters.sleepSchedule !== "all") count++;
    if (filters.smokingHabit !== "all") count++;
    if (filters.studyEnvironment !== "all") count++;
    if (filters.cleanliness !== "all") count++;
    return count;
  }, [filters]);

  // Compatibility scores map (dynamic based on active effectiveUserProfile)
  const compatibilityMap = useMemo(() => {
    const map = new Map<string, CompatibilityResult>();
    MOCK_ROOMMATES.forEach((profile) => {
      map.set(profile.id, calculateCompatibility(effectiveUserProfile, profile));
    });
    return map;
  }, [effectiveUserProfile]);

  // Filtered & Sorted profiles
  const processedProfiles = useMemo(() => {
    return MOCK_ROOMMATES.filter((profile) => {
      // 1. Text search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = profile.name.toLowerCase().includes(query);
        const matchesUni = profile.university.toLowerCase().includes(query);
        const matchesDept = profile.department.toLowerCase().includes(query);
        const matchesLocation = profile.preferredLocations.some((loc) =>
          loc.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesUni && !matchesDept && !matchesLocation) {
          return false;
        }
      }

      // 2. University filter
      if (filters.university !== "all") {
        const uniKey = filters.university;
        const profileUni = profile.university.toLowerCase();
        if (uniKey === "pub" && !profileUni.includes("pundro") && !profileUni.includes("pundra") && !profileUni.includes("pub")) return false;
        if (uniKey === "ahc" && !profileUni.includes("azizul")) return false;
        if (uniKey === "du" && !profileUni.includes("dhaka")) return false;
        if (uniKey === "buet" && !profileUni.includes("buet")) return false;
        if (uniKey === "ewu" && !profileUni.includes("east west")) return false;
        if (uniKey === "nsu" && !profileUni.includes("north south")) return false;
        if (uniKey === "brac" && !profileUni.includes("brac")) return false;
        if (uniKey === "dmc" && !profileUni.includes("medical")) return false;
        if (uniKey === "iub" && !profileUni.includes("independent")) return false;
        if (uniKey === "ahc" && !profileUni.includes("azizul")) return false;
      }

      // 3. Gender looking for
      if (filters.gender !== "all" && profile.gender !== filters.gender) {
        return false;
      }

      // 4. Max Budget
      if (filters.maxBudget !== "all") {
        const budgetLimit = Number(filters.maxBudget);
        if (profile.maxBudget > budgetLimit) return false;
      }

      // 5. Sleep Schedule
      if (
        filters.sleepSchedule !== "all" &&
        profile.lifestyle.sleepSchedule !== filters.sleepSchedule
      ) {
        return false;
      }

      // 6. Smoking Habit
      if (filters.smokingHabit !== "all") {
        if (
          filters.smokingHabit === "non_smoker" &&
          profile.lifestyle.smokingHabit !== "non_smoker"
        ) {
          return false;
        }
        if (
          filters.smokingHabit === "outside_only" &&
          profile.lifestyle.smokingHabit === "smoker"
        ) {
          return false;
        }
      }

      // 7. Study Environment
      if (
        filters.studyEnvironment !== "all" &&
        profile.lifestyle.studyEnvironment !== filters.studyEnvironment
      ) {
        return false;
      }

      // 8. Cleanliness
      if (
        filters.cleanliness !== "all" &&
        profile.lifestyle.cleanliness !== filters.cleanliness
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === "compatibility") {
        const scoreA = compatibilityMap.get(a.id)?.overallScore || 0;
        const scoreB = compatibilityMap.get(b.id)?.overallScore || 0;
        return scoreB - scoreA;
      }
      if (filters.sortBy === "budget_asc") {
        return a.maxBudget - b.maxBudget;
      }
      if (filters.sortBy === "budget_desc") {
        return b.maxBudget - a.maxBudget;
      }
      if (filters.sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [filters, compatibilityMap]);

  return (
    <div className="py-8 sm:py-12 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="border border-border bg-card p-6 sm:p-8 rounded-xs shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-secondary text-primary text-[11px] font-bold uppercase tracking-wider mb-2.5 border border-primary/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Track C3 Differentiator: Explainable Compatibility</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
                Verified Student Roommate Directory
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect with verified university students based on synchronized sleeping routines, study environments, smoking policies, and shared meal preferences.
              </p>
            </div>

            {/* Comparison Baseline Indicator Card */}
            <div className="p-4 bg-secondary/50 border border-border rounded-xs shrink-0 flex flex-col justify-between max-w-sm">
              <div>
                <span className="text-[11px] text-muted-foreground block font-medium">
                  Active Comparison Profile:
                </span>
                <span className="text-sm font-bold text-foreground block truncate">
                  {effectiveUserProfile.name}
                </span>
                <span className="text-xs text-muted-foreground block truncate">
                  {effectiveUserProfile.university} • ৳{effectiveUserProfile.maxBudget.toLocaleString()} BDT
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPreferencesModalOpen(true)}
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-background hover:bg-secondary border border-border rounded-xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Customize My Habits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <RoommateFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters(INITIAL_FILTERS)}
          onOpenPreferences={() => setIsPreferencesModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{processedProfiles.length}</strong> verified roommate profiles
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-primary hover:underline cursor-pointer"
            >
              Clear all filters ({activeFilterCount})
            </button>
          )}
        </div>

        {/* Roommate Cards Grid */}
        {processedProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {processedProfiles.map((profile) => {
              const comp =
                compatibilityMap.get(profile.id) ||
                calculateCompatibility(userProfile, profile);
              const conn = connections[profile.id]?.status || "NONE";

              return (
                <RoommateCard
                  key={profile.id}
                  profile={profile}
                  compatibility={comp}
                  connectionStatus={conn}
                  onViewDetails={handleOpenDetails}
                />
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="border border-border bg-card p-12 text-center rounded-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              No roommate profiles match your criteria
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Try broadening your budget range, university filter, or lifestyle options to discover more verified student profiles.
            </p>
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Details & Explainable Compatibility Modal */}
      {selectedProfile && (
        <RoommateCompatibilityModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
          userProfile={effectiveUserProfile}
          compatibility={
            compatibilityMap.get(selectedProfile.id) ||
            calculateCompatibility(effectiveUserProfile, selectedProfile)
          }
          connectionStatus={connections[selectedProfile.id]?.status || "NONE"}
          onRequestConnect={handleRequestConnect}
          onSimulateResponse={handleSimulateResponse}
          onResetConnection={handleResetConnection}
        />
      )}

      {/* Edit User Baseline Habits Modal */}
      <RoommatePreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        userProfile={userProfile}
        onSavePreferences={handleSavePreferences}
      />
    </div>
  );
}
