"use client";

import { ISeason, ITeam } from "@/types/global";
import { ArrowLeft, Gamepad2, Info, Users } from "lucide-react";
import { useState } from "react";

// Sub-components
import MaddenTeamsGrid from "../ui/MaddenTeamsGrid";
import SeasonControlBanner from "../ui/SeasonControlBanner";
import SeasonPipelineStepper from "../ui/SeasonPipelineStepper";
import SeasonRulesGuide from "../ui/SeasonRulesGuide";
import SeasonStatsCards from "../ui/SeasonStatsCards";
import TeamMaddenTable from "../ui/TeamMaddenTable";

interface Props {
  selectedSeasonNumber: number;
  seasonsList: ISeason[];
  maddenTeams: string[];
  franchiseTeams: (ITeam & { maddenTeam?: string; madden_team?: string })[];
  isMaddenLoading: boolean;
  isTeamsLoading: boolean;
  isSeasonsLoading: boolean;
  onBackToDirectory: () => void;
  onSelectSeason: (seasonNumber: number) => void;
  onOpenCreateModal: () => void;
  onOpenActivateModal: () => void;
  onOpenDeactivateModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenOverrideModal: () => void;
  onOpenAssignModal: (teamId?: string, currentMadden?: string) => void;
  onMaddenGridAssign: (maddenTeamName: string) => void;
}

export default function SeasonConsoleView({
  selectedSeasonNumber,
  seasonsList,
  maddenTeams,
  franchiseTeams,
  isMaddenLoading,
  isTeamsLoading,
  isSeasonsLoading,
  onBackToDirectory,
  onSelectSeason,
  onOpenCreateModal,
  onOpenActivateModal,
  onOpenDeactivateModal,
  onOpenScheduleModal,
  onOpenOverrideModal,
  onOpenAssignModal,
  onMaddenGridAssign,
}: Props) {
  const [activeTab, setActiveTab] = useState<"teams" | "madden-directory" | "guide">("teams");

  // Current season object
  const currentSeason = seasonsList.find(
    (s) => s.seasonNumber === selectedSeasonNumber,
  ) || {
    seasonNumber: selectedSeasonNumber,
    status: "UPCOMING",
  };

  const seasonStatus = currentSeason.status;
  const isLocked = seasonStatus === "ACTIVE";

  // Count assigned Madden teams
  const assignedMaddenCount = franchiseTeams.filter(
    (t) => t.maddenTeam || t.madden_team,
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 hover:cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Seasons Directory</span>
        </button>

        <span className="text-xs text-white/50 font-mono">
          Managing Season #{selectedSeasonNumber}
        </span>
      </div>

      {/* Hero / Control Console Banner */}
      <SeasonControlBanner
        currentSeasonNumber={selectedSeasonNumber}
        seasonStatus={seasonStatus}
        isLocked={isLocked}
        seasonsList={seasonsList}
        onSelectSeason={onSelectSeason}
        onOpenCreate={onOpenCreateModal}
        onOpenActivate={onOpenActivateModal}
        onOpenDeactivate={onOpenDeactivateModal}
        onOpenScheduleMatches={onOpenScheduleModal}
        onOpenOverride={onOpenOverrideModal}
        onOpenSelectMadden={() => onOpenAssignModal()}
      />

      {/* Season Lifecycle Pipeline Stepper */}
      <SeasonPipelineStepper
        seasonNumber={selectedSeasonNumber}
        status={seasonStatus}
        isLocked={isLocked}
        assignedCount={assignedMaddenCount}
        totalMaddenTeams={maddenTeams.length || 32}
      />

      {/* Stats Summary Cards */}
      <SeasonStatsCards
        currentSeason={selectedSeasonNumber}
        seasonStatus={seasonStatus}
        totalMaddenTeams={maddenTeams.length || 32}
        assignedCount={assignedMaddenCount}
        isLocked={isLocked}
        isLoading={isMaddenLoading || isTeamsLoading || isSeasonsLoading}
      />

      {/* Tabs Navigation */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto border-b border-primary-dark pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 hover:cursor-pointer ${
              activeTab === "teams"
                ? "bg-destructive text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Franchise Team Assignments ({franchiseTeams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("madden-directory")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 hover:cursor-pointer ${
              activeTab === "madden-directory"
                ? "bg-destructive text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>32 Madden NFL Teams</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 hover:cursor-pointer ${
              activeTab === "guide"
                ? "bg-destructive text-white shadow-md"
                : "text-white/70 hover:text-white hover:bg-white/5"
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Lifecycle & Rules Guide</span>
          </button>
        </div>

        {/* Tab 1: Franchise Teams Table */}
        {activeTab === "teams" && (
          <TeamMaddenTable
            teams={franchiseTeams}
            isLoading={isTeamsLoading}
            isSeasonLocked={isLocked}
            onAssignMaddenTeam={onOpenAssignModal}
          />
        )}

        {/* Tab 2: 32 Madden Teams Grid */}
        {activeTab === "madden-directory" && (
          <MaddenTeamsGrid
            maddenTeams={maddenTeams}
            isLoading={isMaddenLoading}
            onAssignTeam={onMaddenGridAssign}
          />
        )}

        {/* Tab 3: Lifecycle Guide */}
        {activeTab === "guide" && <SeasonRulesGuide />}
      </div>
    </div>
  );
}
