"use client";

import { useState } from "react";
import { IProperty } from "@/types/property";
import {
  ShieldCheck,
  PhoneCall,
  Clock,
  CalendarCheck,
  UserCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface PropertyOwnerCardProps {
  property: IProperty;
  onRequestVisit: () => void;
}

export function PropertyOwnerCard({
  property,
  onRequestVisit,
}: PropertyOwnerCardProps) {
  const [showPhone, setShowPhone] = useState(false);

  const owner = property.owner || {
    name: property.isVerified ? "Verified Property Owner" : "Listing Representative",
    role: property.type === "mess" ? "Property Manager" : "Landlord",
    isVerified: property.isVerified,
    memberSince: "2024",
    responseTime: "Within 2 hours",
    phone: "+880 1700-000000",
  };

  const isVerifiedHost = owner.isVerified || property.isVerified;

  return (
    <div className="bg-card border border-border rounded-xs p-5 space-y-4 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Hosted & Managed By
          </span>
          <h4 className="text-base font-bold text-foreground leading-snug">
            {owner.name}
          </h4>
          <p className="text-xs text-muted-foreground">{owner.role}</p>
        </div>

        {/* Verification Status Badge */}
        {isVerifiedHost ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/25 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>NID Verified</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium bg-background text-muted-foreground border border-border shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Standard Host</span>
          </span>
        )}
      </div>

      {/* Host Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border">
        <div className="flex items-center gap-1.5 py-1">
          <CalendarCheck className="w-3.5 h-3.5 text-primary" />
          <span>Member since {owner.memberSince || "2024"}</span>
        </div>
        <div className="flex items-center gap-1.5 py-1">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>Replies {owner.responseTime || "Within few hours"}</span>
        </div>
      </div>

      {/* Host Contact Actions */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          onClick={onRequestVisit}
          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Request an In-Person Visit</span>
        </button>

        {showPhone ? (
          <a
            href={`tel:${owner.phone || "+8801700000000"}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/70 rounded-xs border border-primary/20 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call {owner.phone || "+880 1700-000000"}</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-foreground bg-background hover:bg-secondary/40 rounded-xs border border-border transition-colors cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Show Landlord Phone Number</span>
          </button>
        )}
      </div>

      <div className="p-2.5 rounded-xs bg-background border border-border text-[11px] text-muted-foreground flex items-start gap-2">
        <HelpCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
        <p className="leading-snug">
          Mention SmartRent BD when speaking with the host to verify advertised rent and deposit terms.
        </p>
      </div>
    </div>
  );
}
