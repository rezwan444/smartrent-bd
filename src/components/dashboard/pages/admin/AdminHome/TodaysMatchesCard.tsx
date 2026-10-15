import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IAdminDashboardTodaysMatch } from "@/types/global";
import { cn } from "@/utils";
import { formatStatusText } from "@/utils/formatStatusText";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface Props {
  isLoading?: boolean;
  className?: string;
  data?: IAdminDashboardTodaysMatch[];
}

const TodaysMatchesCard = ({ isLoading, className, data }: Props) => {
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
          <Skeleton className="h-5 w-36 bg-white/10" />
        ) : (
          <h3 className="text-base font-semibold text-white">Todays Matches</h3>
        )}
      </div>

      {/* MATCH LIST */}
      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-white/10" />
          ))}

        {!isLoading &&
          data?.map((match) => (
            <div key={match.id} className="rounded-xl bg-black/40 px-4 py-3">
              <p className="mb-2 text-center text-xs text-muted-foreground">
                Match {formatStatusText(match.status)}
              </p>

              <div className="flex items-center justify-between">
                {/* HOME */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white/10 bg-white/5">
                    <AvatarImage
                      src={match.teamHome.logoUrl}
                      alt={match.teamHome.mascot}
                      className="object-cover"
                      draggable={false}
                    />
                    <AvatarFallback className="text-[10px] bg-white/10 text-white font-medium">
                      {match.teamHome.mascot
                        ? match.teamHome.mascot.substring(0, 2).toUpperCase()
                        : "TM"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-white">{match.teamHome.mascot}</p>
                </div>

                {/* SCORE */}
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">
                    {match.result}
                  </p>
                </div>

                {/* AWAY */}
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="w-8 h-8 border border-white/10 bg-white/5">
                    <AvatarImage
                      src={match.teamAway.logoUrl}
                      alt={match.teamAway.mascot}
                      className="object-cover"
                      draggable={false}
                    />
                    <AvatarFallback className="text-[10px] bg-white/10 text-white font-medium">
                      {match.teamAway.mascot
                        ? match.teamAway.mascot.substring(0, 2).toUpperCase()
                        : "TM"}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs text-white">{match.teamAway.mascot}</p>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* FOOTER */}
      {!isLoading && (
        <Link
          href="/dashboard/admin/scheduled-matches"
          className="block mt-4 w-full"
        >
          <Button className="w-full rounded-lg border bg-white/5 py-2 text-xs font-medium text-white hover:bg-white/10 hover:cursor-pointer">
            VIEW ALL MATCHES
          </Button>
        </Link>
      )}
    </div>
  );
};

export default TodaysMatchesCard;
