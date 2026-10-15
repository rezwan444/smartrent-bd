"use client";

import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Pagination } from "@/components/dashboard/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetAllUsersQuery } from "@/redux/api/user/userApi";
import { IAdminProfile } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import Link from "next/link";

const ITEMS_PER_PAGE = 11;

export default function PlayerManagementPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 1);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const { data: usersResponse, isLoading } = useGetAllUsersQuery({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    role: "OWNER",
    ...(status !== "ALL" && { status }),
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const owners = usersResponse?.data || [];
  const totalItems = usersResponse?.meta?.total || 0;
  const totalPages = usersResponse?.meta?.totalPage || 1;

  return (
    <div className="space-y-4">
      {/* ===== PAGE TITLE ===== */}
      <h1 className="text-lg font-semibold">Player Management</h1>

      {/* ===== FILTER BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-white/20 p-4 flex flex-col md:flex-row gap-3"
      >
        <Input
          placeholder="Search owners..."
          className="h-10 border-primary-dark
      focus:border-destructive
      focus:outline-none
      focus:ring-0
      focus:ring-offset-0
      focus-visible:border-destructive
      focus-visible:outline-none
      focus-visible:ring-0
      focus-visible:ring-offset-0
      transition-colors
      duration-200
      ease-in-out"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select
          value={status}
          onValueChange={(value) =>
            setStatus(value as "ALL" | "ACTIVE" | "INACTIVE")
          }
        >
          <SelectTrigger className="h-10 md:w-52 border-primary-dark">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-primary text-muted-foreground">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* ===== TABLE ===== */}
      <div className="rounded-xl border border-white/20 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black/40">
            <tr className="text-left">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
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
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : owners.length > 0 ? (
              owners.map((owner: IAdminProfile) => (
                <motion.tr
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                  }}
                  key={owner.id}
                  className="border-t border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">{`${owner.firstName} ${owner.lastName}`}</td>
                  <td className="px-4 py-3">{owner.email}</td>
                  <td className="px-4 py-3">
                    {formatStatusText(owner.role || "-")}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      owner.status === "ACTIVE"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatStatusText(owner.status || "-")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/admin/player-management/player-details/${owner.id}`}
                    >
                      <Eye className="inline h-4 w-4 cursor-pointer opacity-70 hover:opacity-100" />
                    </Link>
                  </td>
                </motion.tr>
              ))
            ) : (
              <motion.tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  No owners found
                </td>
              </motion.tr>
            )}
          </motion.tbody>
        </table>
      </div>

      {/* ===== PAGINATION ===== */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </div>
  );
}
