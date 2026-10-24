"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Heart,
  Calendar,
  Share2,
  Flag,
  ArrowLeft,
  Users,
  CheckCircle2,
  ShieldAlert,
  Home,
  Check,
  FileText,
  Building,
  UserCheck,
  XCircle,
  EyeOff,
} from "lucide-react";
import { IProperty, PropertyType } from "@/types/property";
import { FACILITY_DEFINITIONS } from "@/lib/propertyFilters";
import { PropertyGallery } from "./PropertyGallery";
import { PropertyLocationSection } from "./PropertyLocationSection";
import { PropertyOwnerCard } from "./PropertyOwnerCard";
import { RequestVisitModal } from "./RequestVisitModal";
import { getModerationStore } from "@/lib/propertyModerationStorage";
import { ReportListingModal } from "./ReportListingModal";

interface PropertyDetailsClientProps {
  property: IProperty;
}

const TYPE_CONFIG: Record<
  PropertyType,
  { label: string; bg: string; text: string; border: string }
> = {
  room: {
    label: "Single Room",
    bg: "bg-secondary",
    text: "text-primary",
    border: "border-primary/20",
  },
  mess: {
    label: "Mess Seat",
    bg: "bg-background",
    text: "text-foreground",
    border: "border-border",
  },
  flat: {
    label: "Full Flat",
    bg: "bg-primary",
    text: "text-primary-foreground",
    border: "border-primary",
  },
  hostel: {
    label: "Hostel Seat",
    bg: "bg-background",
    text: "text-accent",
    border: "border-accent/30",
  },
};

const GENDER_LABELS: Record<string, string> = {
  any: "Open to Anyone",
  male_only: "Male Students / Bachelors Only",
  female_only: "Female Students / Job Holders Only",
  family_only: "Family Tenants Only",
};

