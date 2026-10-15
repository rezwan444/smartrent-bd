"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useActivateSeasonMutation } from "@/redux/api/season/seasonApi";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSeasonNumber?: number;
  onSuccess?: () => void;
}

export default function ActivateSeasonModal({
  isOpen,
  onClose,
  defaultSeasonNumber = 1,
  onSuccess,
}: Props) {
  const [seasonNumber] = useState<number>(defaultSeasonNumber);
  const [isImmediate, setIsImmediate] = useState<boolean>(true);
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [minimumScheduledDate] = useState(
    () => new Date(Date.now() + 60000),
  );

  const [activateSeason, { isLoading }] = useActivateSeasonMutation();

  const handleActivate = async () => {
    if (!seasonNumber || seasonNumber <= 0) {
      toast.error("Please enter a valid positive season number");
      return;
    }

    if (!isImmediate) {
      if (!scheduledAt) {
        toast.error("Please select a valid scheduled activation date and time");
        return;
      }
      if (new Date(scheduledAt).getTime() <= Date.now()) {
        toast.error("Scheduled activation date and time must be in the future");
        return;
      }
    }

    try {
      const payload: { seasonNumber: number; scheduledAt?: string } = {
        seasonNumber: Number(seasonNumber),
      };

      if (!isImmediate && scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      }

      const response = await activateSeason(payload).unwrap();

      if (response.success) {
        toast.success(
          response.message ||
            (isImmediate
              ? `Season ${seasonNumber} activated immediately!`
              : `Season ${seasonNumber} scheduled for activation!`),
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to activate season.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errorSources?: { message: string }[] } };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.errorSources?.[0]?.message ||
        "Failed to activate season. Please verify the season exists.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card backdrop-blur-xl text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white font-heading">
                Activate Season & Lock Teams
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs mt-0.5">
                Transition season status to ACTIVE and freeze team selections.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Season Badge */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
            <span className="text-xs font-semibold text-white/70">Target Season:</span>
            <span className="text-sm font-extrabold text-emerald-400 font-heading tracking-wide">
              SEASON {seasonNumber}
            </span>
          </div>

          {/* Immediate Activation Checkbox */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <input
              id="isImmediateActivation"
              type="checkbox"
              checked={isImmediate}
              onChange={(e) => setIsImmediate(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-black text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="isImmediateActivation" className="text-xs font-semibold text-white/90 cursor-pointer select-none">
              Activate Immediately (No Date Selection)
            </label>
          </div>

          {/* Optional Scheduled Date Selector if NOT immediate */}
          {!isImmediate && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Scheduled Activation Date & Time
              </label>
              <DateTimePicker
                value={scheduledAt}
                onChange={(val) => setScheduledAt(val)}
                minDate={minimumScheduledDate}
                placeholder="Pick activation date & time..."
                accentColor="emerald"
                className="border-white/15 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Warning Banner */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 text-white/80">
            <div className="flex items-center gap-2 font-semibold text-xs text-emerald-400">
              <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Activation Notice</span>
            </div>
            <ul className="text-xs space-y-1.5 list-disc list-inside text-white/70 pl-1 leading-relaxed">
              <li>
                {isImmediate ? (
                  <>Season status becomes <strong className="text-white">ACTIVE</strong> immediately.</>
                ) : (
                  <>Season will automatically transition to <strong className="text-white">ACTIVE</strong> on scheduled date.</>
                )}
              </li>
              <li>
                All franchise teams in Season {seasonNumber} will have Madden selections locked.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleActivate}
              disabled={isLoading}
              className="w-full h-10 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Activate</span>
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
