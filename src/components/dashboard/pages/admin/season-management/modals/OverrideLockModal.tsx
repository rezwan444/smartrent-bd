"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useOverrideLockMutation } from "@/redux/api/season/seasonApi";
import { Loader2, Lock, ShieldAlert, SlidersHorizontal, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSeasonNumber?: number;
  currentLockState?: boolean;
  onSuccess?: () => void;
}

export default function OverrideLockModal({
  isOpen,
  onClose,
  defaultSeasonNumber = 1,
  currentLockState = true,
  onSuccess,
}: Props) {
  const [seasonNumber] = useState<number>(defaultSeasonNumber);
  const [isLocked, setIsLocked] = useState<boolean>(currentLockState);
  const [overrideLock, { isLoading }] = useOverrideLockMutation();

  const handleOverride = async () => {
    if (!seasonNumber || seasonNumber <= 0) {
      toast.error("Please enter a valid positive season number");
      return;
    }

    try {
      const response = await overrideLock({
        seasonNumber: Number(seasonNumber),
        locked: isLocked,
      }).unwrap();

      if (response.success) {
        toast.success(
          response.message ||
            `Season ${seasonNumber} team locking set to ${isLocked ? "LOCKED" : "UNLOCKED"} successfully!`,
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(response.message || "Failed to update lock override.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errorSources?: { message: string }[] } };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.errorSources?.[0]?.message ||
        "Failed to update lock override. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card backdrop-blur-xl text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30 text-amber-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white font-heading">
                Override Season Team Lock
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                Manually lock or unlock team modifications for Season {seasonNumber}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Target Season Badge */}
          <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
            <span className="text-xs font-semibold text-white/70">Target Season:</span>
            <span className="text-sm font-extrabold text-amber-400 font-heading tracking-wide">
              SEASON {seasonNumber}
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-linear-to-b from-[#13171e] to-[#0a0c0f] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label htmlFor="lockToggle" className="text-sm font-semibold text-white cursor-pointer">
                  Madden Team Lock State
                </label>
                <p className="text-xs text-white/70">
                  {isLocked
                    ? "Team selections will be FROZEN for all owners."
                    : "Owners can SELECT or CHANGE their Madden teams."}
                </p>
              </div>
              <Switch
                id="lockToggle"
                checked={isLocked}
                onCheckedChange={setIsLocked}
                className="data-[state=checked]:bg-destructive data-[state=unchecked]:bg-emerald-600"
              />
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/60">Resulting Mode:</span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-red-400 bg-red-500/20 border border-red-500/30">
                  <Lock className="w-3.5 h-3.5" /> LOCKED (No edits)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                  <Unlock className="w-3.5 h-3.5" /> UNLOCKED (Edits allowed)
                </span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleOverride}
              disabled={isLoading}
              className="w-full h-10 rounded-md bg-destructive hover:bg-destructive-soft text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Save Override</span>
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
