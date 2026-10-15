"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IRegion, ITeam, ITier } from "@/types/global";
import { getInitials } from "@/utils/nameTrim";
import {
  Gamepad2,
  Lock,
  Search,
  Shield,
  Unlock,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { NFL_TEAMS_META } from "../constants";

interface ITeamWithMadden extends ITeam {
  maddenTeam?: string;
  madden_team?: string;
  maddenTeamLocked?: boolean;
}

interface Props {
  teams: ITeam[];
  isLoading: boolean;
  isSeasonLocked: boolean;
  onAssignMaddenTeam: (teamId: string, currentMadden?: string) => void;
}

const ITEMS_PER_PAGE = 8;

const TeamLogo = ({ src, alt }: { src?: string | null; alt: string }) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="h-9 w-9 rounded-full bg-destructive flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden text-center shadow-sm border border-white/20">
        {getInitials(alt || "Team")}
      </div>
    );
  }

  return (
    <div className="h-9 w-9 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
      <Image
        src={src}
        alt={alt}
        width={36}
        height={36}
        draggable={false}
        onError={() => setError(true)}
        className="h-full w-full object-contain p-1"
      />
    </div>
  );
};

export default function TeamMaddenTable({
  teams,
  isLoading,
  isSeasonLocked,
  onAssignMaddenTeam,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter teams
  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchSearch =
        searchQuery === "" ||
        team.mascot?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.slug?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTier = tierFilter === "ALL" || team.tiaraName === tierFilter;
      const matchRegion = regionFilter === "ALL" || team.region === regionFilter;

      return matchSearch && matchTier && matchRegion;
    });
  }, [teams, searchQuery, tierFilter, regionFilter]);

  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE) || 1;
  const paginatedTeams = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTeams.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTeams, currentPage]);

  const resetFilters = () => {
    setSearchQuery("");
    setTierFilter("ALL");
    setRegionFilter("ALL");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xl">
      {/* Table Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-heading">
            <Users className="w-5 h-5 text-destructive" />
            Franchise Teams & Madden In-Game Assignments
          </h3>
          <p className="text-xs text-white/70 mt-0.5">
            Showing {filteredTeams.length} registered franchise teams. Select and lock their official NFL Madden team.
          </p>
        </div>

        {/* Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search team or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 h-9 text-xs rounded-md bg-black/60 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tier Filter */}
          <Select
            value={tierFilter}
            onValueChange={(val) => {
              setTierFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[130px] bg-black/60 border-white/20 text-white focus:border-destructive">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/20 text-white">
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value={ITier.STANDARD}>Standard</SelectItem>
              <SelectItem value={ITier.PREMIUM}>Premium</SelectItem>
              <SelectItem value={ITier.ELITE}>Elite</SelectItem>
            </SelectContent>
          </Select>

          {/* Region Filter */}
          <Select
            value={regionFilter}
            onValueChange={(val) => {
              setRegionFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[130px] bg-black/60 border-white/20 text-white focus:border-destructive">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-white/20 text-white">
              <SelectItem value="ALL">All Regions</SelectItem>
              <SelectItem value={IRegion.NORTH}>North</SelectItem>
              <SelectItem value={IRegion.SOUTH}>South</SelectItem>
              <SelectItem value={IRegion.EAST}>East</SelectItem>
              <SelectItem value={IRegion.WEST}>West</SelectItem>
              <SelectItem value={IRegion.MIDWEST}>Midwest</SelectItem>
              <SelectItem value={IRegion.MOUNTAIN}>Mountain</SelectItem>
              <SelectItem value={IRegion.PACIFIC}>Pacific</SelectItem>
              <SelectItem value={IRegion.NORTHWEST}>Northwest</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || tierFilter !== "ALL" || regionFilter !== "ALL") && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 px-3 text-xs text-destructive hover:text-destructive-soft font-semibold transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto rounded-xl border border-primary-dark">
        <table className="min-w-225 w-full text-sm">
          <thead className="bg-linear-to-r from-destructive to-black text-white">
            <tr>
              <th className="px-4 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Franchise Team</th>
              <th className="px-4 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Tier & Region</th>
              <th className="px-4 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Assigned Madden Team</th>
              <th className="px-4 py-3.5 text-left font-semibold text-xs tracking-wider uppercase">Selection Lock</th>
              <th className="px-4 py-3.5 text-right font-semibold text-xs tracking-wider uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-dark">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-primary-dark/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28 bg-white/10" />
                        <Skeleton className="h-3 w-16 bg-white/10" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-5 w-24 rounded bg-white/10" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-6 w-36 rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-3.5">
                    <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Skeleton className="h-8 w-28 rounded-md bg-white/10 ml-auto" />
                  </td>
                </tr>
              ))
            ) : paginatedTeams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-white/60">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Shield className="w-8 h-8 text-white/20" />
                    <p className="text-sm font-medium text-white">No franchise teams found matching your filters.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-1 text-xs text-destructive hover:underline font-semibold"
                    >
                      Clear Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTeams.map((team) => {
                const teamWithMadden = team as ITeamWithMadden;
                const maddenTeamName = teamWithMadden.maddenTeam || teamWithMadden.madden_team || null;
                const maddenMeta = maddenTeamName ? NFL_TEAMS_META[maddenTeamName] : null;
                const isTeamLocked = isSeasonLocked || Boolean(teamWithMadden.maddenTeamLocked);

                return (
                  <tr
                    key={team.id}
                    className="hover:bg-primary-dark/50 transition-colors"
                  >
                    {/* 1. Franchise Team */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <TeamLogo
                          src={team.logoUrl || team.logo_url}
                          alt={`${team.city} ${team.mascot}`}
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">
                            {team.city} {team.mascot}
                          </div>
                          <div className="text-xs text-white/60 font-mono truncate">
                            @{team.slug || team.id.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Tier & Region */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-secondary text-white border border-white/10">
                          {team.tiaraName || "STANDARD"}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/80">
                          {team.region || "NORTH"}
                        </span>
                      </div>
                    </td>

                    {/* 3. Assigned Madden Team */}
                    <td className="px-4 py-3.5">
                      {maddenTeamName ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-black/60 text-xs font-semibold text-white">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                            style={{ backgroundColor: maddenMeta?.color || "#E10600" }}
                          />
                          <span className="text-white font-medium">{maddenTeamName}</span>
                          {maddenMeta && (
                            <span className="text-amber-400 font-mono text-[11px]">
                              ({maddenMeta.shortName})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-white/50 bg-white/5 border border-white/10">
                          Pending Selection
                        </span>
                      )}
                    </td>

                    {/* 4. Selection Lock State */}
                    <td className="px-4 py-3.5">
                      {isTeamLocked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Unlock className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      )}
                    </td>

                    {/* 5. Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => onAssignMaddenTeam(team.id, maddenTeamName || undefined)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:cursor-pointer hover:bg-destructive-soft hover:shadow-md active:scale-95"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>{maddenTeamName ? "Change Madden" : "Assign Madden"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-primary-dark">
          <p className="text-xs text-white/60">
            Showing Page <span className="text-white font-semibold">{currentPage}</span> of{" "}
            <span className="text-white font-semibold">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 text-xs rounded-md bg-secondary border border-white/20 text-white font-medium hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3.5 py-1.5 text-xs rounded-md bg-secondary border border-white/20 text-white font-medium hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
