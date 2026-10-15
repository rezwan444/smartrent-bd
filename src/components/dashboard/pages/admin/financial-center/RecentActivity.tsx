"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IFinancialRecentActivity } from "@/types/global";
import { cn } from "@/utils";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import ActivityDetailsModal from "./modals/ActivityDetailsModal";

interface Props {
  isLoading?: boolean;
  className?: string;
  data?: IFinancialRecentActivity[];
}

export default function RecentActivity({
  isLoading = false,
  className,
  data = [],
}: Props) {
  const [selectedActivity, setSelectedActivity] =
    useState<IFinancialRecentActivity | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ================= ACTION HANDLERS ================= */
  const handleView = (item: IFinancialRecentActivity) => {
    setSelectedActivity(item);
    setDetailsOpen(true);
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
      case "APPROVED":
        return "bg-green-500/10 text-green-400";
      case "REJECTED":
      case "FAILED":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-yellow-500/10 text-yellow-400";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-white/20",
        "bg-linear-to-b from-[#0e1116] to-[#090b0f]",
        "p-4",
        className,
      )}
    >
      {/* ===== HEADER ===== */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">
          Recent Activity
        </h3>
      </div>

      {/* ===== TABLE ===== */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-225 text-sm">
          <thead>
            <tr className="border-b border-white/20 text-left text-xs uppercase text-muted-foreground">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Team Name</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <motion.tbody
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {/* ===== LOADING STATE ===== */}
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <motion.tr
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                  }}
                  key={index}
                  className="border-b border-white/10"
                >
                  <td colSpan={6} className="px-3 py-3">
                    <Skeleton className="h-6 w-full bg-white/10" />
                  </td>
                </motion.tr>
              ))}

            {/* ===== DATA STATE ===== */}
            {!isLoading &&
              data.map((item) => (
                <motion.tr
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                  }}
                  key={item.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  {/* DATE */}
                  <td className="px-3 py-3 text-muted-foreground">
                    {format(new Date(item.date), "MMM dd, yyyy")}
                  </td>

                  {/* USER */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={item.user.profilePictureUrl || undefined}
                          alt={item.user.name}
                          draggable={false}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs bg-white/10 text-white">
                          {item.user.name
                            ? item.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* TIER */}
                  <td className="px-3 py-3">{formatStatusText(item.tier)}</td>

                  {/* TEAM */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span>{item.teamName}</span>
                    </div>
                  </td>

                  {/* AMOUNT */}
                  <td className="px-3 py-3 font-medium">
                    $
                    {item.amount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* STATUS */}
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        getStatusBadge(item.status),
                      )}
                    >
                      {formatStatusText(item.status)}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {/* VIEW PROFILE */}
                      <Button
                        title="View Details"
                        onClick={() => handleView(item)}
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-white/10 hover:text-opacity-90 hover:bg-white/5"
                      >
                        <Icons.Eye className="h-4 w-4 text-foreground/70 cursor-pointer mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}

            {/* ===== EMPTY STATE ===== */}
            {!isLoading && data.length === 0 && (
              <motion.tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No recent activity found
                </td>
              </motion.tr>
            )}
          </motion.tbody>
        </table>
      </div>
      <ActivityDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        activity={selectedActivity}
      />
    </div>
  );
}
