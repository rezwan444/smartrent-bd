import { Skeleton } from "@/components/ui/skeleton";
import { IAdminDashboardMostViewedTeam } from "@/types/global";
import { cn } from "@/utils";
import { TrendingUp } from "lucide-react";
import Image from "next/image";

interface Props {
  isLoading?: boolean;
  className?: string;
  data?: IAdminDashboardMostViewedTeam[];
}

const MostViewedTeamsCard = ({ isLoading, className, data }: Props) => {
  return (
    <div
      className={cn(
        "rounded-xl border ",
        "bg-linear-to-b from-[#0e1116] to-[#090b0f]",
        "p-4",
        className,
      )}
    >
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        {isLoading ? (
          <Skeleton className="h-5 w-48 bg-white/10" />
        ) : (
          <>
            <h3 className="text-base font-semibold text-white">
              Most Viewed Teams This Week
            </h3>
            <TrendingUp className="h-4 w-4 text-white/80" />
          </>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg bg-white/10" />
          ))}

        {!isLoading &&
          data?.map((team) => {
            return (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border bg-black/20 px-3 py-2"
              >
                {/* LEFT */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                    <Image
                      src={team.logoUrl}
                      alt={team.mascot}
                      fill
                      draggable={false}
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {team.city} {team.mascot}
                    </p>
                    <p className="text-xs text-muted-foreground">{team.tier}</p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {team.views}
                  </p>
                  <p className="text-xs text-muted-foreground">views</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MostViewedTeamsCard;
