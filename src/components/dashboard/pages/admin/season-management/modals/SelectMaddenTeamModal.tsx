"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetMaddenTeamsQuery,
  useSelectMaddenTeamMutation,
} from "@/redux/api/season/seasonApi";
import { useGetAllTeamsQuery } from "@/redux/api/team/teamApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Gamepad2, Loader2, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FALLBACK_MADDEN_TEAMS, NFL_TEAMS_META } from "../constants";

const selectMaddenTeamSchema = z.object({
  teamId: z.string().min(1, "Please select a Franchise Team"),
  maddenTeam: z.string().min(1, "Please select a Madden in-game team"),
  lockAcknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that this team will be locked for the entire season",
  }),
});

type SelectMaddenTeamFormValues = z.infer<typeof selectMaddenTeamSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTeamId?: string;
  defaultMaddenTeam?: string;
  onSuccess?: () => void;
}

export default function SelectMaddenTeamModal({
  isOpen,
  onClose,
  defaultTeamId,
  defaultMaddenTeam,
  onSuccess,
}: Props) {
  const { data: maddenTeamsRes, isLoading: isMaddenLoading } =
    useGetMaddenTeamsQuery();
  const { data: teamsRes, isLoading: isTeamsLoading } = useGetAllTeamsQuery({
    limit: 100,
    page: 1,
  });

  const [selectMaddenTeam, { isLoading: isSubmitting }] =
    useSelectMaddenTeamMutation();

  const maddenTeams = maddenTeamsRes?.data?.length
    ? maddenTeamsRes.data
    : FALLBACK_MADDEN_TEAMS;

  const franchiseTeams = teamsRes?.data || [];

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SelectMaddenTeamFormValues>({
    resolver: zodResolver(selectMaddenTeamSchema),
    defaultValues: {
      teamId: defaultTeamId || "",
      maddenTeam: defaultMaddenTeam || "",
      lockAcknowledged: false as unknown as true,
    },
  });

  const selectedMaddenTeam = useWatch({ control, name: "maddenTeam" });

  useEffect(() => {
    if (isOpen) {
      setValue("teamId", defaultTeamId || "");
      setValue("maddenTeam", defaultMaddenTeam || "");
      setValue("lockAcknowledged", false as unknown as true);
    }
  }, [isOpen, defaultTeamId, defaultMaddenTeam, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: SelectMaddenTeamFormValues) => {
    try {
      const response = await selectMaddenTeam({
        teamId: data.teamId,
        maddenTeam: data.maddenTeam,
        lockAcknowledged: true,
      }).unwrap();

      if (response.success) {
        toast.success(
          response.message ||
            `Successfully assigned ${data.maddenTeam} to Franchise Team!`,
        );
        onSuccess?.();
        handleClose();
      } else {
        toast.error(response.message || "Failed to select Madden team.");
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string; errorSources?: { message: string }[] } };
      const errorMessage =
        errorObj?.data?.message ||
        errorObj?.data?.errorSources?.[0]?.message ||
        "Failed to select Madden in-game team.";
      toast.error(errorMessage);
    }
  };

  const activeMaddenMeta = selectedMaddenTeam
    ? NFL_TEAMS_META[selectedMaddenTeam]
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg rounded-2xl border border-border bg-card backdrop-blur-xl text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center border border-destructive/30 text-destructive">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white font-heading">
                Select Madden In-Game Team
              </DialogTitle>
              <DialogDescription className="text-white/70 text-xs mt-0.5">
                Map an official NFL Madden In-Game Team to a Franchise Team.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* 1. Franchise Team Select */}
          <div className="space-y-1.5">
            <label htmlFor="franchiseTeam" className="text-xs font-semibold text-white/90">
              Franchise Team <span className="text-destructive">*</span>
            </label>
            <Controller
              name="teamId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isTeamsLoading || isSubmitting}
                >
                  <SelectTrigger
                    id="franchiseTeam"
                    className="h-10 bg-black/60 border-white/20 text-white focus:border-destructive text-sm"
                  >
                    <SelectValue placeholder="Select Franchise Team..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/20 text-white max-h-56">
                    {franchiseTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id} className="focus:bg-destructive/20 focus:text-white">
                        <span className="font-semibold text-white">
                          {team.city} {team.mascot}
                        </span>
                        <span className="ml-2 text-xs text-white/60">
                          ({team.region} · {team.tiaraName})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teamId && (
              <p className="text-xs text-destructive font-medium">
                {errors.teamId.message}
              </p>
            )}
          </div>

          {/* 2. Madden Team Select */}
          <div className="space-y-1.5">
            <label htmlFor="maddenTeamSelect" className="text-xs font-semibold text-white/90">
              NFL Madden In-Game Team <span className="text-destructive">*</span>
            </label>
            <Controller
              name="maddenTeam"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isMaddenLoading || isSubmitting}
                >
                  <SelectTrigger
                    id="maddenTeamSelect"
                    className="h-10 bg-black/60 border-white/20 text-white focus:border-destructive text-sm"
                  >
                    <SelectValue placeholder="Choose one of 32 NFL Teams..." />
                  </SelectTrigger>
                  <SelectContent className="bg-black/95 border-white/20 text-white max-h-56">
                    {maddenTeams.map((name) => {
                      const meta = NFL_TEAMS_META[name];
                      return (
                        <SelectItem key={name} value={name} className="focus:bg-destructive/20 focus:text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: meta?.color || "#fff" }}
                            />
                            <span className="font-medium text-white">{name}</span>
                            {meta && (
                              <span className="text-xs text-white/60 ml-auto font-mono">
                                {meta.conference} {meta.division}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.maddenTeam && (
              <p className="text-xs text-destructive font-medium">
                {errors.maddenTeam.message}
              </p>
            )}
          </div>

          {/* Selected Team Preview Card */}
          {activeMaddenMeta && (
            <div className="rounded-lg border border-white/10 bg-linear-to-b from-[#13171e] to-[#0a0c0f] p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-sm"
                  style={{ backgroundColor: activeMaddenMeta.color }}
                >
                  {activeMaddenMeta.shortName}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {activeMaddenMeta.name}
                  </h4>
                  <p className="text-xs text-white/60">
                    {activeMaddenMeta.conference} {activeMaddenMeta.division} Division
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-destructive/20 text-white border border-destructive/30">
                Official NFL
              </span>
            </div>
          )}

          {/* 3. Mandatory Lock Acknowledgment Checkbox */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
            <div className="flex items-start gap-2.5">
              <Controller
                name="lockAcknowledged"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="lockAcknowledged"
                    checked={field.value === true}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                    className="mt-0.5 border-white/40 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                  />
                )}
              />
              <div className="space-y-1 leading-tight">
                <label
                  htmlFor="lockAcknowledged"
                  className="text-xs font-semibold text-white cursor-pointer"
                >
                  Lock Acknowledgment Agreement <span className="text-destructive">*</span>
                </label>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  I acknowledge and understand that this Madden In-Game team selection
                  will be locked permanently for this season once activated.
                </p>
              </div>
            </div>
            {errors.lockAcknowledged && (
              <p className="text-xs text-destructive font-medium flex items-center gap-1 pl-6">
                <AlertCircle className="w-3 h-3" />
                {errors.lockAcknowledged.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <div className="grid w-full grid-cols-2 gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-md bg-destructive hover:bg-destructive-soft text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Selection</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
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
