"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateSeasonMutation } from "@/redux/api/season/seasonApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createSeasonSchema = z.object({
  seasonNumber: z
    .number({
      message: "Season number must be a valid number",
    })
    .int("Season number must be an integer")
    .positive("Season number must be a positive integer"),
});

type CreateSeasonFormValues = z.infer<typeof createSeasonSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (seasonNumber: number) => void;
  suggestedSeasonNumber?: number;
}

export default function CreateSeasonModal({
  isOpen,
  onClose,
  onSuccess,
  suggestedSeasonNumber = 1,
}: Props) {
  const [createSeason, { isLoading }] = useCreateSeasonMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSeasonFormValues>({
    resolver: zodResolver(createSeasonSchema),
    defaultValues: {
      seasonNumber: suggestedSeasonNumber,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateSeasonFormValues) => {
    try {
      const response = await createSeason({
        seasonNumber: Number(data.seasonNumber),
      }).unwrap();

      if (response.success) {
        toast.success(
          response.message || `Season ${data.seasonNumber} created successfully!`,
        );
        onSuccess?.(data.seasonNumber);
        handleClose();
      } else {
        toast.error(response.message || "Failed to create season.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errorSources?: { message: string }[] } };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.errorSources?.[0]?.message ||
        "An error occurred while creating the season.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl border border-border bg-card backdrop-blur-xl text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center border border-destructive/30 text-destructive">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white font-heading">
                Create New Season
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                Initialize a new Madden Fantasy League season.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="seasonNumber" className="text-xs font-semibold text-white/90">
              Season Number <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="seasonNumber"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 1, 2, 3"
                className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive font-semibold"
                {...register("seasonNumber", { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-white/50">
                INT
              </span>
            </div>
            {errors.seasonNumber && (
              <p className="text-xs text-destructive mt-1 font-medium">
                {errors.seasonNumber.message}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-white/10 bg-linear-to-b from-[#13171e] to-[#0a0c0f] p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Initial Status:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                UPCOMING
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Madden Selection:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Unlocked (Allowed)
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <div className="grid w-full grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-md bg-destructive hover:bg-destructive-soft text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="w-4 h-4" />
                    <span>Create Season</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full h-10 rounded-md border border-white/20 text-white bg-transparent hover:bg-white/10 font-semibold text-sm transition-colors hover:cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
