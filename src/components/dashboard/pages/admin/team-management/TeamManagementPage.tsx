"use client";

import { Pagination } from "@/components/dashboard/pagination";
import CardSkeleton from "@/components/dashboard/skeletons/CardSkeleton";
import useAuth from "@/hooks/useAuth";
import { paginationLimit } from "@/lib/constants";
import {
  useGetAllTeamsQuery,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
} from "@/redux/api/team/teamApi";
import { IAllStatusEnum, IRegion, ITier } from "@/types/global";
import useSetParamsForPagination from "@/utils/setParamsForPagination";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AddNewTeamModal from "./modals/AddNewTeamModal";
import RegionSelect from "./RegionSelect";
import TeamCard from "./TeamCard";
import TierSelect from "./TierSelect";

type TierFilter = ITier | "ALL";
type RegionFilter = IRegion | "ALL";

export default function TeamManagementPage() {
  const isTokenAvailable = useAuth();
  const sp = useSearchParams();
  const setParams = useSetParamsForPagination();

  const urlPage = Number(sp.get("page") || 1);
  const selectedTier = (sp.get("tier") as TierFilter) || "ALL";
  const selectedRegion = (sp.get("region") as RegionFilter) || "ALL";
  const urlSearch = sp.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(urlSearch);
  //   const debouncedSearch = useDebounce(searchQuery);

  const [suspendingId, setSuspendingId] = useState<string | null>(null);

  // suspend team
  const [updateTeam, { isLoading: isSuspending }] = useUpdateTeamMutation();

  //   delete team
  const [deleteTeam] = useDeleteTeamMutation();

  // keep URL updated + reset page when changing filters
  const onSearchChange = (val: string) => {
    setSearchQuery(val);
    setParams({ search: val || undefined, page: 1 });
  };

  //   get all teams
  const { data: teams, isLoading } = useGetAllTeamsQuery(
    {
      limit: paginationLimit,
      page: urlPage,
      search: urlSearch.trim(),
      tiaraName: selectedTier === "ALL" ? "" : selectedTier,
      region: selectedRegion === "ALL" ? "" : selectedRegion,
    },
    { skip: !isTokenAvailable },
  );

  const onTierChange = (value: TierFilter) => {
    setParams({
      tier: value === "ALL" ? undefined : value,
      page: 1,
    });
  };

  const onRegionChange = (value: RegionFilter) => {
    setParams({
      region: value === "ALL" ? undefined : value,
      page: 1,
    });
  };

  const handleDelete = async (id: string) => {
    if (!id) return toast.error("Team not found");

    try {
      const result = await deleteTeam({ teamId: id }).unwrap();
      if (result?.success) {
        toast.success(result?.message || "Team deleted successfully");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg =
        error?.message || error?.data?.message || "Something went wrong";
      console.log(errMsg);
      toast.error(errMsg);
    }
  };
  const handleSuspend = async (id: string, currentStatus: string) => {
    if (!id) return toast.error("Team not found");
    setSuspendingId(id);

    try {
      const newStatus =
        currentStatus === IAllStatusEnum.ACTIVE
          ? IAllStatusEnum.SUSPENDED
          : IAllStatusEnum.ACTIVE;

      const result = await updateTeam({
        teamId: id,
        body: { status: newStatus },
      }).unwrap();

      if (result?.success) {
        toast.success(result.message || "Team suspended successfully!");
        return;
      }

      toast.error(result?.message || "Failed to update team.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg =
        error?.data?.message || error?.message || "Something went wrong";
      console.error("Update team error:", error);
      toast.error(errMsg);
    } finally {
      setSuspendingId(null);
    }
  };

  const totalPages = teams?.meta?.totalPage || 1;
  const totalItems = teams?.meta?.total || 0;
  const itemsPerPage = teams?.meta?.limit || paginationLimit;

  //   console.log("---------", teams);

  return (
    <section className="space-y-6">
      <div className="md:flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          Team Management
        </h1>

        <AddNewTeamModal>
          <button className="w-full md:w-auto mt-4 md:mt-0 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-destructive-soft">
            + Add New Team
          </button>
        </AddNewTeamModal>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <input
          placeholder="Search teams..."
          type="search"
          value={searchQuery}
          //   onChange={(e) => setSearchQuery(e.target.value)}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm text-foreground outline-none"
        />

        <TierSelect value={selectedTier} onChange={onTierChange} />
        <RegionSelect value={selectedRegion} onChange={onRegionChange} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: itemsPerPage }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : teams?.data?.length ? (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {teams.data.map((team) => (
            <motion.div
              key={team.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring" as const,
                    stiffness: 300,
                    damping: 24,
                  },
                },
              }}
            >
              <TeamCard
                team={team}
                onDelete={(id) => handleSuspend(id, team.status)}
                isDeleting={isSuspending}
                suspendingId={suspendingId}
                onRealDelete={handleDelete}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-10 text-sm text-muted-foreground">
          No teams found.
        </div>
      )}

      <Pagination
        currentPage={urlPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
      />
    </section>
  );
}
