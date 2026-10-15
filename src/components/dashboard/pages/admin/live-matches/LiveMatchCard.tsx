import { Button } from "@/components/ui/button";
import { ILiveMatch } from "@/types/global";
import { cn } from "@/utils";
import { formatStatusText } from "@/utils/formatStatusText";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icons } from "@/utils/icons";
import { truncateText } from "@/utils/truncateText";

interface Props {
  match: ILiveMatch;
}

export default function LiveMatchCard({ match }: Props) {
  const { teamHome, teamAway } = match;
  const [isCopied, setIsCopied] = useState(false);
  const [isIdCopied, setIsIdCopied] = useState(false);
  const [homeImgError, setHomeImgError] = useState(false);
  const [awayImgError, setAwayImgError] = useState(false);

  const handleCopyStreamKey = () => {
    if (match.streamKey) {
      navigator.clipboard.writeText(match.streamKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyId = () => {
    if (match.id) {
      navigator.clipboard.writeText(match.id);
      setIsIdCopied(true);
      setTimeout(() => setIsIdCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 hover:border-white/30 bg-primary-dark p-4 transition-all duration-300 h-full flex flex-col justify-between"
    >
      <div>
        {/* HEADER */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-col text-xs text-muted-foreground">
            <span className="font-medium text-white/70">
              Week {match.weekNumber} • Round {match.roundNumber}
            </span>
            <span>{new Date(match.gameTime).toLocaleString()}</span>
          </div>

          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold animate-pulse",
              match.status === "LIVE"
                ? "bg-destructive text-destructive-foreground"
                : "bg-white/10 text-foreground"
            )}
          >
            {formatStatusText(match.status)}
          </span>
        </div>

        {/* DETAILS - Matchup */}
        <div className="bg-card/40 rounded-xl p-4 my-4 flex items-center justify-between border border-white/5">
          {/* Home Team */}
          <div className="flex flex-col items-center text-center gap-2 w-1/3">
            <div className="h-14 w-14 relative bg-card rounded-xl border p-1 overflow-hidden flex items-center justify-center">
              {teamHome?.logo_url && !homeImgError ? (
                <Image
                  src={teamHome.logo_url}
                  alt="home_team_logo"
                  fill
                  unoptimized={true}
                  className="object-contain p-1"
                  draggable={false}
                  onError={() => setHomeImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {truncateText(teamHome?.mascot || "TM", 2).replace("...", "")}
                </span>
              )}
            </div>
            <span className="font-bold text-sm leading-tight text-white/90">
              {teamHome?.mascot}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Home
            </span>
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-xl font-black text-white/20 italic">VS</span>
            {match.viewerCount > 0 && (
              <span className="text-xs text-muted mt-1 flex items-center gap-1">
                <Icons.Users className="w-3 h-3 text-destructive" />
                {match.viewerCount}
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center text-center gap-2 w-1/3">
            <div className="h-14 w-14 relative bg-card rounded-xl border p-1 overflow-hidden flex items-center justify-center">
              {teamAway?.logo_url && !awayImgError ? (
                <Image
                  src={teamAway.logo_url}
                  alt="away_team_logo"
                  fill
                  unoptimized={true}
                  className="object-contain p-1"
                  draggable={false}
                  onError={() => setAwayImgError(true)}
                />
              ) : (
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {truncateText(teamAway?.mascot || "TM", 2).replace("...", "")}
                </span>
              )}
            </div>
            <span className="font-bold text-sm leading-tight text-white/90">
              {teamAway?.mascot}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Away
            </span>
          </div>
        </div>

        {/* Stream Details */}
        <div className="space-y-2 mt-4 text-xs bg-black/20 p-3 rounded-lg border border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Match ID:</span>
            <div className="flex items-center gap-1 relative">
              <span className="text-foreground font-mono truncate max-w-[120px]" title={match.id}>
                {match.id.substring(0, 12)}...
              </span>
              <button
                onClick={handleCopyId}
                className="text-muted hover:text-white transition-colors"
              >
                {isIdCopied ? (
                  <Icons.IoMdCheckmarkCircleOutline className="w-4 h-4 text-success" />
                ) : (
                  <Icons.Copy className="w-3.5 h-3.5" /> 
                )}
              </button>
              {isIdCopied && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className="text-[10px] text-success absolute -top-4 right-0 bg-success/10 px-1.5 rounded"
                >
                  Copied!
                </motion.span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Stream Key:</span>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-mono truncate max-w-[120px]">
                {match.streamKey ? "••••••••••••" : "N/A"}
              </span>
              {match.streamKey && (
                <div className="flex items-center gap-1 relative">
                  <button
                    onClick={handleCopyStreamKey}
                    className="text-muted hover:text-white transition-colors"
                  >
                    {isCopied ? (
                      <Icons.IoMdCheckmarkCircleOutline className="w-4 h-4 text-success" />
                    ) : (
                      <Icons.Copy className="w-4 h-4" /> 
                    )}
                  </button>
                  {isCopied && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="text-[10px] text-success absolute -top-4 right-0 bg-success/10 px-1.5 rounded"
                    >
                      Copied!
                    </motion.span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Playback URL:</span>
            <span className="text-foreground truncate max-w-[150px]">
              {match.playbackUrl ? (
                <a href={match.playbackUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                  Link
                </a>
              ) : "N/A"}
            </span>
          </div>
          {match.rtmpUrl && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">RTMP URL:</span>
              <span className="text-foreground truncate max-w-[150px] font-mono text-[10px]" title={match.rtmpUrl}>
                {match.rtmpUrl}
              </span>
            </div>
          )}

          {match.channelArn && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Channel ARN:</span>
              <span className="text-foreground truncate max-w-[150px] font-mono text-[10px]" title={match.channelArn}>
                {match.channelArn}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-4">
        <Link href={`/dashboard/admin/live-matches/${match.id}`} className="w-full">
          <Button
            size="sm"
            className="h-11 w-full bg-card text-foreground hover:text-foreground hover:bg-card-foreground transition-all"
            variant="outline"
          >
            <Icons.Activity className="w-4 h-4 mr-2" />
            Monitor Stream
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