export function PropertyDetailsClient({ property }: PropertyDetailsClientProps) {
  // Moderation state synced with storage and live events
  const [moderationState, setModerationState] = useState(() => {
    const store = getModerationStore();
    const item = store.properties.find((p) => p.id === property.id);
    const activeReport = store.scamReports.find(
      (r) => r.propertyId === property.id && r.status !== "dismissed"
    );
    return {
      item,
      isSuppressed: Boolean(item?.isHiddenFromSearch || activeReport),
      status: item?.status || (property.isVerified ? "verified" : "pending"),
      reportReason: activeReport?.reason,
    };
  });

  useEffect(() => {
    const update = () => {
      const store = getModerationStore();
      const item = store.properties.find((p) => p.id === property.id);
      const activeReport = store.scamReports.find(
        (r) => r.propertyId === property.id && r.status !== "dismissed"
      );
      setModerationState({
        item,
        isSuppressed: Boolean(item?.isHiddenFromSearch || activeReport),
        status: item?.status || (property.isVerified ? "verified" : "pending"),
        reportReason: activeReport?.reason,
      });
    };
    window.addEventListener("smartrent_moderation_updated", update);
    return () => window.removeEventListener("smartrent_moderation_updated", update);
  }, [property.id, property.isVerified]);
  // Modal states
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Favorites state synced with localStorage
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("smartrent_favorites");
        if (stored) {
          const list: string[] = JSON.parse(stored);
          return list.includes(property.id);
        }
      } catch {
        return false;
      }
    }
    return false;
  });

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("smartrent_favorites");
          const list: string[] = stored ? JSON.parse(stored) : [];
          const updated = next
            ? [...list.filter((id) => id !== property.id), property.id]
            : list.filter((id) => id !== property.id);
          localStorage.setItem("smartrent_favorites", JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const typeBadge = TYPE_CONFIG[property.type] || TYPE_CONFIG.room;
  const formattedRent = property.rent.toLocaleString("en-US");
  const securityDepositAmount =
    property.securityDeposit || property.rent;
  const formattedDeposit = securityDepositAmount.toLocaleString("en-US");

  const defaultHouseRules =
    property.type === "mess"
      ? [
          "Meal manager system rotates monthly among mess members",
          "Main building gate locked at 11:00 PM for tenant safety",
          "Study atmosphere observed in evening hours after 9:00 PM",
          "Valid University ID or Job ID required upon check-in",
        ]
      : property.type === "hostel"
      ? [
          "Strict gate cutoff for evening safety (7:30 PM for female hostel, 11:00 PM for male)",
          "Three daily home-cooked meals included in monthly fee",
          "Guardian / family emergency contact details mandatory",
          "Quiet study environment in accommodation halls",
        ]
      : [
          "Standard residential peaceful living expected",
          "1-2 months security deposit required upon tenancy agreement",
          "Electric sub-meter or DESCO/NESCO bill payable on monthly basis",
          "Prior notification required for long-stay overnight guests",
        ];

  const rulesList =
    property.houseRules && property.houseRules.length > 0
      ? property.houseRules
      : defaultHouseRules;

  return (
    <div className="bg-background text-foreground pt-4 sm:pt-8 pb-28 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Breadcrumbs & Top Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pb-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link
              href="/#explore"
              className="hover:text-foreground transition-colors"
            >
              Properties
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-xs sm:max-w-md">
              {property.location.neighborhood}, {property.location.city}
            </span>
          </nav>

          <Link
            href="/#explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to all listings</span>
          </Link>
        </div>

        {/* Safety Investigation Banner (Track C3 Rule 8) */}
        {moderationState.isSuppressed && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xs p-4 flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Under Safety Review (Hidden from Public Search)</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-xs bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  Track C3 Rule 8
                </span>
              </div>
              <p>
                This accommodation listing has been reported by a student tenant
                {moderationState.reportReason ? ` for "${moderationState.reportReason}"` : ""}.
                In compliance with SmartRent BD safety policy, it is temporarily suppressed from public search results while moderators complete an on-site or document review.
              </p>
            </div>
          </div>
        )}

        {/* 2. Title & Primary Badges Header */}
        <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-3 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-xs text-xs font-semibold tracking-wide uppercase border shadow-2xs ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}
            >
              {typeBadge.label}
            </span>

            {moderationState.isSuppressed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hidden (Safety Review)</span>
              </span>
            ) : moderationState.status === "verified" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-semibold bg-secondary text-primary border border-primary/25">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Verified Listing</span>
              </span>
            ) : moderationState.status === "rejected" ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/25">
                <XCircle className="w-3.5 h-3.5" />
                <span>Listing Rejected by Admin</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs text-xs font-medium bg-background text-muted-foreground border border-border">
                <span>Standard Listing (Unverified)</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-xs border border-border">
              <Calendar className="w-3.5 h-3.5" />
              <span>{property.availability}</span>
            </span>

            <span className="text-[11px] font-mono text-muted-foreground ml-auto hidden sm:inline">
              Ref ID: {property.id}
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground font-heading leading-snug">
                {property.title}
              </h1>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>
                  {property.location.address ||
                    `${property.location.neighborhood}, ${property.location.city}`}
                </span>
              </div>
            </div>

            {/* Quick Actions (Share, Favorite, Report) */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Share button */}
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-background hover:bg-secondary/40 border border-border rounded-xs transition-colors cursor-pointer"
                title="Copy property link"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-primary font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-xs transition-colors cursor-pointer ${
                  isFavorite
                    ? "bg-secondary text-destructive border-destructive/30 font-semibold"
                    : "bg-background text-foreground border-border hover:bg-secondary/40"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isFavorite
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                <span>{isFavorite ? "Saved" : "Save"}</span>
              </button>

              {/* Report button */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="p-1.5 rounded-xs border border-border text-muted-foreground hover:text-destructive hover:bg-background transition-colors cursor-pointer"
                title="Report listing"
                aria-label="Report listing"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Main Grid (2 Columns: Left Main Content, Right Sticky Booking Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Photos & In-Depth Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <PropertyGallery
              images={property.images}
              featuredImage={property.featuredImage}
              title={property.title}
            />

            {/* Key Specifications Grid */}
            <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Accommodation Highlights & Specs
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xs bg-background border border-border">
                  <span className="text-[11px] text-muted-foreground block">Monthly Rent</span>
                  <span className="text-base font-bold text-primary">
                    ৳ {formattedRent}
                  </span>
                </div>

                <div className="p-3 rounded-xs bg-background border border-border">
                  <span className="text-[11px] text-muted-foreground block">Security Deposit</span>
                  <span className="text-sm font-semibold text-foreground">
                    ৳ {formattedDeposit}
                  </span>
                </div>

                {property.bedrooms ? (
                  <div className="p-3 rounded-xs bg-background border border-border">
                    <span className="text-[11px] text-muted-foreground block">Bedrooms</span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Bed className="w-4 h-4 text-primary" />
                      <span>{property.bedrooms} Bed</span>
                    </span>
                  </div>
                ) : null}

                {property.bathrooms ? (
                  <div className="p-3 rounded-xs bg-background border border-border">
                    <span className="text-[11px] text-muted-foreground block">Bathrooms</span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Bath className="w-4 h-4 text-primary" />
                      <span>{property.bathrooms} Bath</span>
                    </span>
                  </div>
                ) : null}

                {property.floor ? (
                  <div className="p-3 rounded-xs bg-background border border-border">
                    <span className="text-[11px] text-muted-foreground block">Floor Level</span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Building className="w-4 h-4 text-primary" />
                      <span>{property.floor}</span>
                    </span>
                  </div>
                ) : null}

                {property.sizeSqFt ? (
                  <div className="p-3 rounded-xs bg-background border border-border">
                    <span className="text-[11px] text-muted-foreground block">Unit Size</span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Maximize2 className="w-4 h-4 text-primary" />
                      <span>{property.sizeSqFt} sq ft</span>
                    </span>
                  </div>
                ) : null}

                {property.seatsAvailable ? (
                  <div className="p-3 rounded-xs bg-background border border-border">
                    <span className="text-[11px] text-muted-foreground block">Available Seats</span>
                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{property.seatsAvailable} Seat(s)</span>
                    </span>
                  </div>
                ) : null}

                <div className="p-3 rounded-xs bg-background border border-border">
                  <span className="text-[11px] text-muted-foreground block">Gender Policy</span>
                  <span className="text-xs font-semibold text-foreground block mt-1 line-clamp-2 leading-tight">
                    {GENDER_LABELS[property.genderPreference || "any"]}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-3 shadow-2xs">
              <h3 className="text-base font-bold text-foreground font-heading">
                About this Rental Listing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Included Amenities & Facilities */}
            <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="text-base font-bold text-foreground font-heading">
                  Included Amenities & Facilities
                </h3>
                <span className="text-xs text-muted-foreground">
                  {property.facilities.length} amenities verified
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {property.facilities.map((facId) => {
                  const def = FACILITY_DEFINITIONS.find((f) => f.id === facId);
                  return (
                    <div
                      key={facId}
                      className="flex items-center gap-2 p-2.5 rounded-xs bg-background border border-border text-xs text-foreground font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span>{def ? def.label : facId}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* House Rules & Tenancy Policies */}
            <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground font-heading">
                  Tenancy Guidelines & House Rules
                </h3>
              </div>

              <ul className="space-y-2.5">
                {rulesList.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-muted-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location & Transit Section */}
            <PropertyLocationSection property={property} />

            {/* Safety & Anti-Fraud Advisory for Tenants */}
            <div className="rounded-xs border border-border bg-card p-5 flex items-start gap-3 shadow-2xs">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-destructive">
                  Important Tenancy Safety Warning
                </h4>
                <p className="text-muted-foreground leading-relaxed">
                  Never pay advance booking deposits, token money, or key fees through bKash, Nagad, or bank transfer before inspecting the premises in person and verifying the owner&apos;s NID card. SmartRent BD does not collect payments on behalf of landlords.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking & Owner Card */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* Rent & Request Card */}
            <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-5 shadow-2xs">
              {/* Rent header */}
              <div className="pb-4 border-b border-border">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-primary font-heading">
                    ৳ {formattedRent}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/ month</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground flex flex-col gap-0.5">
                  {property.serviceCharge ? (
                    <span>+ ৳{property.serviceCharge} monthly service charge</span>
                  ) : (
                    <span>Service charge included in rent</span>
                  )}
                  <span>Security Deposit: ৳{formattedDeposit} (Refundable)</span>
                </div>
              </div>

              {/* Primary Action Button: Request a Visit */}
              <button
                type="button"
                onClick={() => setIsVisitModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Request an In-Person Visit</span>
              </button>

              {/* Secondary Favorite Action */}
              <button
                type="button"
                onClick={handleToggleFavorite}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold border rounded-xs transition-colors cursor-pointer ${
                  isFavorite
                    ? "bg-secondary text-destructive border-destructive/30"
                    : "bg-background text-foreground border-border hover:bg-secondary/40"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite
                      ? "fill-destructive text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                <span>
                  {isFavorite ? "Saved to Your Favorites" : "Save to Favorites"}
                </span>
              </button>

              {/* Trust point */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Zero Broker Fees</span>
                </span>
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Direct Landlord Deal</span>
                </span>
              </div>
            </div>

            {/* Landlord / Host Profile Card */}
            <PropertyOwnerCard
              property={property}
              onRequestVisit={() => setIsVisitModalOpen(true)}
            />

            {/* Report Listing Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Notice something incorrect? Report this listing</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3 lg:hidden z-40 shadow-lg">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-primary">
              ৳ {formattedRent}
            </span>
            <span className="text-[10px] text-muted-foreground">/mo</span>
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Deposit: ৳{formattedDeposit}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label="Toggle favorite"
            className="p-2 rounded-xs border border-border bg-background text-foreground hover:text-destructive transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                isFavorite
                  ? "fill-destructive text-destructive"
                  : "text-muted-foreground"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsVisitModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
          >
            Request Visit
          </button>
        </div>
      </div>

      {/* 5. Modals */}
      <RequestVisitModal
        property={property}
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
      />

      <ReportListingModal
        property={property}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
