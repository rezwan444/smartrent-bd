"use client";

import StatsCard from "@/components/shared/StatsCard";
import { useGetAdminDashboardDataQuery } from "@/redux/api/admin-dashboard/adminDashboardApi";
import { motion } from "framer-motion";
import MostViewedTeamsCard from "./MostViewedTeamsCard";
import NextMajorEvent from "./NextMajorEvent";
import RecentCheatingAlerts from "./RecentCheatingAlerts";
import TodaysMatchesCard from "./TodaysMatchesCard";
import WaitlistCard from "./WaitlistCard";

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

const AdminHome = () => {
  const { data: response, isLoading } = useGetAdminDashboardDataQuery();
  const dashboardData = response?.data;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show">
      {/* Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Registered"
            icon="Users"
            value={dashboardData?.overview?.totalRegistered || 0}
            valueText="Total Users"
            iconBgColor=""
            iconColor="text-purple-600"
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Active Players"
            icon="User"
            value={dashboardData?.overview?.activePlayers || 0}
            valueText="Currently Active"
            iconBgColor=""
            iconColor="text-green-500"
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Franchises"
            icon="Activity"
            value={dashboardData?.overview?.totalFranchises || 0}
            valueText="Available Franchises"
            iconBgColor=""
            iconColor="text-blue-400"
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Assigned Teams"
            icon="IoMdCheckmarkCircleOutline"
            value={dashboardData?.overview?.assignedTeams || 0}
            valueText="Claimed Teams"
            iconBgColor=""
            iconColor="text-blue-600"
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Investigations"
            icon="FiAlertTriangle"
            value={dashboardData?.overview?.activeInvestigations || 0}
            valueText="Active Cases"
            iconBgColor=""
            iconColor="text-orange-600"
            isLoading={isLoading}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title="Revenue (7 days)"
            icon="PiCurrencyDollarSimpleBold"
            value={`$${dashboardData?.overview?.revenueLast7Days || 0}`}
            valueText="Last 7 Days"
            iconBgColor=""
            iconColor="text-green-600"
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* NextMajorEvent */}
      <motion.div variants={itemVariants} className="mt-8">
        <NextMajorEvent
          title="Next Major Event"
          eventName={dashboardData?.nextMajorEvent?.title || "Loading..."}
          dateText={
            dashboardData
              ? `${new Date(dashboardData.nextMajorEvent.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} – ${dashboardData.nextMajorEvent.daysRemaining} days remaining`
              : "Loading..."
          }
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch"
      >
        <MostViewedTeamsCard
          data={dashboardData?.mostViewedTeams}
          isLoading={isLoading}
        />
        <RecentCheatingAlerts
          data={dashboardData?.recentCheatingAlerts}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 "
      >
        <TodaysMatchesCard
          data={dashboardData?.todaysMatches}
          isLoading={isLoading}
        />
        <WaitlistCard data={dashboardData?.waitlist} isLoading={isLoading} />
      </motion.div>
    </motion.div>
  );
};

export default AdminHome;
