"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeactivateSeasonMutation } from "@/redux/api/season/seasonApi";
import { AlertTriangle, CalendarX, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSeasonNumber?: number;
  onSuccess?: () => void;
}

export default function DeactivateSeasonModal({
  isOpen,
  onClose,
  defaultSeasonNumber = 1,
  onSuccess,
}: Props) {
  const [seasonNumber] = useState<number>(defaultSeasonNumber);
  const [deactivateSeason, { isLoading }] = useDeactivateSeasonMutation();

  const handleDeactivate = async () => {
    if (!seasonNumber || seasonNumber <= 0) {
      toast.error("Please enter a valid positive season number");
      return;
    }

    try {
      const response = await deactivateSeason({
        seasonNumber: Number(seasonNumber),
      }).unwrap();

      if (response.success) {
        toast.success(
          response.message || `Season ${seasonNumber} deactivated successfully!`,
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to deactivate season.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errorSources?: { message: string }[] } };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.errorSources?.[0]?.message ||
        "Failed to deactivate season. Please verify the season status.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card backdrop-blur-xl text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-500/15 flex items-center justify-center border border-rose-500/30 text-rose-400">
              <CalendarX className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white font-heading">
                Deactivate Season
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                Transition active season status to INACTIVE.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Season Badge */}
          <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5">
            <span className="text-xs font-semibold text-white/70">Target Season:</span>
            <span className="text-sm font-extrabold text-rose-400 font-heading tracking-wide">
              SEASON {seasonNumber}
            </span>
          </div>

          {/* Warning Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 text-amber-200">
            <div className="flex items-center gap-2 font-semibold text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Deactivation Notice</span>
            </div>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-amber-200/90 pl-1 leading-relaxed">
              <li>
                Season status becomes <strong>INACTIVE</strong> immediately.
              </li>
              <li>
                Active match schedules and tournament progression for Season {seasonNumber} will pause.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDeactivate}
              disabled={isLoading}
              className="w-full h-10 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <CalendarX className="w-4 h-4" />
                  <span>Confirm Deactivate</span>
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
