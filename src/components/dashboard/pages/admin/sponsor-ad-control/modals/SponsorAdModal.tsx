"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AdvancedFileUpload from "@/hooks/AdvancedFileUpload";
import { useAdvancedFileUpload } from "@/hooks/useAdvancedFileUpload";
import { AD_TYPES } from "../data";
import { SponsorAdFormValues, sponsorAdSchema } from "./sponsorAd.schema";

import {
  useCreateAdMutation,
  useGetAdByIdQuery,
  useUpdateAdMutation,
} from "@/redux/api/ad/adApi";
import { formatStatusText } from "@/utils/formatStatusText";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAdId?: string;
}

const EMPTY_VALUES: SponsorAdFormValues = {
  sponsorName: "",
  startDate: "",
  endDate: "",
  adType: "",
  duration: 0,
  revenueShare: 0,
  totalRevenue: 0,
  adUrl: "",
};

const SponsorAdModal = ({ open, onOpenChange, selectedAdId }: Props) => {
  const upload = useAdvancedFileUpload({
    accept: ["image/png", "image/jpeg", "image/jpg"],
    multiple: true,
    maxSizeMB: 5,
  });
  //   const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<SponsorAdFormValues>({
    resolver: zodResolver(sponsorAdSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: EMPTY_VALUES,
  });

  const { data: adDetailsResponse, isLoading: isFetchingAd } =
    useGetAdByIdQuery(selectedAdId || "", { skip: !selectedAdId });

  const adData = adDetailsResponse?.data;

  /* HARD RESET ON OPEN / CLOSE */
  useEffect(() => {
    if (open) {
      if (selectedAdId) {
        if (adData) {
          reset({
            sponsorName: adData.sponsorName,
            startDate: adData.startDate.slice(0, 16),
            endDate: adData.endDate.slice(0, 16),
            adType: adData.adType,
            duration: adData.duration,
            revenueShare: adData.revenueShare,
            totalRevenue: Number(adData.totalRevenue) || 0,
            adUrl: adData.adUrl,
          });
        }
      } else {
        reset(EMPTY_VALUES);
      }
    } else {
      reset(EMPTY_VALUES);
      upload.resetFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, adData, selectedAdId, reset]);

  const [createAd, { isLoading: isCreating }] = useCreateAdMutation();
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();

  const isSaving = isCreating || isUpdating;

  const onSubmit = async (data: SponsorAdFormValues) => {
    if (!selectedAdId && (!upload.files || upload.files.length === 0)) {
      toast.error("Please upload an ad media file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("sponsorName", data.sponsorName);
      formData.append("startDate", new Date(data.startDate).toISOString());
      formData.append("endDate", new Date(data.endDate).toISOString());
      formData.append("duration", data.duration.toString());
      if (data.adType) formData.append("adType", data.adType);
      formData.append("revenueShare", data.revenueShare.toString());
      formData.append("totalRevenue", data.totalRevenue.toString());
      formData.append("adUrl", data.adUrl);
      if (upload.files && upload.files.length > 0) {
        formData.append("media", upload.files[0]);
      }

      if (selectedAdId) {
        const result = await updateAd({
          id: selectedAdId,
          data: formData,
        }).unwrap();
        if ((result as { success?: boolean })?.success) {
          toast.success("Advertisement updated successfully");
          onOpenChange(false);
        }
      } else {
        const result = await createAd(formData).unwrap();
        if ((result as { success?: boolean; message?: string })?.success) {
          toast.success(
            (result as { message?: string }).message ||
              "Advertisement created successfully",
          );
          onOpenChange(false);
        }
      }
    } catch (err) {
      const error = err as { data?: { message?: string } };
      const errMsg =
        error?.data?.message ||
        `Failed to ${selectedAdId ? "update" : "create"} ad`;
      toast.error(errMsg);
    }
  };

  /* keep YOUR styles */
  const triggerCls =
    "h-10 bg-primary text-foreground border border-muted-foreground/50 hover:cursor-pointer";
  const contentCls = "max-h-75 bg-primary text-muted-foreground border";
  const itemCls = "bg-primary border-b hover:text-white!";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="flex flex-col items-center text-center">
          <DialogTitle className="text-xl font-semibold text-center sm:text-center">
            {selectedAdId ? "Edit Ad" : "Upload New Ad"}
          </DialogTitle>
        </DialogHeader>

        {isFetchingAd ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-2"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Sponsor Name */}
            <div>
              <Label className="mb-1 block text-xs">Sponsor Name</Label>
              <Input
                className="h-10 border-muted-foreground"
                {...register("sponsorName")}
              />
              {errors.sponsorName && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.sponsorName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-xs">Start Date</Label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select start date & time..."
                      accentColor="blue"
                    />
                  )}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="mb-1 block text-xs">End Date</Label>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select end date & time..."
                      accentColor="blue"
                    />
                  )}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Ad Type + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-xs">Ad Type</Label>
                <Select
                  value={undefined}
                  onValueChange={(v) =>
                    setValue("adType", v, { shouldValidate: true })
                  }
                  defaultValue={adData?.adType || undefined}
                >
                  <SelectTrigger className={triggerCls}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className={contentCls}>
                    {AD_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className={itemCls}>
                        {formatStatusText(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.adType && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.adType.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-1 block text-xs">Duration (sec)</Label>
                <Input
                  type="number"
                  className="h-10 border-muted-foreground"
                  {...register("duration", {
                    valueAsNumber: true,
                  })}
                />
                {errors.duration && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>

            {/* Revenue */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1 block text-xs">Revenue Share (%)</Label>
                <Input
                  type="number"
                  className="h-10 border-muted-foreground"
                  {...register("revenueShare", {
                    valueAsNumber: true,
                  })}
                />
                {errors.revenueShare && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.revenueShare.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="mb-1 block text-xs">Total Revenue ($)</Label>
                <Input
                  type="number"
                  className="h-10 border-muted-foreground"
                  {...register("totalRevenue", {
                    valueAsNumber: true,
                  })}
                />
                {errors.totalRevenue && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.totalRevenue.message}
                  </p>
                )}
              </div>
            </div>

            {/* Ad URL */}
            <div>
              <Label className="mb-1 block text-xs">Ad URL</Label>
              <Input
                type="url"
                className="h-10 border-muted-foreground"
                {...register("adUrl")}
              />
              {errors.adUrl && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.adUrl.message}
                </p>
              )}
            </div>

            {/* Upload */}
            <div className="space-y-2">
              <Label className="mb-1 block text-xs">Ad Media</Label>
              {selectedAdId &&
                adData?.mediaUrl &&
                upload.files.length === 0 && (
                  <div className="relative mb-2 w-full h-32 rounded-lg border border-white/10 overflow-hidden bg-black/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={adData.mediaUrl}
                      alt="Existing Ad Media"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              <AdvancedFileUpload
                accept="image/png, image/jpeg, image/jpg"
                multiple
                files={upload.files}
                error={upload.error}
                isDragging={upload.isDragging}
                onInputChange={upload.handleInputChange}
                onDrop={upload.handleDrop}
                onDragOver={upload.handleDragOver}
                onDragLeave={upload.handleDragLeave}
                onRemove={upload.removeFile}
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                className="border text-foreground bg-primary-dark hover:bg-primary-dark/60 hover:cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SponsorAdModal;
