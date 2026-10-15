import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";
import { Activity } from "lucide-react";

import { IAdminDashboardWaitlist } from "@/types/global";
import Link from "next/link";

interface Props {
  isLoading?: boolean;
  className?: string;
  data?: IAdminDashboardWaitlist;
}

const WaitlistCard = ({ isLoading, className, data }: Props) => {
  return (
    <div
      className={cn(
        "flex h-fit flex-col rounded-xl border border-white/20",
        "bg-linear-to-b from-[#0e1116] to-[#090b0f]",
        "p-4",
        className,
      )}
    >
      {/* CONTENT */}
      <div className="flex-1">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          {isLoading ? (
            <Skeleton className="h-5 w-24 bg-white/10" />
          ) : (
            <>
              <h3 className="text-base font-semibold text-white">Waitlist</h3>
              <Activity className="h-4 w-4 text-white/80" />
            </>
          )}
        </div>

        {/* COUNT */}
        <div>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-12 bg-white/10 mb-2" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold text-white">
                {data?.playersInQueue || 0}
              </p>
              <p className="text-sm text-muted-foreground">Players in Queue</p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      {!isLoading ? (
        <Link href="/dashboard/admin/waitlist-control" className="w-full">
          <Button
            className="
mt-4 w-full rounded-lg
border border-white/20 bg-white/5
py-2 text-xs font-medium text-white
hover:bg-white/10 hover:cursor-pointer
"
          >
            MANAGE WAITLIST
          </Button>
        </Link>
      ) : (
        <Skeleton className="mt-4 h-9 w-full rounded-lg bg-white/10" />
      )}
    </div>
  );
};

export default WaitlistCard;
