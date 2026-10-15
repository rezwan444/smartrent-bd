"use client";

import { Check, Eye, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Pagination } from "@/components/dashboard/pagination";
import HeaderTitle from "@/components/shared/HeaderTitle";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { IStreamingApproval, STREAMING_APPROVAL_DATA } from "./data";
import StreamingPreviewModal from "./modals/StreamingPreviewModal";

const ITEMS_PER_PAGE = 10;

const StreamingApproval = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<IStreamingApproval | null>(
    null,
  );

  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 1);

  /* ================= PAGINATION ================= */
  const totalItems = STREAMING_APPROVAL_DATA.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return STREAMING_APPROVAL_DATA.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  /* ================= ACTIONS ================= */
  const handleApprove = (row: IStreamingApproval) => {
    toast.success("Streaming approved", {
      description: `${row.gamertag} has been approved successfully.`,
    });
  };

  const handleReject = (row: IStreamingApproval) => {
    toast.error("Streaming rejected", {
      description: `${row.gamertag} has been rejected.`,
    });
  };

  //   const handleView = (row: IStreamingApproval) => {
  //     toast("Viewing streamer", {
  //       description: `Opening profile for ${row.gamertag}`,
  //     });
  //   };
  const handleView = (row: IStreamingApproval) => {
    setSelectedRow(row);
    setPreviewOpen(true);
  };

  return (
    <div>
      <HeaderTitle
        title="Streaming Approval"
        alignment="left"
        titleColor="white"
        titleSize="sm"
        titleClassName="font-normal"
      />
      <div className="rounded-xl border border-white/20 bg-linear-to-b from-[#0e1116] to-[#090b0f] p-4 space-y-4">
        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-sm">
            <thead>
              <tr className="border-b border-white/20 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Gamertag</th>
                <th className="px-3 py-2">Console</th>
                <th className="px-3 py-2">Team</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <motion.tbody
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              initial="hidden"
              animate="show"
            >
              {paginatedData.map((row) => (
                <motion.tr
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                  }}
                  key={row.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-3 py-3">{row.name}</td>
                  <td className="px-3 py-3">{row.gamertag}</td>
                  <td className="px-3 py-3">{row.console}</td>
                  <td className="px-3 py-3">{row.team}</td>

                  {/* STATUS */}
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        "font-medium",
                        row.status === "Active"
                          ? "text-green-500"
                          : "text-red-500",
                      )}
                    >
                      {row.status}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleApprove(row)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleReject(row)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleView(row)}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        <StreamingPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          data={selectedRow}
        />

        {/* ================= PAGINATION ================= */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
};

export default StreamingApproval;
