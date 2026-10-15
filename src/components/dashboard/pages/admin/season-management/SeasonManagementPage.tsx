"use client";

import HeaderTitle from "@/components/shared/HeaderTitle";
import useAuth from "@/hooks/useAuth";
import { useGetSeasonsQuery } from "@/redux/api/season/seasonApi";
import { ISeason } from "@/types/global";
import { useState } from "react";

// Views
import SeasonsDirectory from "./views/SeasonsDirectory";

// Modals
import ActivateSeasonModal from "./modals/ActivateSeasonModal";
import CreateSeasonModal from "./modals/CreateSeasonModal";
import DeactivateSeasonModal from "./modals/DeactivateSeasonModal";
import OverrideLockModal from "./modals/OverrideLockModal";
import ScheduleSeasonModal from "./modals/ScheduleSeasonModal";

export default function SeasonManagementPage() {
  const isTokenAvailable = useAuth();

  // Queries
  const { data: seasonsRes, isLoading: isSeasonsLoading } = useGetSeasonsQuery(
    undefined,
    { skip: !isTokenAvailable },
  );

  const seasonsList: ISeason[] = seasonsRes?.data || [];

  // Active target season number for modal operations
  const [targetSeasonNumber, setTargetSeasonNumber] = useState<number>(1);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);

  const handleActivateSeason = (seasonNum: number) => {
    setTargetSeasonNumber(seasonNum);
    setIsActivateModalOpen(true);
  };

  const handleDeactivateSeason = (seasonNum: number) => {
    setTargetSeasonNumber(seasonNum);
    setIsDeactivateModalOpen(true);
  };

  const handleScheduleMatches = (seasonNum: number) => {
    setTargetSeasonNumber(seasonNum);
    setIsScheduleModalOpen(true);
  };

  const handleOverrideLock = (seasonNum: number) => {
    setTargetSeasonNumber(seasonNum);
    setIsOverrideModalOpen(true);
  };

  // Find target season lock state
  const targetSeason = seasonsList.find((s) => s.seasonNumber === targetSeasonNumber);
  const targetIsLocked = targetSeason?.status === "ACTIVE";

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <HeaderTitle
        title="Season Management"
        alignment="left"
        titleColor="white"
        titleSize="sm"
        titleClassName="font-semibold text-xl md:text-2xl"
      />

      {/* Single-Page Seasons Directory */}
      <SeasonsDirectory
        seasons={seasonsList}
        isLoading={isSeasonsLoading}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onActivateSeason={handleActivateSeason}
        onDeactivateSeason={handleDeactivateSeason}
        onScheduleMatches={handleScheduleMatches}
        onOverrideLock={handleOverrideLock}
      />

      {/* Modals */}
      <CreateSeasonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        suggestedSeasonNumber={
          seasonsList.length > 0
            ? Math.max(...seasonsList.map((s) => s.seasonNumber)) + 1
            : 1
        }
      />

      {isActivateModalOpen && (
        <ActivateSeasonModal
          isOpen
          onClose={() => setIsActivateModalOpen(false)}
          defaultSeasonNumber={targetSeasonNumber}
        />
      )}

      {isDeactivateModalOpen && (
        <DeactivateSeasonModal
          isOpen
          onClose={() => setIsDeactivateModalOpen(false)}
          defaultSeasonNumber={targetSeasonNumber}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleSeasonModal
          isOpen
          onClose={() => setIsScheduleModalOpen(false)}
          defaultSeasonNumber={targetSeasonNumber}
        />
      )}

      {isOverrideModalOpen && (
        <OverrideLockModal
          isOpen
          onClose={() => setIsOverrideModalOpen(false)}
          defaultSeasonNumber={targetSeasonNumber}
          currentLockState={targetIsLocked}
        />
      )}
    </div>
  );
}


