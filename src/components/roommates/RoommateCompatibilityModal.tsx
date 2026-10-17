"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Send,
  UserCheck,
  RotateCcw,
  Info,
  Clock,
} from "lucide-react";
import {
  CompatibilityResult,
  ConnectionStatus,
  RoommateProfile,
  UserPreferencesProfile,
} from "@/types/roommate";
import { toast } from "sonner";

interface RoommateCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: RoommateProfile | null;
  userProfile: UserPreferencesProfile;
  compatibility: CompatibilityResult | null;
  connectionStatus: ConnectionStatus;
  onRequestConnect: (profileId: string) => void;
  onSimulateResponse: (profileId: string, accept: boolean) => void;
  onResetConnection: (profileId: string) => void;
}

export function RoommateCompatibilityModal({
  isOpen,
  onClose,
  profile,
  userProfile,
  compatibility,
  connectionStatus,
  onRequestConnect,
  onSimulateResponse,
  onResetConnection,
}: RoommateCompatibilityModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!profile || !compatibility) return null;

  const score = compatibility.overallScore;

  const handleCopy = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
      toast.success("Student email copied to clipboard");
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
      toast.success("Phone number copied to clipboard");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return (
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            High Match
          </span>
        );
      case "good":
        return (
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-primary/10 text-primary border border-primary/20">
            Compatible
          </span>
        );
      case "moderate":
        return (
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            Moderate
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            Friction
          </span>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl md:max-w-3xl max-h-[90dvh] sm:max-h-[86vh] p-0 flex flex-col rounded-xs bg-card border border-border shadow-2xl overflow-hidden">
        {/* Fixed Header Bar */}
        <DialogHeader className="shrink-0 p-4 sm:p-5 border-b border-border bg-secondary/30">
          <div className="flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden shrink-0 border-2 border-border bg-secondary">
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate">
                    {profile.name}
                  </DialogTitle>
                  {profile.verifiedStudent && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-xs border border-emerald-500/20 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {profile.department} ({profile.semester})
                  </span>
                </p>

                <p className="text-xs font-medium text-foreground/80 truncate">
                  {profile.university}
                </p>
              </div>
            </div>

            {/* Score Ring Summary */}
            <div className="shrink-0 flex items-center gap-2.5 bg-card px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xs border border-border">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Match Score
                </span>
                <span className="text-xs font-semibold text-foreground">
                  vs {userProfile.name.split(" ")[0]}
                </span>
              </div>
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-primary/40 bg-secondary text-primary font-bold text-xs sm:text-sm">
                {score}%
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          {/* Key Strengths & Potential Frictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {compatibility.keyStrengths.length > 0 && (
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xs space-y-2">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Compatibility Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {compatibility.keyStrengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        •
                      </span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {compatibility.potentialFrictions.length > 0 ? (
              <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xs space-y-2">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Points of Difference to Discuss
                </h4>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {compatibility.potentialFrictions.map((fric, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">
                        •
                      </span>
                      <span>{fric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3.5 bg-secondary/50 border border-border rounded-xs flex items-center justify-center text-center p-3">
                <p className="text-xs text-muted-foreground">
                  No major routine conflicts detected with your current lifestyle preferences.
                </p>
              </div>
            )}
          </div>

          {/* Explainable Category-by-Category Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground font-heading flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                Explainable Score Breakdown by Category
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Deterministic 100-point algorithm
              </span>
            </div>

            <div className="border border-border rounded-xs divide-y divide-border overflow-hidden bg-background">
              {compatibility.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="p-3 sm:p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {cat.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        (Weight: {cat.weight}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(cat.status)}
                      <span className="font-mono font-bold text-foreground">
                        {cat.score}%
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-normal">
                    {cat.reason}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-foreground/75 pt-1">
                    <span>
                      <strong className="text-foreground">Your habit:</strong> {cat.userValue}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">|</span>
                    <span>
                      <strong className="text-foreground">{profile.name.split(" ")[0]}&apos;s habit:</strong> {cat.profileValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* About Student & Housing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2 p-3.5 bg-secondary/30 rounded-xs border border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                About & Personality
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {profile.about}
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-foreground block mb-1">
                  Hobbies & Interests:
                </span>
                <div className="flex flex-wrap gap-1">
                  {profile.hobbies.map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[10px] font-medium bg-background text-foreground border border-border rounded-xs"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2.5 p-3.5 bg-secondary/30 rounded-xs border border-border text-xs">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Housing Logistics
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Max Seat Budget</span>
                  <span className="font-bold text-foreground text-sm">
                    ৳{profile.maxBudget.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">/month</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Move-in Date</span>
                  <span className="font-medium text-foreground">{profile.moveInDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Room Preference</span>
                  <span className="font-medium text-foreground capitalize">
                    {profile.lookingForRoomType.replace("_", " ")}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Student ID Proof</span>
                  <span className="font-mono text-[11px] text-foreground">
                    {profile.studentIdCardNumberMasked}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mutual-Consent Contact Sharing Section */}
          <div className="border border-border rounded-xs bg-secondary/20 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-primary" />
                  Mutual-Consent Contact Sharing
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Student phone numbers and email are shielded until both individuals consent to connect.
                </p>
              </div>

              {/* Status Indicator */}
              <div>
                {connectionStatus === "MUTUAL_ACCEPTED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    <UserCheck className="w-3.5 h-3.5" />
                    Mutual Consent Granted
                  </span>
                ) : connectionStatus === "REQUEST_SENT" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    Waiting for {profile.name.split(" ")[0]}&apos;s Consent
                  </span>
                ) : connectionStatus === "DECLINED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-500/30">
                    Request Declined
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-muted text-muted-foreground text-xs font-medium border border-border">
                    <Lock className="w-3.5 h-3.5" />
                    Contacts Masked
                  </span>
                )}
              </div>
            </div>

            {/* Contact Details Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone / WhatsApp Box */}
              <div className="p-3 bg-card border border-border rounded-xs space-y-1.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3 text-primary" /> Phone & WhatsApp
                </span>

                {connectionStatus === "MUTUAL_ACCEPTED" ? (
                  <div className="space-y-2">
                    <p className="font-mono text-sm font-bold text-foreground">
                      {profile.contact.phone}
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${profile.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xs hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.contact.phone, "phone")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground bg-secondary border border-border rounded-xs hover:bg-secondary/80 transition-colors cursor-pointer"
                      >
                        {copiedPhone ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedPhone ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-mono text-sm text-muted-foreground tracking-wider">
                      {profile.contact.maskedPhone}
                    </p>
                    <span className="text-[10px] text-muted-foreground italic">
                      Locked until consent is exchanged
                    </span>
                  </div>
                )}
              </div>

              {/* University Email Box */}
              <div className="p-3 bg-card border border-border rounded-xs space-y-1.5">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Mail className="w-3 h-3 text-primary" /> University Email
                </span>

                {connectionStatus === "MUTUAL_ACCEPTED" ? (
                  <div className="space-y-2">
                    <p className="font-mono text-xs font-bold text-foreground truncate">
                      {profile.contact.email}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(profile.contact.email, "email")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-foreground bg-secondary border border-border rounded-xs hover:bg-secondary/80 transition-colors cursor-pointer"
                      >
                        {copiedEmail ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedEmail ? "Copied" : "Copy Email"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-mono text-sm text-muted-foreground tracking-wider">
                      {profile.contact.maskedEmail}
                    </p>
                    <span className="text-[10px] text-muted-foreground italic">
                      Campus email verified
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Interaction Buttons & Demo Consent Simulation Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/80">
              {connectionStatus === "NONE" && (
                <button
                  type="button"
                  onClick={() => onRequestConnect(profile.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Request to Connect & Share Contacts</span>
                </button>
              )}

              {/* Demo Simulation Controls for Judges & Evaluation */}
              {connectionStatus === "REQUEST_SENT" && (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-background p-3 rounded-xs border border-border">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block">
                      Hackathon Demo Simulation:
                    </span>
                    <span>Test how {profile.name.split(" ")[0]} responds to your consent request:</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSimulateResponse(profile.id, true)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xs transition-colors cursor-pointer"
                    >
                      Simulate Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => onSimulateResponse(profile.id, false)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xs transition-colors cursor-pointer"
                    >
                      Simulate Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => onResetConnection(profile.id)}
                      className="px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {connectionStatus === "MUTUAL_ACCEPTED" && (
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    You and {profile.name.split(" ")[0]} have mutually unlocked each other&apos;s contacts.
                  </span>
                  <button
                    type="button"
                    onClick={() => onResetConnection(profile.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 border border-border rounded-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Consent (Demo)</span>
                  </button>
                </div>
              )}

              {connectionStatus === "DECLINED" && (
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    The connection request was declined. Contact details remain concealed.
                  </span>
                  <button
                    type="button"
                    onClick={() => onResetConnection(profile.id)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline px-2 py-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Try Again (Demo Reset)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Prototype Limitation Note */}
            <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-background/60 p-2.5 rounded-xs border border-border/60">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <span>
                <strong>Prototype Notice:</strong> Consent state is managed in client state for hackathon evaluation. In production, mutual consent is cryptographically verified and enforced server-side before releasing personal contact records.
              </span>
            </div>
          </div>

          {/* Algorithm Disclaimer */}
          <div className="text-[11px] text-muted-foreground border-t border-border pt-3 leading-relaxed">
            <strong>Disclaimer:</strong> {compatibility.disclaimer}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
