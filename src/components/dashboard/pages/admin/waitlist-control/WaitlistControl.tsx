"use client";
import HeaderTitle from "@/components/shared/HeaderTitle";
import StatsCard from "@/components/shared/StatsCard";
import { motion } from "framer-motion";
import WaitlistEarlySignupControl from "./WaitlistEarlySignupControl";

import { useSearchParams } from "next/navigation";
import { useGetWaitlistsQuery } from "@/redux/api/waitlist/waitlistApi";

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

const WaitlistControl = () => {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") ?? 1);
  const statusFilter = searchParams.get("status") || "All";

  const queryParams = {
    page: currentPage,
    limit: 10,
    ...(statusFilter !== "All" && { status: statusFilter }),
  };

  const { data, isLoading } = useGetWaitlistsQuery(queryParams);
  const stats = data?.meta?.stats;

  return (
    <div>
      <div>
        <HeaderTitle
          title="Waitlist & Early Signup Control"
          alignment="left"
          titleColor="white"
          titleSize="sm"
          titleClassName="font-normal"
        />
        {/* Stats Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-8 grid-cols-1 md:grid-cols-4 lg:grid-cols-4 "
        >
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Pending Review"
              value={stats?.pendingReview ?? 0}
              variant="compact"
              isLoading={isLoading}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Approved"
              value={stats?.approved ?? 0}
              variant="compact"
              isLoading={isLoading}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Assigned Teams"
              value={stats?.assignedTeams ?? 0}
              variant="compact"
              isLoading={isLoading}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatsCard
              title="Rejected"
              value={stats?.rejected ?? 0}
              variant="compact"
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      </div>
      {/* Table with filters */}
      <div className="mt-6">
        <WaitlistEarlySignupControl />
      </div>
    </div>
  );
};

export default WaitlistControl;
