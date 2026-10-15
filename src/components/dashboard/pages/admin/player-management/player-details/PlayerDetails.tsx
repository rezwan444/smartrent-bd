"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
} from "@/redux/api/user/userApi";
import { Icons } from "@/utils/icons";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AlertTriangle, Ban } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AccountStatus } from "@/types/global";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const PlayerDetails = () => {
  const { playerId } = useParams();

  const { data: userResponse, isLoading } = useGetUserByIdQuery(
    playerId as string,
    {
      skip: !playerId,
    },
  );
  const user = userResponse?.data;

  const [warningMessage, setWarningMessage] = useState("");

  const [updateUserStatus, { isLoading: isUpdating }] =
    useUpdateUserStatusMutation();

  const handleSendWarning = () => {
    const msg = warningMessage.trim();
    if (!msg) return;

    console.log("WARNING MESSAGE:", msg);
    toast.success("Warning sent successfully!");
    setWarningMessage("");
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const newStatus = user.status === "ACTIVE" ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE;
      await updateUserStatus({ id: user.id, status: newStatus }).unwrap();
      toast.success(`User ${newStatus.toLowerCase()} successfully!`);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to update user status");
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* <div>Player Details - {playerId}</div> */}
      <section className="w-full max-w-7xl mx-auto rounded-2xl border border-white/20 bg-black/90 text-white p-4 md:p-6 lg:p-8 space-y-8 min-h-[60vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-2"></div>
          </div>
        ) : !user ? (
          <div className="text-center text-muted-foreground pt-10">
            User not found
          </div>
        ) : (
          <>
            {/* HEADER */}
            <motion.div
              variants={itemVariants}
              className="flex items-start justify-between"
            >
              <h2 className="text-xl md:text-2xl font-semibold">
                Owner Profile
              </h2>
            </motion.div>

            {/* PROFILE TOP */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start"
            >
              {/* Avatar */}
              <div className="h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border border-white/20">
                <Image
                  src={
                    user.profilePictureUrl ||
                    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=60"
                  }
                  alt="Avatar"
                  width={400}
                  height={400}
                  draggable={false}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-2 mt-4 md:mt-0">
                <h3 className="text-3xl md:text-4xl font-semibold">
                  {`${user.firstName} ${user.lastName}`}
                </h3>
                <p className="text-primary-2 text-lg md:text-xl font-medium tracking-wide">
                  {user.role}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-sm text-white/80 pt-2">
                  <span>{user.email}</span>
                  {user.phone && (
                    <>
                      <span className="text-white/40">•</span>
                      <span>{user.phone}</span>
                    </>
                  )}
                  {user.location && (
                    <>
                      <span className="text-white/40">•</span>
                      <span>{user.location}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* STATS */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <div className="rounded-xl border border-white/10 hover:border-white/30 transition-colors bg-white/5 p-6 text-center">
                <p className="text-sm text-white/70 tracking-wide">
                  JOINED DATE
                </p>
                <p className="mt-2 text-2xl font-semibold text-white/90">
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 hover:border-white/30 transition-colors bg-white/5 p-6 text-center">
                <p className="text-sm text-white/70 tracking-wide">
                  LAST UPDATED
                </p>
                <p className="mt-2 text-2xl font-semibold text-white/90">
                  {format(new Date(user.updatedAt), "MMM dd, yyyy")}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 hover:border-white/30 transition-colors bg-white/5 p-6 text-center">
                <p className="text-sm text-white/70 tracking-wide">STATUS</p>
                <p
                  className={`mt-2 text-2xl font-semibold ${user.status === "ACTIVE" ? "text-emerald-400" : "text-red-500"}`}
                >
                  {user.status}
                </p>
              </div>
            </motion.div>

            {/* HISTORY */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Warning */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/90">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <p className="text-lg">Warning History</p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-emerald-300 text-sm">No warnings issued</p>
                </div>
              </div>

              {/* Suspension */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/90">
                  <Ban className="h-5 w-5 text-red-500" />
                  <p className="text-lg">Suspension History</p>
                </div>

                <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-emerald-300 text-sm">No suspensions</p>
                </div>
              </div>
            </motion.div>

            {/* ACTION BUTTONS */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
            >
              {/* <button className="">ISSUE WARNING</button> */}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full rounded-lg hover:text-white bg-red-700/80 hover:bg-red-700 transition border border-red-500/40"
                  >
                    ISSUE WARNING
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent
                  className="
      max-w-2xl
      rounded-xl
      border border-t-red-500
      bg-black/80
      text-white
      backdrop-blur
    "
                >
                  <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                      <Icons.PiWarningCircle className="h-8 w-8 text-red-500" />
                    </div>

                    <AlertDialogTitle className="text-2xl font-semibold text-center sm:text-center">
                      Issue Warning
                    </AlertDialogTitle>
                    <AlertDialogDescription className="hidden text-center sm:text-center">
                      Issue a warning to the player
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  {/* INPUT */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Write your message here...."
                      value={warningMessage}
                      onChange={(e) => setWarningMessage(e.target.value)}
                      //   onKeyDown={(e) => {
                      //     if (e.key === "Enter") handleSendWarning();
                      //   }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!warningMessage.trim()) return;
                          handleSendWarning();
                        }
                      }}
                      className="
          w-full h-12
          rounded-lg
          border border-white/30
          bg-transparent
          px-4
          text-sm
          outline-none
          placeholder:text-white/40
          focus:border-white/60
        "
                    />
                  </div>

                  {/* FOOTER */}
                  <AlertDialogFooter className="p-0">
                    <div className="mt-4 grid w-full grid-cols-1 md:grid-cols-2 gap-3">
                      <AlertDialogAction
                        onClick={handleSendWarning}
                        disabled={!warningMessage.trim()}
                        className="
        w-full h-12 rounded-lg
        bg-red-600 hover:bg-red-700 text-white
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600
      "
                      >
                        Send message
                      </AlertDialogAction>

                      <AlertDialogCancel
                        onClick={() => setWarningMessage("")}
                        className="
        w-full h-12 rounded-lg
        border border-white/30 bg-transparent
        text-white! hover:bg-white/10
      "
                      >
                        Cancel
                      </AlertDialogCancel>
                    </div>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* suspend user */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={`h-12 w-full rounded-lg hover:text-white transition border ${user.status === "ACTIVE" ? "bg-red-900/70 hover:bg-red-900 border-red-500/40" : "bg-emerald-900/70 hover:bg-emerald-900 border-emerald-500/40"}`}
                  >
                    {user.status === "ACTIVE"
                      ? "SUSPEND OWNER"
                      : "ACTIVATE OWNER"}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent
                  className={`rounded-xl border ${user.status === "ACTIVE" ? "border-t-red-500" : "border-t-emerald-500"}`}
                >
                  <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
                    <div
                      className={`h-14 w-14 rounded-full flex items-center justify-center ${user.status === "ACTIVE" ? "bg-destructive/10" : "bg-emerald-500/10"}`}
                    >
                      <Icons.PiWarningCircle
                        className={`h-8 w-8 ${user.status === "ACTIVE" ? "text-destructive" : "text-emerald-500"}`}
                      />
                    </div>

                    <AlertDialogTitle className="text-xl font-semibold text-center sm:text-center">
                      Are you sure you want to{" "}
                      {user.status === "ACTIVE" ? "suspend" : "activate"} this
                      owner?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="hidden text-center sm:text-center">
                      {user.status === "ACTIVE" ? "Suspend" : "Activate"} this
                      owner
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter className="flex gap-3">
                    <AlertDialogAction
                      onClick={handleToggleStatus}
                      disabled={isUpdating}
                      className={
                        user.status === "ACTIVE"
                          ? "bg-destructive text-white hover:bg-destructive/90"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }
                    >
                      {isUpdating
                        ? "Processing..."
                        : user.status === "ACTIVE"
                          ? "Suspend"
                          : "Activate"}
                    </AlertDialogAction>

                    <AlertDialogCancel
                      disabled={isUpdating}
                      className="border hover:bg-primary-dark text-foreground!"
                    >
                      Cancel
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          </>
        )}
      </section>
    </motion.div>
  );
};

export default PlayerDetails;
