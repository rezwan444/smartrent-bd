"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Search, Shield, Trophy, X } from "lucide-react";
import { useMemo, useState } from "react";
import { FALLBACK_MADDEN_TEAMS, NFL_TEAMS_META } from "../constants";

interface Props {
  maddenTeams: string[];
  isLoading: boolean;
  onAssignTeam: (maddenTeamName: string) => void;
}

export default function MaddenTeamsGrid({
  maddenTeams,
  isLoading,
  onAssignTeam,
}: Props) {
  const [search, setSearch] = useState("");
  const [conferenceFilter, setConferenceFilter] = useState<"ALL" | "AFC" | "NFC">("ALL");

  const teamsList = maddenTeams?.length ? maddenTeams : FALLBACK_MADDEN_TEAMS;

  const filteredTeams = useMemo(() => {
    return teamsList.filter((teamName) => {
      const meta = NFL_TEAMS_META[teamName];
      const matchSearch =
        search === "" ||
        teamName.toLowerCase().includes(search.toLowerCase()) ||
        meta?.city.toLowerCase().includes(search.toLowerCase()) ||
        meta?.shortName.toLowerCase().includes(search.toLowerCase());

      const matchConference =
        conferenceFilter === "ALL" || meta?.conference === conferenceFilter;

      return matchSearch && matchConference;
    });
  }, [teamsList, search, conferenceFilter]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xl">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 font-heading">
            <Trophy className="w-5 h-5 text-amber-400" />
            Official 32 NFL Madden In-Game Teams Directory
          </h3>
          <p className="text-xs text-white/70 mt-0.5">
            Directory of all 32 NFL teams available for franchise assignment in this Madden League season.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Conference Filter */}
          <div className="flex items-center rounded-md border border-white/20 bg-black/60 p-0.5">
            {(["ALL", "AFC", "NFC"] as const).map((conf) => (
              <button
                key={conf}
                type="button"
                onClick={() => setConferenceFilter(conf)}
                className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                  conferenceFilter === conf
                    ? "bg-destructive text-white shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {conf}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search NFL team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 h-9 text-xs rounded-md bg-black/60 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-linear-to-b from-[#13171e] to-[#0a0c0f] p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-11 h-11 rounded-xl bg-white/10" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="w-28 h-4 bg-white/10" />
                  <Skeleton className="w-16 h-3 bg-white/10" />
                </div>
              </div>
              <Skeleton className="w-full h-8 rounded-md bg-white/10" />
            </div>
          ))
        ) : filteredTeams.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/60 space-y-2">
            <Shield className="w-8 h-8 mx-auto text-white/20" />
            <p className="text-sm font-medium text-white">No Madden NFL teams match your search criteria.</p>
          </div>
        ) : (
          filteredTeams.map((teamName) => {
            const meta = NFL_TEAMS_META[teamName];
            const color = meta?.color || "#E10600";

            return (
              <div
                key={teamName}
                className="group relative rounded-xl border border-white/10 bg-linear-to-b from-[#13171e] to-[#0a0c0f] hover:border-destructive/60 hover:shadow-lg transition-all p-4 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  {/* NFL Team Colored Badge */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md shrink-0 border border-white/20"
                    style={{ backgroundColor: color }}
                  >
                    {meta?.shortName || teamName.slice(0, 3).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white truncate group-hover:text-destructive-soft transition-colors">
                      {teamName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {meta && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/90">
                          {meta.conference} {meta.division}
                        </span>
                      )}
                      <span className="text-[11px] text-white/60 font-mono">
                        {meta?.city}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onAssignTeam(teamName)}
                  className="w-full h-8 rounded-md bg-secondary hover:bg-destructive text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Assign to Franchise</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
