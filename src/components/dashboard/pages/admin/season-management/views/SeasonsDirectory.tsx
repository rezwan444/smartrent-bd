"use client";

import { ISeason } from "@/types/global";
import {
  CalendarX,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

interface Props {
  seasons: ISeason[];
  isLoading: boolean;
  onOpenCreateModal: () => void;
  onActivateSeason: (seasonNumber: number) => void;
  onDeactivateSeason: (seasonNumber: number) => void;
  onScheduleMatches: (seasonNumber: number) => void;
  onOverrideLock: (seasonNumber: number) => void;
}

export default function SeasonsDirectory({
  seasons,
  isLoading,
  onOpenCreateModal,
  onActivateSeason,
  onDeactivateSeason,
  onOverrideLock,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // Derived current seasons
  const activeSeason = seasons.find((s) => s.status === "ACTIVE");
  const upcomingSeason = seasons.find(
    (s) => s.status === "UPCOMING" || Boolean(s.scheduledActivationAt),
  );

  // Past / Archived seasons
  const archivedSeasons = useMemo(() => {
    return seasons
      .filter((s) => s.status === "INACTIVE")
      .filter((s) => {
        if (!searchQuery.trim()) return true;
        return s.seasonNumber.toString().includes(searchQuery.trim());
      })
      .sort((a, b) => b.seasonNumber - a.seasonNumber);
  }, [seasons, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Banner / Hero Console */}
      <div className="relative overflow-hidden rounded-xl border border-primary-dark bg-linear-to-r from-destructive/15 via-primary to-black p-6 shadow-xl">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-destructive/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive text-white shadow-xs">
                <Trophy className="w-3.5 h-3.5" />
                MADDEN LEAGUE CONSOLE
              </span>
              {activeSeason && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SEASON {activeSeason.seasonNumber} LIVE
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-heading">
              Seasons Management Console
            </h1>
            <p className="text-sm text-white/70 max-w-2xl leading-relaxed">
              Directly activate upcoming seasons, schedule match fixtures, manage selection locks,
              and review archived league history.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 rounded-md bg-destructive px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:cursor-pointer hover:bg-destructive-soft hover:shadow-xl active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Season</span>
          </button>
        </div>
      </div>

      {/* FEATURED CURRENT SEASONS (Active & Upcoming directly exposed) */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
          <Zap className="w-4 h-4 text-emerald-400" />
          Active & Upcoming Seasons
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Active Season Card */}
          {activeSeason ? (
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/50 bg-linear-to-b from-emerald-950/30 via-[#131722] to-[#10121a] p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    Current Competition
                  </span>
                  <h3 className="text-2xl font-black text-white font-heading tracking-wide">
                    SEASON {activeSeason.seasonNumber}
                  </h3>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-300 border border-emerald-500/50 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-white/80 border-y border-white/10 py-3">
                <div>
                  <p className="text-white/60">Franchises Registered</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {activeSeason._count?.franchises ?? 32} Teams
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Created Date</p>
                  <p className="text-sm font-semibold text-white font-mono mt-0.5">
                    {new Date(activeSeason.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onDeactivateSeason(activeSeason.seasonNumber)}
                  className="h-10 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:cursor-pointer"
                >
                  <CalendarX className="w-3.5 h-3.5" />
                  <span>Deactivate</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOverrideLock(activeSeason.seasonNumber)}
                  className="h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 hover:cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Override</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-white/50 font-semibold uppercase">Active Season</span>
                <h3 className="text-lg font-bold text-white/60">No Active Season Currently</h3>
                <p className="text-xs text-white/50">Activate an upcoming season to start live fixtures.</p>
              </div>
            </div>
          )}

          {/* Upcoming Season Card */}
          {upcomingSeason ? (
            <div className="relative overflow-hidden rounded-xl border border-amber-500/50 bg-linear-to-b from-amber-950/30 via-[#131722] to-[#10121a] p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                    Next Season Draft
                  </span>
                  <h3 className="text-2xl font-black text-white font-heading tracking-wide">
                    SEASON {upcomingSeason.seasonNumber}
                  </h3>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/25 text-amber-200 border border-amber-500/50 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  UPCOMING
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-white/80 border-y border-white/10 py-3">
                <div>
                  <p className="text-white/60">Franchises Registered</p>
                  <p className="text-base font-bold text-white font-mono mt-0.5">
                    {upcomingSeason._count?.franchises ?? 0} Teams
                  </p>
                </div>
                <div>
                  <p className="text-white/60">
                    {upcomingSeason.scheduledActivationAt ? "Scheduled Date" : "Created On"}
                  </p>
                  <p className="text-sm font-semibold text-amber-300 font-mono mt-0.5">
                    {upcomingSeason.scheduledActivationAt
                      ? new Date(upcomingSeason.scheduledActivationAt).toLocaleDateString()
                      : new Date(upcomingSeason.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onActivateSeason(upcomingSeason.seasonNumber)}
                  className="h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Activate Season {upcomingSeason.seasonNumber}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOverrideLock(upcomingSeason.seasonNumber)}
                  className="h-10 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 hover:cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lock Override</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-white/50 font-semibold uppercase">Upcoming Season</span>
                <h3 className="text-lg font-bold text-white/60">No Upcoming Season Prepared</h3>
                <p className="text-xs text-white/50">Create a new season to begin team registrations.</p>
              </div>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="w-fit inline-flex items-center gap-2 px-4 py-2 rounded-md bg-destructive text-white text-xs font-semibold shadow-md hover:bg-destructive-soft"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Season</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ARCHIVED & PAST SEASONS HISTORY SECTION */}
      <div className="space-y-4 pt-4 border-t border-white/15">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
            <CalendarX className="w-4 h-4 text-white/60" />
            Archived Seasons History ({archivedSeasons.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past season #..."
              className="w-full h-9 rounded-lg border border-white/20 bg-neutral-900/90 pl-9 pr-3 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-destructive"
            />
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-xl border border-white/10 bg-neutral-900/50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Archived Seasons Grid */}
        {!isLoading && archivedSeasons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedSeasons.map((season) => (
              <div
                key={season.id || season.seasonNumber}
                className="rounded-xl border border-white/15 bg-linear-to-b from-[#181b26] to-[#11131c] p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white font-heading">
                    SEASON {season.seasonNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/10 text-white/70 border border-white/20">
                    ARCHIVED
                  </span>
                </div>

                <div className="space-y-1 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Franchises</span>
                    <span className="text-white font-medium">{season._count?.franchises ?? 0} Teams</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created Date</span>
                    <span className="font-mono text-white/80">{new Date(season.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOverrideLock(season.seasonNumber)}
                  className="w-full h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/15 text-white/80 font-medium text-[11px] transition-all flex items-center justify-center gap-1.5 hover:cursor-pointer"
                >
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                  <span>Lock Override</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && archivedSeasons.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-neutral-900/30 p-8 text-center text-xs text-white/50">
            No archived seasons recorded.
          </div>
        )}
      </div>
    </div>
  );
}

