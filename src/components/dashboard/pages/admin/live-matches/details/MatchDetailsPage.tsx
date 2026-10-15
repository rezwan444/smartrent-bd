"use client";

import { useGetMatchDetailsQuery } from "@/redux/api/match/matchApi";
import { cn } from "@/utils";
import { formatStatusText } from "@/utils/formatStatusText";
import { Icons } from "@/utils/icons";
import { truncateText } from "@/utils/truncateText";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import LiveVideoPlayer from "./LiveVideoPlayer";

interface Props {
  matchId: string;
}

export default function MatchDetailsPage({ matchId }: Props) {
  const {
    data: matchData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetMatchDetailsQuery(matchId, {
    pollingInterval: 15000,
  });

  const [isStreamKeyCopied, setIsStreamKeyCopied] = useState(false);
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [isRtmpCopied, setIsRtmpCopied] = useState(false);
  const [isMatchIdCopied, setIsMatchIdCopied] = useState(false);
  const [isArnCopied, setIsArnCopied] = useState(false);
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);

  const match = matchData?.data;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-6 w-full animate-pulse">
        <div className="h-20 w-full bg-card/40 rounded-xl border border-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 h-100 w-full bg-card/40 rounded-xl border border-white/5" />
          <div className="lg:col-span-1 h-100 w-full bg-card/40 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  if (isError || !match) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <Icons.FiAlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold text-foreground">Match Not Found</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Could not load the details for this match.
        </p>
        <Link
          href="/dashboard/admin/live-matches"
          className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90"
        >
          Back to Live Matches
        </Link>
      </div>
    );
  }

  const { teamHome, teamAway } = match;

  const handleCopy = (text: string, type: "key" | "url" | "rtmp" | "matchId" | "arn") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setIsStreamKeyCopied(true);
      setTimeout(() => setIsStreamKeyCopied(false), 2000);
    } else if (type === "url") {
      setIsUrlCopied(true);
      setTimeout(() => setIsUrlCopied(false), 2000);
    } else if (type === "rtmp") {
      setIsRtmpCopied(true);
      setTimeout(() => setIsRtmpCopied(false), 2000);
    } else if (type === "matchId") {
      setIsMatchIdCopied(true);
      setTimeout(() => setIsMatchIdCopied(false), 2000);
    } else if (type === "arn") {
      setIsArnCopied(true);
      setTimeout(() => setIsArnCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-primary-dark/50 p-4 rounded-xl border border-white/10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin/live-matches"
              className="p-2 bg-card rounded-md hover:bg-card/80 transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Match Details
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold ml-2",
                    match.status === "LIVE"
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-white/10 text-foreground",
                  )}
                >
                  {formatStatusText(match.status)}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Week {match.weekNumber} • Round {match.roundNumber} •{" "}
                {new Date(match.gameTime).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 hover:cursor-pointer"
          >
            <Icons.RefreshCw
              className={cn("w-4 h-4", isFetching && "animate-spin")}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Matchup & Score */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/40 rounded-xl p-6 border border-white/5 flex flex-col justify-center min-h-75">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-4 w-full sm:w-1/3 text-center order-1 sm:order-0">
                <div className="h-24 w-24 relative bg-card rounded-2xl border p-2 overflow-hidden flex items-center justify-center shadow-lg">
                  {teamHome?.logo_url && !homeImgError ? (
                    <Image
                      src={teamHome.logo_url}
                      alt="home_team_logo"
                      fill
                      unoptimized={true}
                      className="object-contain p-2"
                      draggable={false}
                      onError={() => setHomeImgError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground uppercase">
                      {truncateText(teamHome?.mascot || "TM", 2).replace(
                        "...",
                        "",
                      )}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white/90">
                    {teamHome?.mascot}
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    {teamHome?.city} (Home)
                  </p>
                </div>
              </div>

              {/* Score / VS */}
              <div className="flex flex-col items-center justify-center w-full sm:w-1/3 order-2 sm:order-0 mt-4 sm:mt-0">
                {match.score ? (
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-widest flex items-center gap-4">
                    <span>{match.score?.home || 0}</span>
                    <span className="text-white/20">-</span>
                    <span>{match.score?.away || 0}</span>
                  </div>
                ) : (
                  <span className="text-4xl sm:text-5xl font-black text-white/20 italic">
                    VS
                  </span>
                )}
                {match.viewerCount > 0 && (
                  <span className="text-sm text-muted mt-2 flex items-center gap-1 font-medium bg-destructive/10 px-3 py-1 rounded-full">
                    <Icons.Users className="w-4 h-4" />
                    {match.viewerCount} Viewers
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-4 w-full sm:w-1/3 text-center order-3 sm:order-0">
                <div className="h-24 w-24 relative bg-card rounded-2xl border p-2 overflow-hidden flex items-center justify-center shadow-lg">
                  {teamAway?.logo_url && !awayImgError ? (
                    <Image
                      src={teamAway.logo_url}
                      alt="away_team_logo"
                      fill
                      unoptimized={true}
                      className="object-contain p-2"
                      draggable={false}
                      onError={() => setAwayImgError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-muted-foreground uppercase">
                      {truncateText(teamAway?.mascot || "TM", 2).replace(
                        "...",
                        "",
                      )}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white/90">
                    {teamAway?.mascot}
                  </h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    {teamAway?.city} (Away)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Video Player Section */}
          <div className="bg-card/40 rounded-xl p-4 sm:p-6 border border-white/5 flex flex-col min-h-75">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="relative flex h-5 w-5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-20"></span>
                <Icons.MonitorPlay className="relative z-10 h-5 w-5 text-red-500" />
              </div>
              Live Stream
            </h3>
            {match.playbackUrl ? (
              <LiveVideoPlayer url={match.playbackUrl} />
            ) : (
              <div className="bg-black/50 border border-white/5 rounded-xl flex flex-col items-center justify-center aspect-video text-muted-foreground w-full h-full">
                <Icons.Monitor className="w-12 h-12 text-white/10 mb-4" />
                <p>No playback URL available for this match.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Technical Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card/30 rounded-xl p-5 border border-white/5">
            <h3 className="font-semibold text-lg border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
              <Icons.Settings className="w-5 h-5 text-primary" />
              Technical Details
            </h3>

            <div className="space-y-4">
              {/* Match ID */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Match ID</p>
                <div className="bg-black/40 p-2.5 rounded flex justify-between items-center border border-white/5">
                  <span className="font-mono text-sm truncate max-w-50">{match.id}</span>
                  {match.id && (
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(match.id, "matchId")}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        <Icons.Copy className="w-4 h-4" />
                      </button>
                      {isMatchIdCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-6 -right-2 bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded font-medium"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stream Key */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Stream Key</p>
                <div className="bg-black/40 p-2.5 rounded flex justify-between items-center border border-white/5">
                  <span className="font-mono text-sm truncate max-w-50">
                    {match.streamKey || "Not generated"}
                  </span>
                  {match.streamKey && (
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(match.streamKey!, "key")}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        <Icons.Copy className="w-4 h-4" />
                      </button>
                      {isStreamKeyCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-6 -right-2 bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded font-medium"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RTMP URL */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">RTMP URL</p>
                <div className="bg-black/40 p-2.5 rounded flex justify-between items-center border border-white/5">
                  <span className="font-mono text-sm truncate max-w-50">
                    {match.rtmpUrl || "N/A"}
                  </span>
                  {match.rtmpUrl && (
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(match.rtmpUrl!, "rtmp")}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        <Icons.Copy className="w-4 h-4" />
                      </button>
                      {isRtmpCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-6 -right-2 bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded font-medium"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Playback URL */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Playback URL (.m3u8)
                </p>
                <div className="bg-black/40 p-2.5 rounded flex justify-between items-center border border-white/5">
                  <span className="font-mono text-sm truncate max-w-50">
                    {match.playbackUrl || "N/A"}
                  </span>
                  {match.playbackUrl && (
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(match.playbackUrl!, "url")}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        <Icons.Copy className="w-4 h-4" />
                      </button>
                      {isUrlCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-6 -right-2 bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded font-medium"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Channel ARN */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Channel ARN
                </p>
                <div className="bg-black/40 p-2.5 rounded flex justify-between items-center border border-white/5">
                  <span className="font-mono text-xs truncate max-w-50">
                    {match.channelArn || "N/A"}
                  </span>
                  {match.channelArn && (
                    <div className="relative">
                      <button
                        onClick={() => handleCopy(match.channelArn!, "arn")}
                        className="text-muted-foreground hover:text-white transition-colors"
                      >
                        <Icons.Copy className="w-4 h-4" />
                      </button>
                      {isArnCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-6 -right-2 bg-success/20 text-success text-[10px] px-1.5 py-0.5 rounded font-medium"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
