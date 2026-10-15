"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Pagination } from "@/components/dashboard/pagination";
import { Skeleton } from "@/components/ui/skeleton";

import HeaderTitle from "@/components/shared/HeaderTitle";
import ConfirmActionModal from "./modals/ConfirmActionModal";
import SponsorAdModal from "./modals/SponsorAdModal";
import SponsorAdCard from "./SponsorAdCard";
import {
  useGetAllAdsQuery,
  useDeleteAdMutation,
  useUpdateAdStatusMutation,
} from "@/redux/api/ad/adApi";
import { IAdvertisement, AdStatus } from "@/types/global";

const ITEMS_PER_PAGE = 4;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const SponsorAdControl = () => {
  /* ================= URL PAGE ================= */
  const currentPage = Number(useSearchParams().get("page") || "1");

  /* ================= STATE ================= */
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<IAdvertisement | null>(null);

  const [confirmType, setConfirmType] = useState<"stop" | "activate" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  /* ================= API ================= */
  const { data: adsResponse, isLoading } = useGetAllAdsQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdMutation();
  const [updateAdStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdStatusMutation();

  const ads = adsResponse?.data || [];
  const totalItems = adsResponse?.meta?.total || 0;
  const totalPages = adsResponse?.meta?.totalPage || 1;

  /* ================= HANDLERS ================= */

  const handleAddNew = () => {
    setSelectedAd(null);
    setAdModalOpen(true);
  };

  const handleEdit = (ad: IAdvertisement) => {
    setSelectedAd(ad);
    setAdModalOpen(true);
  };

  const openConfirm = (type: "stop" | "activate" | "delete", ad: IAdvertisement) => {
    setSelectedAd(ad);
    setConfirmType(type);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedAd || !confirmType) return;

    if (confirmType === "stop" || confirmType === "activate") {
      const isStopping = confirmType === "stop";
      try {
        const result = await updateAdStatus({
          id: selectedAd.id,
          status: isStopping ? AdStatus.STOPPED : AdStatus.ACTIVE,
        }).unwrap();
        if ((result as { success?: boolean })?.success) {
          toast.success(`Ad ${isStopping ? "stopped" : "activated"}`, {
            description: `${selectedAd.sponsorName} ad has been ${isStopping ? "stopped" : "activated"}.`,
          });
          setConfirmOpen(false);
          setConfirmType(null);
          setSelectedAd(null);
        }
      } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error?.data?.message || `Failed to ${isStopping ? "stop" : "activate"} ad`);
      }
    }

    if (confirmType === "delete") {
      try {
        const result = await deleteAd(selectedAd.id).unwrap();
        if ((result as { success?: boolean })?.success) {
          toast.success("Ad deleted", {
            description: `${selectedAd.sponsorName} ad has been deleted.`,
          });
          setConfirmOpen(false);
          setConfirmType(null);
          setSelectedAd(null);
        }
      } catch (err) {
        const error = err as { data?: { message?: string } };
        toast.error(error?.data?.message || "Failed to delete ad");
      }
    }
  };

  /* ================= RENDER ================= */

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <HeaderTitle
            title="Sponsor Ads Control"
            alignment="left"
            titleColor="white"
            titleSize="sm"
            titleClassName="font-normal"
          />
        </div>

        <button
          onClick={handleAddNew}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-foreground hover:bg-destructive-soft transition-colors"
        >
          + Add new advertisement
        </button>
      </div>

      {/* ADS LIST */}
      {isLoading ? (
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-white/20 bg-black/40 p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Skeleton className="h-5 w-5 rounded-full bg-white/10 mt-1" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32 bg-white/10" />
                    <Skeleton className="h-3 w-48 bg-white/10" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 bg-white/10" />
                  <Skeleton className="h-5 w-16 bg-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-3 bg-white/10 rounded-lg p-4 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/20" />
                  <Skeleton className="h-6 w-16 bg-white/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/20" />
                  <Skeleton className="h-6 w-16 bg-white/20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/20" />
                  <Skeleton className="h-6 w-16 bg-white/20" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-20 bg-white/10" />
                <Skeleton className="h-9 w-24 bg-white/10" />
                <Skeleton className="h-9 w-24 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : ads.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
          {ads.map((ad) => (
            <motion.div variants={itemVariants} key={ad.id}>
              <SponsorAdCard
                ad={ad}
                onEdit={() => handleEdit(ad)}
                onToggleStatus={() =>
                  openConfirm(
                    ad.status === AdStatus.ACTIVE ? "stop" : "activate",
                    ad,
                  )
                }
                onDelete={() => openConfirm("delete", ad)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No advertisements found.
        </div>
      )}

      {/* PAGINATION (same as TeamManagementPage) */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* ADD / EDIT MODAL */}
      <SponsorAdModal
        open={adModalOpen}
        onOpenChange={setAdModalOpen}
        selectedAdId={selectedAd?.id}
      />

      {/* CONFIRM MODAL */}
      <ConfirmActionModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={
          confirmType === "delete"
            ? "Delete Advertisement"
            : confirmType === "activate"
              ? "Activate Advertisement"
              : "Stop Advertisement"
        }
        description={
          confirmType === "delete"
            ? "Are you sure you want to permanently delete this advertisement?"
            : confirmType === "activate"
              ? "Are you sure you want to activate this advertisement?"
              : "Are you sure you want to stop this advertisement?"
        }
        confirmText={
          isDeleting || isUpdatingStatus
            ? "Processing..."
            : confirmType === "delete"
              ? "Delete Ad"
              : confirmType === "activate"
                ? "Activate Ad"
                : "Stop Ad"
        }
        variant={confirmType === "activate" ? "success" : "danger"}
        onConfirm={handleConfirmAction}
      />
    </section>
  );
};

export default SponsorAdControl;
