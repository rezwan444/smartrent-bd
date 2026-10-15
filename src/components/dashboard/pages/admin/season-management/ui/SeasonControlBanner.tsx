"use client";

import { ISeason } from "@/types/global";
import {
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Gamepad2,
  Lock,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Unlock,
  Zap,
} from "lucide-react";

interface Props {
  currentSeasonNumber: number;
  seasonStatus: string;
  isLocked: boolean;
  seasonsList?: ISeason[];
  onSelectSeason?: (seasonNum: number) => void;
  onOpenCreate: () => void;
  onOpenActivate: () => void;
  onOpenDeactivate: () => void;
  onOpenScheduleMatches: () => void;
  onOpenOverride: () => void;
  onOpenSelectMadden: () => void;
}

export default function SeasonControlBanner({
  currentSeasonNumber,
  seasonStatus,
  isLocked,
  seasonsList = [],
  onSelectSeason,
  onOpenCreate,
  onOpenActivate,
  onOpenDeactivate,
  onOpenScheduleMatches,
  onOpenOverride,
  onOpenSelectMadden,
}: Props) {
  const isSeasonActive = seasonStatus === "ACTIVE";
  const isSeasonInactive = seasonStatus === "INACTIVE";

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary-dark bg-linear-to-r from-destructive/10 via-primary to-black p-6 shadow-xl">
      {/* Background Accent Gradients */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-destructive/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-destructive/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Info Column */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-destructive text-white shadow-sm">
              <CalendarCheck className="w-3.5 h-3.5" />
              MADDEN LEAGUE SYSTEM
            </span>

            {/* Season Selector */}
            {seasonsList.length > 0 && onSelectSeason && (
              <div className="flex items-center gap-2 bg-black/60 border border-white/20 rounded-full px-3 py-1">
                <span className="text-xs text-white/70 font-semibold">Season:</span>
                <select
                  value={currentSeasonNumber}
                  onChange={(e) => onSelectSeason(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                >
                  {seasonsList.map((s) => (
                    <option
                      key={s.id || s.seasonNumber}
                      value={s.seasonNumber}
                      className="bg-neutral-900 text-white"
                    >
                      Season {s.seasonNumber} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isSeasonActive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE · SEASON {currentSeasonNumber}
              </span>
            )}

            {seasonStatus === "UPCOMING" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                UPCOMING · SEASON {currentSeasonNumber}
              </span>
            )}

            {isSeasonInactive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70 border border-white/20">
                <CalendarX className="w-3.5 h-3.5" />
                INACTIVE · SEASON {currentSeasonNumber}
              </span>
            )}

            {isLocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40">
                <Lock className="w-3.5 h-3.5" /> Selections Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Unlock className="w-3.5 h-3.5" /> Selection Open
              </span>
            )}
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-heading">
              Season {currentSeasonNumber} Management Console
            </h2>
            <p className="text-sm text-white/70 max-w-2xl mt-1 leading-relaxed">
              Configure NFL Madden in-game team mappings, activate new league seasons,
              and manage team selection locking status for franchise owners.
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-destructive-soft hover:shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Season</span>
          </button>

          <button
            type="button"
            onClick={onOpenSelectMadden}
            className="flex items-center justify-center gap-2 rounded-md bg-secondary border border-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:cursor-pointer hover:bg-secondary/80 active:scale-95"
          >
            <Gamepad2 className="w-4 h-4 text-destructive-soft" />
            <span>Select Madden Team</span>
          </button>

          <button
            type="button"
            onClick={onOpenOverride}
            className="flex items-center justify-center gap-2 rounded-md bg-secondary border border-white/20 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:cursor-pointer hover:bg-secondary/80 active:scale-95"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Lock Override</span>
          </button>

          {isSeasonActive && (
            <>
              <button
                type="button"
                onClick={onOpenScheduleMatches}
                className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-blue-500 hover:shadow-lg active:scale-95"
              >
                <CalendarDays className="w-4 h-4 fill-current" />
                <span>Schedule Matches</span>
              </button>

              <button
                type="button"
                onClick={onOpenDeactivate}
                className="flex items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-rose-500 hover:shadow-lg active:scale-95"
              >
                <CalendarX className="w-4 h-4" />
                <span>Deactivate</span>
              </button>
            </>
          )}

          {!isSeasonActive && (
            <button
              type="button"
              onClick={onOpenActivate}
              className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:cursor-pointer hover:bg-emerald-500 hover:shadow-lg active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Activate Season</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

