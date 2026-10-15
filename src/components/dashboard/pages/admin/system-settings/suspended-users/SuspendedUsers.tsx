"use client";

import { Pagination } from "@/components/dashboard/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useGetSuspendedUsersQuery,
  useUpdateUserStatusMutation,
} from "@/redux/api/user/userApi";
import { AccountStatus } from "@/types/global";
import { Icons } from "@/utils/icons";
import { format } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const SuspendedUsers = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page") || 1);
  const { data: response, isLoading: isFetching } = useGetSuspendedUsersQuery();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const isLoading = isFetching;

  // search filter
  const suspendedUsers = response?.data || [];

  const filteredUsers = suspendedUsers.filter((user) => {
    const q = debouncedSearch.toLowerCase();

    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.suspensionReason && user.suspensionReason.toLowerCase().includes(q))
    );
  });

  // pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleEndSuspension = async (id: string) => {
    try {
      const res = await updateUserStatus({
        id,
        status: AccountStatus.ACTIVE,
      }).unwrap();
      toast.success(res.message || `User ${id} suspension ended successfully`);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to end suspension");
    }
  };

  return (
    <section className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">
          Suspended Users
        </h1>

        {/* <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="h-9 w-64 rounded-full bg-transparent border border-muted-foreground/40 px-4 text-sm outline-none"
        /> */}
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            router.push("?page=1");
          }}
          className="w-64 rounded-full border px-4 py-2 text-sm"
        />
      </div>

      {/* ================= TABLE ================= */}
      <Card className="rounded-xl border overflow-hidden py-0">
        <CardContent className="p-0">
          <Table>
            {/* ================= HEADER ================= */}
            <TableHeader className="bg-primary">
              <TableRow className="bg-primary-dark!">
                {[
                  "Date & Time",
                  "User Name",
                  "User Email",
                  "Suspension Reason",
                  "Action",
                  "Suspension",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="text-center text-foreground font-semibold"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* ================= BODY ================= */}
            <motion.tbody
              className="[&_tr:last-child]:border-0"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } },
              }}
              initial="hidden"
              animate="show"
            >
              {isLoading &&
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-muted/10 border-b bg-primary text-center"
                  >
                    <TableCell>
                      <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 mx-auto bg-white/10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-28 mx-auto bg-white/10" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading &&
                paginatedUsers.map((user) => (
                  <motion.tr
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                    }}
                    key={user.id}
                    className="hover:bg-muted/10 data-[state=selected]:bg-muted border-b transition-colors text-center bg-primary text-foreground!"
                  >
                    <TableCell>
                      {format(new Date(user.suspendedAt), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.suspensionReason}</TableCell>

                    {/* View profile */}
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/player-management/player-details/${user.id}`}
                      >
                        <button className="text-blue-400 hover:underline hover:cursor-pointer">
                          View Profile
                        </button>
                      </Link>
                    </TableCell>

                    {/* End suspension */}
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-success text-background hover:bg-success/90">
                            End Suspension
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent className="max-w-sm rounded-xl border border-white/10 border-t-emerald-500 bg-black/90 backdrop-blur text-white">
                          <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center border border-success/30">
                              <Icons.PiWarningCircle className="h-8 w-8 text-success" />
                            </div>

                            <AlertDialogTitle className="text-center text-xl font-semibold">
                              Are you sure you want to end this users
                              suspension?
                            </AlertDialogTitle>
                          </AlertDialogHeader>

                          <AlertDialogFooter className="p-0 mt-4">
                            <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
                              <AlertDialogAction
                                onClick={() => handleEndSuspension(user.id)}
                                className="w-full h-10 rounded-lg bg-success text-background hover:bg-success/90"
                              >
                                End Suspension
                              </AlertDialogAction>

                              <AlertDialogCancel className="w-full h-10 rounded-lg border border-white/30 text-white! bg-transparent hover:bg-white/10 m-0 mt-0">
                                Cancel
                              </AlertDialogCancel>
                            </div>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </motion.tr>
                ))}

              {/* EMPTY STATE */}
              {!isLoading && paginatedUsers.length === 0 && (
                <motion.tr className="hover:bg-muted/10 data-[state=selected]:bg-muted border-b transition-colors">
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No suspended users found
                  </TableCell>
                </motion.tr>
              )}
            </motion.tbody>
          </Table>
        </CardContent>
      </Card>

      {/* ================= Pagination ================= */}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />
    </section>
  );
};

export default SuspendedUsers;
