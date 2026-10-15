"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";
import dayjs from "dayjs";
import { AlertCircle, Check, SearchX, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Pagination } from "@/components/dashboard/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetWaitlistsQuery } from "@/redux/api/waitlist/waitlistApi";
import { IWaitlist, IWaitlistStatusEnum } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import WaitlistDetailsModal from "./modals/WaitlistDetailsModal";
import UpdateStatusModal from "./modals/UpdateStatusModal";
import DeleteWaitlistModal from "./modals/DeleteWaitlistModal";
import { Bell, Trash2 } from "lucide-react";

/* ================= CONSTANTS ================= */
const ITEMS_PER_PAGE = 10;
const STATUS_OPTIONS = ["All", ...Object.values(IWaitlistStatusEnum)];

interface Props {
  className?: string;
}

export default function WaitlistEarlySignupControl({ className }: Props) {
  /* ================= STATE & URL PARAMS ================= */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedWaitlist, setSelectedWaitlist] = useState<IWaitlist | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Update Status Modal State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [waitlistToUpdate, setWaitlistToUpdate] = useState<string | null>(null);
  const [statusToSet, setStatusToSet] = useState<IWaitlistStatusEnum | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [waitlistToDelete, setWaitlistToDelete] = useState<string | null>(null);

  const currentPage = Number(searchParams.get("page") ?? 1);
  const statusFilter = searchParams.get("status") || "All";

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    params.set("page", "1"); // reset page on filter change
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /* ================= QUERY ================= */
  const queryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(statusFilter !== "All" && { status: statusFilter }),
  };

  const { data, isLoading, isError } = useGetWaitlistsQuery(queryParams);

  const waitlists = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPage || 1;
  const totalItems = meta?.total || 0;

  /* ================= ACTIONS ================= */
  const openUpdateModal = (id: string, status: IWaitlistStatusEnum) => {
    setWaitlistToUpdate(id);
    setStatusToSet(status);
    setUpdateModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setWaitlistToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleView = (item: IWaitlist) => {
    setSelectedWaitlist(item);
    setDetailsOpen(true);
  };

  /* ================= STATUS BADGE ================= */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case IWaitlistStatusEnum.APPROVED:
        return "bg-green-500/10 text-green-400";
      case IWaitlistStatusEnum.CANCELLED:
        return "bg-red-500/10 text-red-400";
      case IWaitlistStatusEnum.NOTIFIED:
        return "bg-blue-500/10 text-blue-400";
      case IWaitlistStatusEnum.PENDING:
      default:
        return "bg-yellow-500/10 text-yellow-400";
    }
  };

  return (
    <div className={className}>
      {/* ================= FILTER BAR (OUTSIDE TABLE) ================= */}
      <div className="flex justify-end mb-4">
        {/* STATUS FILTER */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-55 hover:cursor-pointer bg-primary text-muted-foreground border border-muted-foreground/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent className="max-h-75 bg-primary text-muted-foreground border">
            {STATUS_OPTIONS.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="bg-primary border-b"
              >
                {status === "All" ? "All Status" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ================= TABLE CONTAINER ================= */}
      <div className="rounded-xl border border-white/20 bg-linear-to-b from-[#0e1116] to-[#090b0f] p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-sm">
            <thead>
              <tr className="border-b border-white/20 text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2 text-left">Position / ID</th>
                <th className="px-3 py-2 text-left">Applied Date</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Tier</th>
                <th className="px-3 py-2 text-left">Region</th>
                <th className="px-3 py-2 text-left">Status</th>
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
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <motion.tr
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                    }}
                    key={i}
                  >
                    <td colSpan={7} className="px-3 py-3">
                      <Skeleton className="h-6 w-full bg-white/10" />
                    </td>
                  </motion.tr>
                ))}

              {!isLoading &&
                !isError &&
                waitlists.map((item) => (
                  <motion.tr
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                    }}
                    key={item.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-3 py-3 font-mono text-xs text-muted-foreground">
                      {item.id.slice(0, 8)}...
                    </td>
                    <td className="px-3 py-3">
                      {dayjs(item.createdAt).format("DD MMM, YYYY")}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.user.profileImage ?? "/team.png"}
                          alt={`${item.user.firstName} ${item.user.lastName}`}
                          width={32}
                          height={32}
                          className="rounded-full bg-white/10 object-cover"
                        />
                        <div>
                          <p className="font-medium">
                            {item.user.firstName} {item.user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3 capitalize">
                      {item.preferredTier.toLowerCase()}
                    </td>

                    <td className="px-3 py-3 capitalize">
                      {item.preferredRegion.toLowerCase()}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold tracking-wider",
                          getStatusBadge(item.status as string),
                        )}
                      >
                        {formatStatusText(item.status as string)}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-3">
                        <Button
                          size="icon"
                          className="hover:cursor-pointer"
                          onClick={() => openUpdateModal(item.id, IWaitlistStatusEnum.NOTIFIED)}
                          disabled={item.status === IWaitlistStatusEnum.NOTIFIED}
                          title="Mark as Notified"
                        >
                          <Bell className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          size="icon"
                          className="hover:cursor-pointer"
                          onClick={() => openUpdateModal(item.id, IWaitlistStatusEnum.APPROVED)}
                          disabled={item.status === IWaitlistStatusEnum.APPROVED}
                          title="Mark as Approved"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          size="icon"
                          className="hover:cursor-pointer"
                          onClick={() => openUpdateModal(item.id, IWaitlistStatusEnum.CANCELLED)}
                          disabled={item.status === IWaitlistStatusEnum.CANCELLED}
                          title="Mark as Cancelled"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          title="Delete"
                          className="hover:cursor-pointer hover:bg-destructive/10"
                          onClick={() => openDeleteModal(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button
                          title="User"
                          className="hover:cursor-pointer"
                          onClick={() => handleView(item)}
                        >
                          <Icons.User className="h-4 w-4 text-foreground/50" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}

              {!isLoading && !isError && waitlists.length === 0 && (
                <motion.tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <div className="bg-white/5 p-3 rounded-full mb-1">
                        <SearchX className="h-6 w-6 opacity-70" />
                      </div>
                      <p className="text-base font-medium text-foreground">
                        No Entries Found
                      </p>
                      <p className="text-sm opacity-80 max-w-sm">
                        {statusFilter !== "All"
                          ? `No waitlist entries found matching the "${statusFilter.toLowerCase()}" status.`
                          : "Your waitlist is currently empty. New signups will appear here."}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}

              {!isLoading && isError && (
                <motion.tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-red-500/80">
                      <div className="bg-red-500/10 p-3 rounded-full mb-1">
                        <AlertCircle className="h-6 w-6" />
                      </div>
                      <p className="text-base font-medium text-red-500">
                        Failed to Load Data
                      </p>
                      <p className="text-sm opacity-80 max-w-sm text-center">
                        There was a problem retrieving the waitlist entries.
                        Please try refreshing the page.
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </motion.tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {!isError && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>

      <WaitlistDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        waitlist={selectedWaitlist}
      />
      
      <UpdateStatusModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        waitlistId={waitlistToUpdate}
        statusToUpdate={statusToSet}
      />

      <DeleteWaitlistModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        waitlistId={waitlistToDelete}
      />
    </div>
  );
}
