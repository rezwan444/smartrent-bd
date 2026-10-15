/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetAllRegionQuery } from "@/redux/api/region/regionApi";
import { useUpdateTeamMutation } from "@/redux/api/team/teamApi";
import { useGetAllTiersQuery } from "@/redux/api/tier/tierApi";
import { IAllStatusEnum, ITeam } from "@/types/global";
import ImageUpload from "@/utils/ImageUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import TeamRegionSelect from "../TeamRegionSelect";
import TeamTierSelect from "../TeamTierSelect";
import { EditTeamFormValues, editTeamSchema } from "./editTeam.schema";

interface Props {
  team: ITeam;
  children: React.ReactNode;
}

const EditTeamModal = ({ team, children }: Props) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const cityRef = useRef<HTMLInputElement | null>(null);

  const { data: tiersData, isLoading: tiersLoading } = useGetAllTiersQuery();
  const { data: regionsData, isLoading: regionsLoading } =
    useGetAllRegionQuery();

  const [updateTeam, { isLoading: isTeamUpdating }] = useUpdateTeamMutation();

  const tierOptions = useMemo(
    () =>
      tiersData?.data?.map((item) => ({
        value: String(item.tier),
        label: String(item.name),
      })) || [],
    [tiersData],
  );

  const regionOptions = useMemo(
    () =>
      regionsData?.data?.map((item) => ({
        value: String(item.name),
        label: String(item.name),
      })) || [],
    [regionsData],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTeamFormValues>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      cityName: team.city || "",
      mascotName: team.mascot || "",
      tier: String(team.tiaraName || ""),
      region: String(team.region || ""),
    },
  });

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      if (cityRef.current) {
        try {
          cityRef.current.setSelectionRange(0, 0);
        } catch {}
      }
    }, 0);

    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    reset({
      cityName: team.city || "",
      mascotName: team.mascot || "",
      tier: String(team.tiaraName || ""),
      region: String(team.region || ""),
    });
  }, [team, reset]);

  const resetFormState = () => {
    reset({
      cityName: team.city || "",
      mascotName: team.mascot || "",
      tier: String(team.tiaraName || ""),
      region: String(team.region || ""),
    });
    setFile(null);
  };

  const handleClose = () => {
    setOpen(false);
    resetFormState();
  };

  const onSubmit = async (data: EditTeamFormValues) => {
    try {
      const formData = new FormData();

      formData.append("mascot", data.mascotName.trim());
      formData.append("city", data.cityName.trim());
      formData.append("region", data.region);
      formData.append("status", team.status || IAllStatusEnum.ACTIVE);
      formData.append(
        "ownershipStatus",
        team.ownershipStatus || IAllStatusEnum.AVAILABLE,
      );
      formData.append(
        "description",
        team.description ||
          "Energistically empower standardized best practices for an expanded array of.",
      );

      //   formData.append(
      //     "divisionId",
      //     team.division?.id || team.divisionId || HARDCODED_DIVISION_ID,
      //   );

      formData.append("tier", data.tier);

      formData.append(
        "uniformJson",
        team.uniformJson ||
          JSON.stringify({
            primaryColor: "#0B0B0B",
            secondaryColor: "#E10600",
            logoStyle: "modern",
          }),
      );

      if (file) {
        formData.append("logo", file);
      }

      const result = await updateTeam({
        teamId: team.id,
        body: formData,
      }).unwrap();

      if (result?.success) {
        toast.success(result.message || "Team updated successfully!");
        handleClose();
        return;
      }

      toast.error(result?.message || "Failed to update team.");
    } catch (error: any) {
      const errMsg =
        error?.data?.message || error?.message || "Something went wrong";
      console.error("Update team error:", error);
      toast.error(errMsg);
    }
  };

  const onInvalid = () => {
    toast.error("Please fix the form errors.");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);

        if (!isOpen) {
          resetFormState();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="max-h-[90dvh] max-w-xl overflow-y-auto bg-card p-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block text-xs">City Name</Label>
              <Input
                className="h-10"
                {...register("cityName")}
                ref={(el) => {
                  register("cityName").ref(el);
                  cityRef.current = el;
                }}
                placeholder="City name"
                disabled={isTeamUpdating}
              />
              {errors.cityName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.cityName.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 block text-xs">Mascot Name</Label>
              <Input
                className="h-10"
                {...register("mascotName")}
                placeholder="Mascot name"
                disabled={isTeamUpdating}
              />
              {errors.mascotName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.mascotName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block text-xs">Tier</Label>
              <Controller
                name="tier"
                control={control}
                render={({ field }) => (
                  <TeamTierSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={tierOptions}
                    placeholder={
                      tiersLoading ? "Loading tiers..." : "Select tier"
                    }
                    disabled={isTeamUpdating || tiersLoading}
                  />
                )}
              />
              {errors.tier && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.tier.message}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-1 block text-xs">Region</Label>
              <Controller
                name="region"
                control={control}
                render={({ field }) => (
                  <TeamRegionSelect
                    value={field.value}
                    onChange={field.onChange}
                    options={regionOptions}
                    placeholder={
                      regionsLoading ? "Loading regions..." : "Select region"
                    }
                    disabled={isTeamUpdating || regionsLoading}
                  />
                )}
              />
              {errors.region && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.region.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 block text-xs">Team Logo</Label>
            <ImageUpload
              selectedFile={file}
              onFileSelect={(newFile) => setFile(newFile)}
              disabled={isTeamUpdating}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="submit"
              disabled={isTeamUpdating}
              className="bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTeamUpdating ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isTeamUpdating}
              className="hover:bg-card/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeamModal;
