"use client";
import HeaderTitle from "@/components/shared/HeaderTitle";
import {
  useGetPlayoffBracketsQuery,
  useGetRegionStandingsQuery,
} from "@/redux/api/standings/standingsApi";
import { useState } from "react";
import { STAGE_TABS, TRegion, TStage } from "./constants";

import { Skeleton } from "@/components/ui/skeleton";
import RegionFilter from "./ui/RegionFilter";
import StandingsTable, { StandingsTableSkeleton } from "./ui/StandingsTable";

const SeasonStandings = () => {
  const [activePlan, setActivePlan] = useState<TStage>("round30");
  const [region, setRegion] = useState<TRegion>("north");

  const isRound30 = activePlan === "round30";
  const roundNumber =
    activePlan === "round16"
      ? 2
      : activePlan === "round08"
        ? 3
        : activePlan === "round04"
          ? 4
          : activePlan === "final"
            ? 5
            : 0;

  const { data: regionStandingsData, isLoading: isLoadingRegion } =
    useGetRegionStandingsQuery(region.toUpperCase(), { skip: !isRound30 });

  const { data: playoffBracketsData, isLoading: isLoadingPlayoff } =
    useGetPlayoffBracketsQuery(roundNumber, { skip: isRound30 });

  const isLoading = isLoadingRegion || isLoadingPlayoff;

  const mappedRegionData = (regionStandingsData?.data || []).map((team) => ({
    rank: team.rank,
    team: {
      id: team.id,
      name: team.mascot,
      logo: team.logoUrl || "",
      tier: team.tiaraName,
    },
    played: team.played,
    win: team.wins,
    lost: team.losses,
    draw: team.draws,
    points: team.totalPoints,
    prize: team.winningAmount,
  }));

  const mappedPlayoffMatches = (playoffBracketsData?.data || [])
    .filter(
      (match) =>
        match.teamHome?.region === region.toUpperCase() ||
        match.teamAway?.region === region.toUpperCase(),
    )
    .map((match, idx) => ({
      id: match.id,
      title: `Match ${idx + 1}`,
      gameNo: idx + 1,
      rows: [
        {
          rank: 1,
          team: {
            id: match.teamHome.id,
            name: match.teamHome.mascot,
            logo: match.teamHome.logoUrl || match.teamHome.logo_url || "",
            tier: match.teamHome.tiaraName,
          },
          isWinner: match.winnerId === match.teamHome.id,
          points: match.score?.teamHomeScore ?? "-",
          prize: match.teamHome.winningAmount,
        },
        {
          rank: 2,
          team: {
            id: match.teamAway.id,
            name: match.teamAway.mascot,
            logo: match.teamAway.logoUrl || match.teamAway.logo_url || "",
            tier: match.teamAway.tiaraName,
          },
          isWinner: match.winnerId === match.teamAway.id,
          points: match.score?.teamAwayScore ?? "-",
          prize: match.teamAway.winningAmount,
        },
      ],
    }));

  const currentYear = regionStandingsData?.meta?.year || 0;
  const currentSeason = regionStandingsData?.meta?.seasonNumber || 0;
  const seasonString = `(${currentYear} - SEASON ${currentSeason})`;

  return (
    <div className="space-y-6">
      <HeaderTitle
        title="Season Standings"
        alignment="left"
        titleColor="white"
        titleSize="sm"
        titleClassName="font-normal"
      />

      <div className="rounded-xl p-6 space-y-6">
        {/* ================= TABS ================= */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar border-b border-primary-dark pb-1">
          {STAGE_TABS.map((tab) => {
            const isActive = activePlan === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActivePlan(tab.key)}
                className={`
          whitespace-nowrap px-4 py-2
          text-sm md:text-lg font-medium
          border-b-2 transition-all
          ${
            isActive
              ? "border-destructive text-destructive"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }
        `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ================= LEAGUE TITLE ================= */}
        <h2 className="text-xl md:text-2xl font-heading tracking-wide">
          {activePlan === "round30"
            ? `LEAGUE ROUND OF 30 ${seasonString}`
            : activePlan === "round16"
              ? `PLAYOFF ROUND OF 16 ${seasonString}`
              : activePlan === "round08"
                ? `PLAYOFF ROUND OF 08 / QUARTER FINALS ${seasonString}`
                : activePlan === "round04"
                  ? `PLAYOFF ROUND OF 04 / SEMI FINALS ${seasonString}`
                  : `GOFL CHAMPIONSHIP FINAL ${seasonString}`}
        </h2>

        {/* ================= REGION FILTER ================= */}
        <RegionFilter value={region} onChange={setRegion} />

        {/* ================= TABLE ================= */}
        {isLoading ? (
          <div className="space-y-6">
            {isRound30 ? (
              <StandingsTableSkeleton isPlayoff={false} />
            ) : (
              <>
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="space-y-3">
                    <Skeleton className="h-8 w-64 bg-primary-dark" />
                    <StandingsTableSkeleton isPlayoff={true} />
                  </div>
                ))}
              </>
            )}
          </div>
        ) : activePlan === "round30" ? (
          <StandingsTable data={mappedRegionData} />
        ) : mappedPlayoffMatches.length > 0 ? (
          mappedPlayoffMatches.map((match) => (
            <div key={match.id} className="space-y-3">
              <h3 className="text-2xl font-heading">
                GAME {String(match.gameNo).padStart(2, "0")} ({match.title})
              </h3>
              <StandingsTable data={match.rows} isPlayoff={true} />
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            No playoff matches found for this region.
          </p>
        )}
      </div>
    </div>
  );
};

export default SeasonStandings;
