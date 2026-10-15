"use client";

import { Pagination } from "@/components/dashboard/pagination";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAiViolationsQuery } from "@/redux/api/ai-violation/aiViolationApi";
import { AiViolationStatus, IAiViolation } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AIViolationDetailsModal from "./modals/AIViolationDetailsModal";
import CompleteViolationModal from "./modals/CompleteViolationModal";
import DeleteViolationModal from "./modals/DeleteViolationModal";

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

const AiViolationReportCard = ({
  report,
  handleMarkAsComplete,
  handleView,
  handleDelete,
}: {
  report: IAiViolation;
  handleMarkAsComplete: (id: string) => void;
  handleView: (id: string) => void;
  handleDelete: (id: string) => void;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-white/20 bg-linear-to-b from-[#0e1116] to-[#090b0f] p-5 space-y-4"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        {/* TEAM */}
        <div className="flex items-center gap-3">
          <Image
            src={report.team?.logoUrl || "/team.png"}
            alt={report.team?.mascot || "Team"}
            width={36}
            height={36}
            draggable={false}
          />
          <div>
            <p className="font-semibold text-white">
              {report.team?.mascot || "No Team"}
            </p>
            <p className="text-xs text-muted-foreground">
              {report.team?.region ? formatStatusText(report.team.region) : "-"}
            </p>
          </div>
        </div>

        {/* USER */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-white">
              {report.reporter?.firstName} {report.reporter?.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {report.reporter?.email}
            </p>
          </div>
          <Image
            src={"https://i.pravatar.cc/40?img=12"}
            alt={report.reporter?.firstName || "User"}
            width={36}
            height={36}
            draggable={false}
            className="rounded-full"
          />
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
        {report.note}
      </div>

      {/* ================= MATCH IMAGE ================= */}
      <div className="relative w-full h-72 overflow-hidden rounded-lg border bg-white/5 flex flex-col items-center justify-center">
        {!imgError ? (
          <Image
            src={report.screenshotUrl || ""}
            alt="Match evidence"
            fill
            draggable={false}
            className="object-contain"
            priority
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <Icons.Image className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">Image not available or broken</p>
          </div>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          onClick={() => handleView(report.id)}
          variant="outline"
          className="border hover:cursor-pointer hover:bg-primary-dark hover:text-foreground"
        >
          <Icons.Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          onClick={() => handleMarkAsComplete(report.id)}
          variant="outline"
          className="border hover:cursor-pointer hover:bg-primary-dark hover:text-foreground"
        >
          Mark as complete
        </Button>

        <Button
          onClick={() => handleDelete(report.id)}
          variant="destructive"
          className="hover:cursor-pointer p-2 h-9 w-9"
          title="Delete"
        >
          <Icons.RiDeleteBinLine className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const ITEMS_PER_PAGE = 10;

const AIViolationReport = () => {
  const currentPage = Number(useSearchParams().get("page") || "1");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeViolationId, setCompleteViolationId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteViolationId, setDeleteViolationId] = useState<string | null>(null);

  const { data: violationsResponse, isLoading } = useGetAiViolationsQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    status: AiViolationStatus.PENDING,
  });

  const reports = violationsResponse?.data || [];
  const totalItems = violationsResponse?.meta?.total || 0;
  const totalPages = violationsResponse?.meta?.totalPage || 1;

  const handleView = (id: string) => {
    setSelectedViolationId(id);
    setDetailsOpen(true);
  };

  const handleMarkAsComplete = (id: string) => {
    setCompleteViolationId(id);
    setCompleteModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteViolationId(id);
    setDeleteModalOpen(true);
  };

  return (
    <div>
      <HeaderTitle
        title="AI Violation Report"
        alignment="left"
        titleColor="white"
        titleSize="sm"
        titleClassName="font-normal"
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/20 bg-black/40 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-3 w-16 bg-white/10" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-2 flex flex-col items-end">
                    <Skeleton className="h-4 w-24 bg-white/10" />
                    <Skeleton className="h-3 w-32 bg-white/10" />
                  </div>
                  <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
                </div>
              </div>
              <Skeleton className="h-10 w-full bg-white/10" />
              <Skeleton className="h-72 w-full bg-white/10" />
              <div className="flex items-center justify-end gap-3 pt-2">
                <Skeleton className="h-9 w-32 bg-white/10" />
                <Skeleton className="h-9 w-24 bg-white/10" />
              </div>
            </div>
          ))
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <AiViolationReportCard
              key={report.id}
              report={report}
              handleMarkAsComplete={handleMarkAsComplete}
              handleView={handleView}
              handleDelete={handleDelete}
            />
          ))
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No pending AI violations found.
          </div>
        )}
      </motion.div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      )}

      {/* DETAILS MODAL */}
      <AIViolationDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        violationId={selectedViolationId}
      />

      {/* COMPLETE MODAL */}
      <CompleteViolationModal
        open={completeModalOpen}
        onOpenChange={setCompleteModalOpen}
        violationId={completeViolationId}
      />

      {/* DELETE MODAL */}
      <DeleteViolationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        violationId={deleteViolationId}
      />
    </div>
  );
};

export default AIViolationReport;
