"use client";

import { AnimatedNumber } from "@/components/shared/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { AdStatus, IAdvertisement } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { differenceInDays, format } from "date-fns";
import { Pencil, Zap } from "lucide-react";

interface Props {
  ad: IAdvertisement;
  onToggleStatus: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const SponsorAdCard = ({ ad, onToggleStatus, onDelete, onEdit }: Props) => {
  const daysRemaining = Math.max(
    0,
    differenceInDays(new Date(ad.endDate), new Date()),
  );
  const formattedStart = format(new Date(ad.startDate), "MM/dd/yyyy");
  const formattedEnd = format(new Date(ad.endDate), "MM/dd/yyyy");
  return (
    <div className="rounded-xl border border-white/20 bg-black/40 p-4 space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <Zap className="text-yellow-400 h-5 w-5 mt-1" />
          <div>
            <p className="font-semibold text-white">{ad.sponsorName}</p>
            <p className="text-xs text-muted-foreground">
              {formattedStart} - {formattedEnd} • {ad.duration}Sec
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              ad.status === AdStatus.ACTIVE
                ? "bg-green-500/15 text-green-400"
                : "bg-gray-500/15 text-gray-400"
            }`}
          >
            {formatStatusText(ad.status)}
          </span>

          <span className="text-xs px-2 py-1 rounded bg-purple-500/15 text-purple-400">
            {formatStatusText(ad.adType)}
          </span>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-3 bg-white/10 rounded-lg p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Revenue Share</p>
          <p className="font-medium">
            <AnimatedNumber value={ad.revenueShare} suffix="%" />
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Revenue</p>
          <p className="font-medium">
            <AnimatedNumber value={Number(ad.totalRevenue) || 0} prefix="$" />
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Days Remaining</p>
          <p className="font-medium">
            <AnimatedNumber value={daysRemaining} />
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {ad.status === AdStatus.ACTIVE ? (
          <Button
            variant="outline"
            className="bg-card hover:bg-card-foreground hover:cursor-pointer hover:text-foreground"
            onClick={onToggleStatus}
          >
            Stop Ad
          </Button>
        ) : (
          <Button
            variant="outline"
            className="bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:cursor-pointer"
            onClick={onToggleStatus}
          >
            Activate Ad
          </Button>
        )}
        <Button
          variant="destructive"
          className="hover:cursor-pointer"
          onClick={onDelete}
        >
          Delete Ad
        </Button>
        <Button
          className="bg-card text-base text-foreground hover:bg-card-foreground hover:cursor-pointer"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit Ad
        </Button>
      </div>
    </div>
  );
};

export default SponsorAdCard;
