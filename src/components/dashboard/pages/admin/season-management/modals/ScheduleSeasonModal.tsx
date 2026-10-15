"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useScheduleSeasonMatchesMutation } from "@/redux/api/match/matchApi";
import { CalendarCheck, CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSeasonNumber?: number;
  onSuccess?: () => void;
}

export default function ScheduleSeasonModal({
  isOpen,
  onClose,
  defaultSeasonNumber = 1,
  onSuccess,
}: Props) {
  const [seasonNumber] = useState<number>(defaultSeasonNumber);
  const [scheduleSeasonMatches, { isLoading }] =
    useScheduleSeasonMatchesMutation();

  const handleSchedule = async () => {
    if (!seasonNumber || seasonNumber <= 0) {
      toast.error("Please enter a valid positive season number");
      return;
    }

    try {
      const response = await scheduleSeasonMatches({
        seasonNumber: Number(seasonNumber),
      }).unwrap();

      if (response.success) {
        toast.success(
          response.message ||
            `Season ${seasonNumber} match fixtures scheduled successfully!`,
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to schedule season matches.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errorSources?: { message: string }[] } };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.errorSources?.[0]?.message ||
        "Failed to schedule season matches. Ensure season is active and teams are registered.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card backdrop-blur-xl text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/15 flex items-center justify-center border border-blue-500/30 text-blue-400">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white font-heading">
                Schedule Season Matches
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                Generate and schedule all match fixtures for Season {seasonNumber}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Season Badge */}
          <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5">
            <span className="text-xs font-semibold text-white/70">Target Season:</span>
            <span className="text-sm font-extrabold text-blue-400 font-heading tracking-wide">
              SEASON {seasonNumber}
            </span>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2 text-blue-200 text-xs leading-relaxed">
            <p>
              This action will auto-generate match rounds across registered Madden franchise teams for Season <strong>{seasonNumber}</strong>.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSchedule}
              disabled={isLoading}
              className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4" />
                  <span>Schedule Matches</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full h-10 rounded-md border border-white/20 text-white bg-transparent hover:bg-white/10 font-semibold text-sm transition-colors hover:cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
