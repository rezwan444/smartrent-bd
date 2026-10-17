"use client";

import Image from "next/image";
import {
  GraduationCap,
  MapPin,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Eye,
} from "lucide-react";
import { CompatibilityResult, RoommateProfile } from "@/types/roommate";
import { LIFESTYLE_LABELS } from "@/lib/roommateCompatibility";
import { ConnectionStatus } from "@/types/roommate";

interface RoommateCardProps {
  profile: RoommateProfile;
  compatibility: CompatibilityResult;
  connectionStatus: ConnectionStatus;
  onViewDetails: (profile: RoommateProfile) => void;
}

export function RoommateCard({
  profile,
  compatibility,
  connectionStatus,
  onViewDetails,
}: RoommateCardProps) {
  const score = compatibility.overallScore;

  // Semantic color for compatibility badge
  const getScoreBadgeClass = (score: number) => {
    if (score >= 85)
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    if (score >= 65)
      return "bg-primary/10 text-primary border-primary/30";
    if (score >= 45)
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30";
    return "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30";
  };

  return (
    <div className="bg-card border border-border rounded-xs overflow-hidden shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
      {/* Header with Avatar and Basic Info */}
      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-border bg-secondary">
            <Image
              src={profile.avatar}
              alt={profile.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1.5">
              <h3 className="font-semibold text-base text-foreground truncate">
                {profile.name}
              </h3>
              {/* Compatibility Score Tag */}
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-xs font-bold border shrink-0 ${getScoreBadgeClass(
                  score
                )}`}
                title={`${score}% compatibility with your selected preferences`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{score}% Match</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">{profile.department}</span>
            </p>

            <p className="text-xs text-foreground/80 font-medium truncate mt-0.5">
              {profile.university}
            </p>
          </div>
        </div>

        {/* Verification & Looking For Badges */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          {profile.verifiedStudent && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xs border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Verified Student ID
            </span>
          )}

          <span className="inline-flex items-center text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-xs border border-border">
            Seeking {profile.lookingForGender === "any" ? "Any" : profile.lookingForGender} Roommate
          </span>

          {connectionStatus === "MUTUAL_ACCEPTED" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-xs border border-emerald-500/30">
              <UserCheck className="w-3 h-3" />
              Connected
            </span>
          )}

          {connectionStatus === "REQUEST_SENT" && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-xs border border-amber-500/30">
              <Clock className="w-3 h-3" />
              Consent Pending
            </span>
          )}
        </div>

        {/* Location & Budget Row */}
        <div className="mt-4 pt-3 border-t border-border/80 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[11px] text-muted-foreground block">Max Seat Budget</span>
            <span className="font-bold text-foreground text-sm">
              ৳{profile.maxBudget.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-muted-foreground block">Preferred Zone</span>
            <span className="font-medium text-foreground truncate block flex items-center gap-1">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="truncate">{profile.preferredLocations[0]}</span>
            </span>
          </div>
        </div>

        {/* Routine Summary Chips */}
        <div className="mt-3.5 space-y-1.5 bg-secondary/40 p-2.5 rounded-xs border border-border/60">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Moon className="w-3 h-3 text-primary" /> Sleep
            </span>
            <span className="font-medium text-foreground">
              {profile.lifestyle.sleepSchedule === "early_bird"
                ? "Early Bird (<11 PM)"
                : profile.lifestyle.sleepSchedule === "night_owl"
                ? "Night Owl (>1 AM)"
                : "Moderate (11 PM-1 AM)"}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Smoking</span>
            <span className="font-medium text-foreground">
              {LIFESTYLE_LABELS.smokingHabit[profile.lifestyle.smokingHabit]}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Study Habit</span>
            <span className="font-medium text-foreground">
              {profile.lifestyle.studyEnvironment === "silent"
                ? "Quiet / Silent"
                : profile.lifestyle.studyEnvironment === "ambient_music"
                ? "Soft Ambient"
                : profile.lifestyle.studyEnvironment === "group_friendly"
                ? "Group Discussion"
                : "Flexible"}
            </span>
          </div>
        </div>

        {/* Key Compatibility Highlight */}
        {compatibility.keyStrengths.length > 0 && (
          <div className="mt-3 flex items-start gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{compatibility.keyStrengths[0]}</span>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={() => onViewDetails(profile)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Match Breakdown & Contact</span>
        </button>
      </div>
    </div>
  );
}
