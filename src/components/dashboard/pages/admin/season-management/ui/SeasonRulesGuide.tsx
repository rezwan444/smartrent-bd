"use client";

import {
  CalendarCheck,
  CheckCircle2,
  Gamepad2,
  Info,
  ShieldAlert,
  SlidersHorizontal,
  Zap,
} from "lucide-react";

export default function SeasonRulesGuide() {
  const steps = [
    {
      step: "01",
      title: "Create Season",
      desc: "Admin initializes a new season. Initial status starts in UPCOMING mode.",
      api: "POST /api/v1/seasons",
      icon: <CalendarCheck className="w-5 h-5 text-destructive" />,
      color: "border-destructive/30 bg-destructive/5",
    },
    {
      step: "02",
      title: "Select Madden Team",
      desc: "Franchise owners select an official NFL team. lockAcknowledged: true is strictly required.",
      api: "POST /api/v1/seasons/select-madden-team",
      icon: <Gamepad2 className="w-5 h-5 text-purple-400" />,
      color: "border-purple-500/30 bg-purple-500/5",
    },
    {
      step: "03",
      title: "Activate Season & Lock",
      desc: "Admin activates the season. Automatically freezes all Madden team selections permanently.",
      api: "PATCH /api/v1/seasons/activate",
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      color: "border-emerald-500/30 bg-emerald-500/5",
    },
    {
      step: "04",
      title: "Emergency Lock Override",
      desc: "Admin can manually unlock or lock Madden team modifications whenever required.",
      api: "PATCH /api/v1/seasons/override-lock",
      icon: <SlidersHorizontal className="w-5 h-5 text-amber-400" />,
      color: "border-amber-500/30 bg-amber-500/5",
    },
  ];

  const rules = [
    {
      title: "Lock Acknowledgment Enforcement",
      detail:
        "Selecting a Madden team requires lockAcknowledged: true. Without it, validation returns 400 Bad Request.",
    },
    {
      title: "Duplicate Season Prevention",
      detail:
        "Attempting to recreate an existing season number returns a 409 Conflict error.",
    },
    {
      title: "Active Season Protection",
      detail:
        "Once a season is ACTIVE, any attempts to modify a locked team will be blocked unless an Admin executes a Lock Override.",
    },
    {
      title: "32 NFL Team Limitation",
      detail:
        "Only the 32 official Madden In-Game NFL Teams retrieved from the backend API are allowed.",
    },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-primary-dark bg-card p-6 shadow-lg">
      {/* Title */}
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-heading">
          <Info className="w-5 h-5 text-destructive" />
          Season Lifecycle & Business Rules Reference
        </h3>
        <p className="text-xs text-white/70 mt-0.5">
          Follow the standardized Madden Fantasy League lifecycle and administrative guidelines.
        </p>
      </div>

      {/* 4 Lifecycle Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((item) => (
          <div
            key={item.step}
            className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 relative overflow-hidden bg-linear-to-b from-[#13171e] to-[#0a0c0f] ${item.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-destructive">
                STEP {item.step}
              </span>
              <div className="p-2 rounded-lg bg-black/60 border border-white/10">
                {item.icon}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">{item.title}</h4>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-white/10">
              <code className="text-[11px] font-mono text-white/60 block truncate">
                {item.api}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="rounded-xl border border-white/10 bg-linear-to-b from-[#13171e] to-[#0a0c0f] p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Validation & Authorization Guardrails
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/10 bg-black/40 p-3 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold text-white">
                  {rule.title}
                </h5>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  {rule.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
