"use client";

import { useGetLiveMatchesQuery } from "@/redux/api/match/matchApi";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import LiveMatchCardSkeleton from "../../../skeletons/LiveMatchCardSkeleton";
import LiveMatchCard from "./LiveMatchCard";

export default function LiveMatchesPage() {
  // Polling every 15 seconds to check for live updates
  const {
    data: liveMatchesData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetLiveMatchesQuery(undefined, {
    pollingInterval: 15000,
  });

  const matches = liveMatchesData?.data || [];

  return (
    <div className="flex h-full flex-col">
      {/* Header section */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Icons.Activity className="w-6 h-6 text-destructive animate-pulse" />
            Live Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor all currently active game streams in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 hover:cursor-pointer"
          >
            <Icons.RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <LiveMatchCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/5 rounded-xl bg-card/20">
            <Icons.FiAlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-xl font-bold text-foreground">
              Failed to load live matches
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              There was an error communicating with the server. Please check
              your connection or try again later.
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        ) : matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[50vh] text-center border border-white/5 rounded-xl bg-card/10"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Icons.Activity className="w-16 h-16 text-muted-foreground relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              No Live Matches
            </h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              There are currently no active matches being streamed. When a
              tournament goes live, matches will appear here automatically.
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          >
            {matches.map((match) => (
              <LiveMatchCard key={match.id} match={match} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
