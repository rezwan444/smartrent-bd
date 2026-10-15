// components/TeamCard.tsx

//
import { Button } from "@/components/ui/button";

import { IAllStatusEnum, ITeam } from "@/types/global";
import { cn } from "@/utils";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import Image from "next/image";
import DeleteModal from "./modals/DeleteModal";
import EditTeamModal from "./modals/EditTeamModal";
import TeamDetailsModal from "./modals/TeamDetailsModal";

interface Props {
  team: ITeam;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  suspendingId?: string | null;
}

import { motion } from "framer-motion";

import ConfirmDeleteTeamModal from "./modals/ConfirmDeleteTeamModal";

export default function TeamCard({
  team,
  onDelete, // Suspend logic
  isDeleting, // Suspend logic
  suspendingId, // Suspend logic
  onRealDelete, // Real delete logic
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: Props & { onRealDelete?: (id: string) => any }) {
  return (
    <motion.div 
      className="relative rounded-xl border border-white/10 hover:border-white/30 bg-primary-dark p-4 transition-all duration-300 h-full flex flex-col justify-between"
    >
      <div>
        {/* HEADER */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <Image
            src={team.logo_url ?? "/team.png"}
            alt="team_logo"
            width={50}
            height={50}
            draggable={false}
            className="border h-12 rounded-xl mb-3"
          />
          <div className="flex items-center gap-2">
            {team.region && (
              <h4 className="font-medium text-muted text-xs ">
                {formatStatusText(team.region)}
              </h4>
            )}

            {team.region && team.division && (
              <span className="font-medium text-muted text-xs ">•</span>
            )}

            {team.division && (
              <p className="font-medium text-muted text-xs ">
                {team.division?.name}
              </p>
            )}

            {!team.region && !team.division && (
              <p className="font-medium text-muted text-xs ">Not available</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-foreground">
            {formatStatusText(team.tiaraName)}
          </span>
          {onRealDelete && (
            <ConfirmDeleteTeamModal team={team} onDelete={onRealDelete} />
          )}
        </div>
      </div>

      {/* DETAILS */}
      <div className="space-y-1 text-sm">
        <p className="flex items-center justify-between text-muted-foreground">
          {/* Player: <span className="text-foreground">{team.mascot}</span> */}
          Team: <span className="text-foreground">{team.mascot}</span>
        </p>

        <p className="flex items-center justify-between text-muted-foreground">
          {/* Player: <span className="text-foreground">{team.mascot}</span> */}
          City: <span className="text-foreground">{team.city}</span>
        </p>

        <p className="flex items-center justify-between text-muted-foreground">
          {/* Value: <span className="text-foreground">${team.value}</span> */}
        </p>
        <p className="flex items-center justify-between text-muted-foreground">
          Status:{" "}
          <span
            className={cn(
              "font-medium",
              team.status === IAllStatusEnum.ACTIVE
                ? "text-success bg-primary-dark px-2 py-0.5 rounded-md"
                : "text-destructive bg-primary-dark px-2 py-0.5 rounded-md",
            )}
          >
            {formatStatusText(team.status)}
          </span>
        </p>
      </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <EditTeamModal team={team}>
          <Button
            size="sm"
            variant="secondary"
            className="h-11 bg-card text-sm text-foreground hover:bg-card-foreground hover:cursor-pointer"
          >
            <span>
              <Icons.FiEdit className="h-4 w-4 mr-1.5" />
            </span>
            Edit
          </Button>
        </EditTeamModal>
        <DeleteModal
          team={team}
          onDelete={onDelete}
          isDeleting={isDeleting}
          suspendingId={suspendingId}
        />
      </div>

      {/* <Link href={`/dashboard/admin/team-management/${team.id}`}> */}
      {/* <Button
        size="sm"
        className=" h-11 mt-2 w-full bg-card text-foreground hover:text-foreground hover:bg-card-foreground hover:cursor-pointer"
        variant="outline"
      >
        View Details
      </Button> */}
      <TeamDetailsModal team={team}>
        <Button
          className="h-11 mt-2 text-sm w-full bg-card text-foreground hover:text-foreground hover:bg-card-foreground hover:cursor-pointer"
          variant="outline"
        >
          View Details
        </Button>
      </TeamDetailsModal>
      {/* </Link> */}

      {/* modals */}
      <div></div>
    </motion.div>
  );
}
