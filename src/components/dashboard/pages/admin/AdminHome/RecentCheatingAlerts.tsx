"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IAdminDashboardRecentCheatingAlert } from "@/types/global";
import { cn } from "@/utils";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface Props {
  isLoading?: boolean;
  className?: string;
  data?: IAdminDashboardRecentCheatingAlert[];
}

const statusStyles: Record<string, string> = {
  INVESTIGATING: "bg-green-600/20 text-green-400 border-green-500/40",
  PENDING: "bg-red-600/20 text-red-400 border-red-500/40",
};

const RecentCheatingAlerts = ({ isLoading, className, data }: Props) => {
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
          <Skeleton className="h-5 w-40 bg-white/10" />
        ) : (
          <>
            <h3 className="text-base font-semibold text-white">
              Recent Cheating Alerts
            </h3>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </>
        )}
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg bg-white/10" />
          ))}

        {!isLoading &&
          data?.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="rounded-lg border bg-black/20 p-3"
            >
              {/* TOP ROW */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-white truncate">
                  {alert.playerName}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({alert.teamMascot})
                  </span>
                </p>

                <span
                  className={cn(
                    "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold",
                    statusStyles[alert.status],
                  )}
                >
                  {alert.status}
                </span>
              </div>

              {/* DETAILS */}
              <p className="mt-1 text-xs text-muted-foreground">
                {alert.cheatingType}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Risk Score: {alert.riskScore}%
              </p>

              {/* RISK BAR */}
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${alert.riskScore}%` }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: 0.3 + index * 0.1,
                  }}
                  className="h-1.5 rounded-full bg-red-600"
                />
              </div>
            </motion.div>
          ))}
      </div>

      {/* FOOTER */}
      {/* {!isLoading && (
        <Button className="mt-4 w-full rounded-lg border  bg-white/5 py-2 text-xs font-medium text-white hover:bg-white/10 hover:cursor-pointer transition-colors">
          VIEW ALL CASES
        </Button>
      )} */}
    </div>
  );
};

export default RecentCheatingAlerts;
