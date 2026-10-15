"use client";
import { motion } from "framer-motion";
import StatsCard from "@/components/shared/StatsCard";
import RecentActivity from "./RecentActivity";
import { useGetFinancialCenterDataQuery } from "@/redux/api/finance/financeApi";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const FinancialCenterPage = () => {
  const { data: response, isLoading } = useGetFinancialCenterDataQuery();
  const metrics = response?.data?.metrics;
  const recentActivity = response?.data?.recentActivity || [];

  return (
    <div>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-8 grid-cols-1 md:grid-cols-3 ">
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Revenue YTD"
            value={`$${metrics?.totalRevenueYTD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
            variant="compact"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Elite Tier Sales"
            value={`$${metrics?.eliteTierSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
            variant="compact"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Premium Tier Sales"
            value={`$${metrics?.premiumTierSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
            variant="compact"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Standard Tier Sales"
            value={`$${metrics?.standardTierSales?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
            variant="compact"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Sponsor Revenue (YTD)"
            value={`$${metrics?.sponsorRevenueYTD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
            variant="compact"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Viewer Subscriptions"
            value={`$${metrics?.viewerSubscriptions?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`}
            variant="compact"
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>
      {/* main ui */}
      <div className="mt-6">
        <RecentActivity data={recentActivity} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default FinancialCenterPage;
