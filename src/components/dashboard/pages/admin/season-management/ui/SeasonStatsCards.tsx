"use client";

import StatsCard from "@/components/shared/StatsCard";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface Props {
  currentSeason: number;
  seasonStatus: string;
  totalMaddenTeams: number;
  assignedCount: number;
  isLocked: boolean;
  isLoading?: boolean;
}

export default function SeasonStatsCards({
  currentSeason,
  totalMaddenTeams = 32,
  assignedCount = 0,
  isLocked = false,
  isLoading = false,
}: Props) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Active Season"
          value={currentSeason}
          valueText={`Season ${currentSeason}`}
          icon="CalendarCheck"
          iconBgColor="bg-destructive/20"
          iconColor="text-destructive-soft"
          cardClass="border-white/20 bg-linear-to-b from-[#1c202e] to-[#121520] shadow-xl"
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatsCard
          title="Madden NFL Teams"
          value={totalMaddenTeams}
          valueText={`${totalMaddenTeams} Teams`}
          icon="Trophy"
          iconBgColor="bg-amber-500/20"
          iconColor="text-amber-300"
          cardClass="border-white/20 bg-linear-to-b from-[#1c202e] to-[#121520] shadow-xl"
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatsCard
          title="Madden Teams Assigned"
          value={assignedCount}
          valueText={`${assignedCount} / ${totalMaddenTeams}`}
          icon="Users"
          iconBgColor="bg-blue-500/20"
          iconColor="text-blue-400"
          cardClass="border-white/20 bg-linear-to-b from-[#1c202e] to-[#121520] shadow-xl"
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatsCard
          title="Selection Lock State"
          valueText={isLocked ? "LOCKED" : "UNLOCKED"}
          icon="Settings"
          iconBgColor={isLocked ? "bg-red-500/20" : "bg-emerald-500/20"}
          iconColor={isLocked ? "text-red-400" : "text-emerald-400"}
          cardClass="border-white/20 bg-linear-to-b from-[#1c202e] to-[#121520] shadow-xl"
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
