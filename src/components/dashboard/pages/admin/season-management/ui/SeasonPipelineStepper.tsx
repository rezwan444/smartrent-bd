"use client";

import { CheckCircle2, Circle, Clock, Flame } from "lucide-react";

interface Props {
  seasonNumber: number;
  status: string;
  isLocked: boolean;
  assignedCount: number;
  totalMaddenTeams?: number;
}

export default function SeasonPipelineStepper({
  seasonNumber,
  status,
  isLocked,
  assignedCount,
  totalMaddenTeams = 32,
}: Props) {
  const isUpcoming = status === "UPCOMING";
  const isActive = status === "ACTIVE";
  const isInactive = status === "INACTIVE";

  const steps = [
    {
      id: "draft",
      title: "1. Team Registration & Madden Draft",
      description: `${assignedCount}/${totalMaddenTeams} Madden Teams Mapped`,
      isDone: isActive || isInactive,
      isCurrent: isUpcoming,
    },
    {
      id: "activate",
      title: "2. Season Activation & Lock",
      description: isLocked ? "Team Selections Locked" : "Selections Unlocked",
      isDone: isActive || isInactive,
      isCurrent: isUpcoming,
    },
    {
      id: "schedule",
      title: "3. Match Fixtures & Live Play",
      description: isActive ? "Season Matches Active" : "Pending Activation",
      isDone: isInactive,
      isCurrent: isActive,
    },
    {
      id: "archive",
      title: "4. Season Conclusion & Archive",
      description: isInactive ? "Season Completed & Archived" : "In Progress",
      isDone: isInactive,
      isCurrent: false,
    },
  ];

  return (
    <div className="rounded-xl border border-white/20 bg-linear-to-b from-[#191c28] to-[#12141d] p-5 backdrop-blur shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-2 font-heading">
          <Flame className="w-4 h-4 text-destructive-soft" />
          Season {seasonNumber} Pipeline Status
        </h3>
        <span className="text-xs text-white/70">
          Status: <strong className="text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">{status}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step) => {
          let stepBg = "bg-neutral-800/80 border-white/15 text-white/70";
          let icon = <Circle className="w-4 h-4 text-white/50 shrink-0" />;

          if (step.isDone) {
            stepBg = "bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-xs";
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
          } else if (step.isCurrent) {
            stepBg = "bg-destructive/20 border-destructive/50 text-white shadow-md ring-1 ring-destructive/40";
            icon = <Clock className="w-4 h-4 text-destructive-soft animate-pulse shrink-0" />;
          }

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-lg border p-3.5 transition-all ${stepBg}`}
            >
              {icon}
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-bold tracking-wide text-white truncate">
                  {step.title}
                </p>
                <p className="text-[11px] text-white/70 truncate">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
