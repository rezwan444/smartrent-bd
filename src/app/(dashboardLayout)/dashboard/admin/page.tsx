"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  CheckCircle2,
  XCircle,
  EyeOff,
  Eye,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  RotateCcw,
  Search,
  FileCheck2,
  UserCheck2,
  History,
  Phone,
  Mail,
  FileText,
  BadgeAlert,
  Check,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  getModerationStore,
  verifyListing,
  verifyOwnerNid,
  moderateScamReport,
  resetModerationStore,
} from "@/lib/propertyModerationStorage";
import type {
  ModerationStore,
  ModeratedPropertyItem,
  OwnerVerificationSubmission,
  ScamReport,
  ModerationAuditLog,
} from "@/types/moderation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { AppSelect, AppSelectOption } from "@/components/shared/AppSelect";
import Cookies from "js-cookie";

function AdminDashboardContent() {
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Store state synced with localStorage and event listener
  const [store, setStore] = useState<ModerationStore>(() => getModerationStore());
  const router = useRouter();

  // Guard: enforce admin/staff role separation
  useEffect(() => {
    const role = (reduxUser?.role as string)?.toUpperCase() || Cookies.get("userRole")?.toUpperCase();
    if (role && role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "STAFF") {
      router.replace("/dashboard/unauthorized");
    }
  }, [reduxUser, router]);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const validTabs = ["listings", "owners", "scams", "logs"] as const;
  type AdminTab = (typeof validTabs)[number];
  const activeTab: AdminTab = validTabs.includes(tabParam as AdminTab) ? (tabParam as AdminTab) : "listings";
  const [rejectionPreset, setRejectionPreset] = useState("");

  // Filters
  const [listingFilter, setListingFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [listingSearch, setListingSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [scamFilter, setScamFilter] = useState<"all" | "awaiting_review" | "investigating" | "confirmed_fraud" | "dismissed">("all");

  // Modal States
  const [rejectingListing, setRejectingListing] = useState<ModeratedPropertyItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  const [reviewingOwner, setReviewingOwner] = useState<OwnerVerificationSubmission | null>(null);
  const [ownerDecisionNotes, setOwnerDecisionNotes] = useState("");

  const [reviewingScam, setReviewingScam] = useState<ScamReport | null>(null);
  const [scamActionNotes, setScamActionNotes] = useState("");
  const [scamActionType, setScamActionType] = useState<"dismiss" | "confirm_fraud" | "investigate">("dismiss");

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  // Sync state on events
  useEffect(() => {
    const handleUpdate = () => {
      setStore(getModerationStore());
    };
    window.addEventListener("smartrent_moderation_updated", handleUpdate);
    return () => {
      window.removeEventListener("smartrent_moderation_updated", handleUpdate);
    };
  }, []);

  // Fetch real data from MongoDB backend and merge with local store
  useEffect(() => {
    let isSubscribed = true;
    async function syncBackendData() {
      try {
        setIsLoadingApi(true);
        const [verRes, scamRes, logsRes] = await Promise.allSettled([
          fetch("/api/admin/verifications"),
          fetch("/api/admin/scam-reports"),
          fetch("/api/admin/moderation/logs"),
        ]);

        if (!isSubscribed) return;

        let dbProps: ModeratedPropertyItem[] = [];
        let dbOwners: OwnerVerificationSubmission[] = [];
        let dbScams: ScamReport[] = [];
        let dbLogs: ModerationAuditLog[] = [];

        if (verRes.status === "fulfilled" && verRes.value.ok) {
          const verData = await verRes.value.json();
          if (verData.success && verData.data) {
            dbProps = verData.data.properties || [];
            dbOwners = verData.data.owners || [];
          }
        }

        if (scamRes.status === "fulfilled" && scamRes.value.ok) {
          const scamData = await scamRes.value.json();
          if (scamData.success && scamData.data) {
            dbScams = scamData.data.reports || [];
          }
        }

        if (logsRes.status === "fulfilled" && logsRes.value.ok) {
          const logsData = await logsRes.value.json();
          if (logsData.success && logsData.data) {
            dbLogs = logsData.data.logs || [];
          }
        }

        if (dbProps.length > 0 || dbOwners.length > 0 || dbScams.length > 0 || dbLogs.length > 0) {
          setStore((prevStore) => {
            const propMap = new Map(prevStore.properties.map((p) => [p.id, p]));
            dbProps.forEach((p) => propMap.set(p.id, p));

            const ownerMap = new Map(prevStore.ownerVerifications.map((o) => [o.id, o]));
            dbOwners.forEach((o) => ownerMap.set(o.id, o));

            const scamMap = new Map(prevStore.scamReports.map((s) => [s.id, s]));
            dbScams.forEach((s) => scamMap.set(s.id, s));

            const logMap = new Map(prevStore.auditLogs.map((l) => [l.id, l]));
            dbLogs.forEach((l) => logMap.set(l.id, l));

            return {
              properties: Array.from(propMap.values()),
              ownerVerifications: Array.from(ownerMap.values()),
              scamReports: Array.from(scamMap.values()),
              auditLogs: Array.from(logMap.values()),
            };
          });
        }
      } catch (err) {
        console.error("[Admin Sync Error]:", err);
      } finally {
        if (isSubscribed) setIsLoadingApi(false);
      }
    }

    syncBackendData();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleSwitchTab = (tab: AdminTab) => {
    router.replace(`/dashboard/admin?tab=${tab}`, { scroll: false });
  };

  // Filtered Listings
  const filteredListings = store.properties.filter((item) => {
    if (listingFilter !== "all" && item.status !== listingFilter) return false;
    if (listingSearch.trim()) {
      const q = listingSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Owners
  const filteredOwners = store.ownerVerifications.filter((item) => {
    if (ownerFilter !== "all" && item.status !== ownerFilter) return false;
    return true;
  });

  // Filtered Scams
  const filteredScams = store.scamReports.filter((item) => {
    if (scamFilter !== "all" && item.status !== scamFilter) return false;
    return true;
  });

  // Metric counts
  const pendingListingCount = store.properties.filter((p) => p.status === "pending").length;
  const pendingOwnerCount = store.ownerVerifications.filter((v) => v.status === "pending").length;
  const activeScamCount = store.scamReports.filter(
    (r) => r.status === "awaiting_review" || r.status === "investigating"
  ).length;
  const suppressedCount = store.properties.filter((p) => p.isHiddenFromSearch).length;

  // Handlers connected to backend APIs
  const handleApproveListing = async (id: string, title: string) => {
    setIsActionPending(true);
    try {
      const res = await fetch(`/api/admin/verifications/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "approve",
          notes: "Listing passed safety, photo, and rate inspection. Verified trust badge awarded.",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to approve listing on server.");
        setIsActionPending(false);
        return;
      }
    } catch {
      // Offline/demo fallback
    }

    verifyListing(id, "approve", "Listing passed safety, photo, and rate inspection. Verified trust badge awarded.");
    toast.success(`Listing "${title}" approved and verified! Now publicly visible.`);
    setIsActionPending(false);
  };

  const handleConfirmRejectListing = async () => {
    if (!rejectingListing) return;
    setIsActionPending(true);
    const notes = rejectionNotes.trim() || "Listing does not meet quality or safety guidelines. Please update room photos and details.";

    try {
      const res = await fetch(`/api/admin/verifications/properties/${rejectingListing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "reject", notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to reject listing on server.");
        setIsActionPending(false);
        return;
      }
    } catch {
      // Offline/demo fallback
    }

    verifyListing(rejectingListing.id, "reject", notes);
    toast.error(`Listing "${rejectingListing.title}" rejected. Feedback sent to landlord.`);
    setRejectingListing(null);
    setRejectionPreset("");
    setRejectionNotes("");
    setIsActionPending(false);
  };

  const handleOwnerDecision = async (decision: "approve" | "reject") => {
    if (!reviewingOwner) return;
    setIsActionPending(true);
    const notes = ownerDecisionNotes.trim() || (decision === "approve" ? "Govt NID verified against Election Commission database." : "Documents failed authentication check.");

    try {
      const res = await fetch(`/api/admin/verifications/owners/${reviewingOwner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update owner verification on server.");
        setIsActionPending(false);
        return;
      }
    } catch {
      // Offline/demo fallback
    }

    verifyOwnerNid(reviewingOwner.id, decision, notes);
    if (decision === "approve") {
      toast.success(`Owner ${reviewingOwner.ownerName}'s NID verified successfully! All their listings now show verified landlord badge.`);
    } else {
      toast.error(`Owner ${reviewingOwner.ownerName}'s NID rejected.`);
    }
    setReviewingOwner(null);
    setOwnerDecisionNotes("");
    setIsActionPending(false);
  };

  const handleConfirmScamAction = async () => {
    if (!reviewingScam) return;
    setIsActionPending(true);
    const notes = scamActionNotes.trim() || (scamActionType === "dismiss" ? "Report reviewed and found compliant. Listing restored." : "Fraud confirmed by moderation team. Listing removed permanently.");

    try {
      const res = await fetch(`/api/admin/scam-reports/${reviewingScam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: scamActionType, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to process scam report on server.");
        setIsActionPending(false);
        return;
      }
    } catch {
      // Offline/demo fallback
    }

    moderateScamReport(reviewingScam.id, scamActionType, notes);
    if (scamActionType === "dismiss") {
      toast.success(`Report dismissed. Listing "${reviewingScam.propertyTitle}" restored to public search.`);
    } else if (scamActionType === "confirm_fraud") {
      toast.error(`Confirmed fraud: Listing "${reviewingScam.propertyTitle}" permanently de-listed.`);
    } else {
      toast.info(`Marked for on-site inspection.`);
    }
    setReviewingScam(null);
    setScamActionNotes("");
    setIsActionPending(false);
  };

  /* old */ /*
  const handleApproveListing = (id: string, title: string) => {
    verifyListing(id, "approve", "Listing passed safety, photo, and rate inspection. Verified trust badge awarded.");
    toast.success(`Listing "${title}" approved and verified! Now publicly visible.`);
  };

  const handleConfirmRejectListing = () => {
    if (!rejectingListing) return;
    const notes = rejectionNotes.trim() || "Listing does not meet quality or safety guidelines. Please update room photos and details.";
    verifyListing(rejectingListing.id, "reject", notes);
    toast.error(`Listing "${rejectingListing.title}" rejected. Feedback sent to landlord.`);
    setRejectingListing(null);
    setRejectionPreset("");
    setRejectionNotes("");
  };

  const handleOwnerDecision = (decision: "approve" | "reject") => {
    if (!reviewingOwner) return;
    const notes = ownerDecisionNotes.trim() || (decision === "approve" ? "Govt NID verified against Election Commission database." : "Documents failed authentication check.");
    verifyOwnerNid(reviewingOwner.id, decision, notes);
    if (decision === "approve") {
      toast.success(`Owner ${reviewingOwner.ownerName}'s NID verified successfully! All their listings now show verified landlord badge.`);
    } else {
      toast.error(`Owner ${reviewingOwner.ownerName}'s NID rejected.`);
    }
    setReviewingOwner(null);
    setOwnerDecisionNotes("");
  };

  const handleConfirmScamAction = () => {
    if (!reviewingScam) return;
    const notes = scamActionNotes.trim() || (scamActionType === "dismiss" ? "Report reviewed and found compliant. Listing restored." : "Fraud confirmed by moderation team. Listing removed permanently.");
    moderateScamReport(reviewingScam.id, scamActionType, notes);
    if (scamActionType === "dismiss") {
      toast.success(`Report dismissed. Listing "${reviewingScam.propertyTitle}" restored to public search.`);
    } else if (scamActionType === "confirm_fraud") {
      toast.error(`Confirmed fraud: Listing "${reviewingScam.propertyTitle}" permanently de-listed.`);
    } else {
      toast.info(`Marked for on-site inspection.`);
    }
    setReviewingScam(null);
    setScamActionNotes("");
  };

  */
  const handleResetData = () => {
    resetModerationStore();
    setStore(getModerationStore());
    toast.success("Moderation demo store has been reset to original state.");
  };

  const rejectionPresetOptions: AppSelectOption[] = [
    {
      value: "Inaccurate photos / watermarked foreign images",
      label: "Inaccurate photos / watermarked foreign images",
      secondaryLabel: "Requires authentic local property pictures",
    },
    {
      value: "Rent amount significantly exceeds student market rate",
      label: "Rent amount exceeds student market rate",
      secondaryLabel: "Exceeds standard student housing rate for this area",
    },
    {
      value: "Landlord unverified / unresponsive to inspection call",
      label: "Landlord unverified / unresponsive",
      secondaryLabel: "Could not reach host to verify accommodation status",
    },
    {
      value: "Inadequate safety measures (missing grills/locks)",
      label: "Inadequate safety measures (missing grills/locks)",
      secondaryLabel: "Missing window grills, balcony barrier, or locks",
    },
    {
      value: "Address mismatch or inaccurate landmark distance",
      label: "Address mismatch or inaccurate landmark distance",
      secondaryLabel: "Stated distance does not match verified GPS coordinates",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Moderation Console</span>
            </span>
            <span className="text-xs text-muted-foreground">• Track C3: Features 3 & 8 ({reduxUser?.firstName ? `${reduxUser.firstName} Session` : "Demo Staff Session"})</span>
            {isLoadingApi && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span>Syncing live records...</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Administrator Verification & Safety Portal
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review landlord identity documents, inspect accommodation listings before issuing the Verified badge, and suppress reported scam listings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary border border-border rounded-xs transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reset Demo Store</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 border border-primary/20 rounded-xs transition-colors shrink-0 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            <span>Public Search</span>
          </Link>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => handleSwitchTab("listings")}
          className={`border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === "listings" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Pending Listings
            </span>
            <div className="w-8 h-8 rounded-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-foreground">
              {pendingListingCount} Awaiting
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Feature 3: Inspection Queue
            </p>
          </div>
        </div>

        <div
          onClick={() => handleSwitchTab("owners")}
          className={`border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === "owners" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "bg-card border-border hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Owner NID Verification
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <UserCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-primary">
              {pendingOwnerCount} Pending
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Govt NID & Holding Tax Checks
            </p>
          </div>
        </div>

        <div
          onClick={() => handleSwitchTab("scams")}
          className={`border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between cursor-pointer transition-all ${
            activeTab === "scams" ? "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/30" : "bg-card border-border hover:border-rose-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Scam & Fraud Reports
            </span>
            <div className="w-8 h-8 rounded-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-rose-600 dark:text-rose-400">
              {activeScamCount} Active
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Feature 8: Auto-Suppressed
            </p>
          </div>
        </div>

        <div
          onClick={() => handleSwitchTab("scams")}
          className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between cursor-pointer hover:border-primary/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Suppressed from Search
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-foreground flex items-center justify-center shrink-0">
              <EyeOff className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-foreground">
              {suppressedCount} Listings
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Hidden Pending Moderator Review
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => handleSwitchTab("listings")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "listings"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Listing Verification Queue</span>
          {pendingListingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
              {pendingListingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab("owners")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "owners"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck2 className="w-4 h-4" />
          <span>Owner Identity (NID) Verifications</span>
          {pendingOwnerCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
              {pendingOwnerCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab("scams")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "scams"
              ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Scam Reports & Search Suppression (Feature 8)</span>
          {activeScamCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
              {activeScamCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSwitchTab("logs")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === "logs"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Moderation Audit Trail</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
            {store.auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LISTING VERIFICATION QUEUE */}
      {activeTab === "listings" && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border rounded-xs p-3.5 shadow-2xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-medium">Filter Status:</span>
              {(["all", "pending", "verified", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setListingFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-xs font-semibold transition-colors capitalize cursor-pointer ${
                    listingFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {status === "all" ? `All (${store.properties.length})` : status}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search listing title, area..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-primary outline-hidden"
              />
            </div>
          </div>

          {/* Listings List */}
          <div className="space-y-3">
            {filteredListings.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xs p-6 space-y-2">
                <Building2 className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">No listings found</h3>
                <p className="text-xs text-muted-foreground">No property matches the current filter criteria.</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`border rounded-xs p-4 bg-card transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                    listing.status === "pending"
                      ? "border-amber-500/40 bg-amber-500/5"
                      : listing.status === "rejected"
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border"
                  }`}
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-secondary text-primary rounded-xs border border-primary/20 uppercase">
                        {listing.type}
                      </span>

                      {/* Listing Verification Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs flex items-center gap-1 ${
                          listing.status === "verified"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : listing.status === "pending"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : listing.status === "rejected"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {listing.status === "verified" && <CheckCircle2 className="w-3 h-3" />}
                        {listing.status === "pending" && <Clock className="w-3 h-3" />}
                        {listing.status === "rejected" && <XCircle className="w-3 h-3" />}
                        <span className="capitalize">{listing.status === "verified" ? "Verified & Published" : `Status: ${listing.status}`}</span>
                      </span>

                      {/* Owner NID Status */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs ${
                          listing.nidStatus === "Verified"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        Host NID: {listing.nidStatus}
                      </span>

                      {listing.isHiddenFromSearch && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden From Public Search</span>
                        </span>
                      )}

                      <span className="text-xs font-bold text-primary font-mono ml-auto sm:ml-0">
                        {listing.rent}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground">{listing.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{listing.location}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Host: <strong className="text-foreground">{listing.ownerName}</strong> ({listing.ownerPhone})
                      </span>
                      <span>•</span>
                      <span>Submitted: {new Date(listing.submittedAt).toLocaleDateString()}</span>
                    </div>

                    {listing.adminNotes && (
                      <div className="p-2.5 rounded-xs bg-background border border-border text-xs text-foreground space-y-0.5">
                        <span className="font-semibold text-muted-foreground text-[11px]">Moderator Review Notes:</span>
                        <p className="text-xs">{listing.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                    {listing.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproveListing(listing.id, listing.title)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectingListing(listing);
                            setRejectionPreset("");
                            setRejectionNotes("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card hover:bg-secondary text-foreground border border-border rounded-xs transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-destructive" />
                          <span>Reject...</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        {listing.status === "verified" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingListing(listing);
                              setRejectionPreset("");
                              setRejectionNotes("Revoking verified status for administrative re-inspection.");
                            }}
                            className="text-xs text-muted-foreground hover:text-destructive underline cursor-pointer"
                          >
                            Revoke / Re-evaluate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleApproveListing(listing.id, listing.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-secondary hover:bg-secondary/80 rounded-xs border border-primary/20 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Re-approve & Verify</span>
                          </button>
                        )}
                        <Link
                          href={`/properties/${listing.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Inspect View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OWNER NID IDENTITY VERIFICATIONS */}
      {activeTab === "owners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card border border-border rounded-xs p-3.5 shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-foreground">Track C3 Requirement 3: Landlord Identity Verification</h3>
              <p className="text-[11px] text-muted-foreground">
                Verify National ID (NID) and Holding Tax receipts to prevent fake landlords and advance-fee scams.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setOwnerFilter(st)}
                  className={`px-2.5 py-1 text-xs rounded-xs font-semibold transition-colors capitalize cursor-pointer ${
                    ownerFilter === st ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {st === "all" ? `All (${store.ownerVerifications.length})` : st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredOwners.map((sub) => (
              <div
                key={sub.id}
                className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{sub.ownerName}</h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs ${
                          sub.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : sub.status === "pending"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                        }`}
                      >
                        {sub.status === "approved" ? "NID Verified" : `Verification: ${sub.status}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-primary" />
                        <span>{sub.ownerPhone}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-primary" />
                        <span>{sub.ownerEmail}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span>{sub.propertyLocation}</span>
                      </span>
                      {sub.dob && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-[11px] bg-secondary/80 px-1.5 py-0.5 rounded-xs">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span>DOB: {sub.dob}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {sub.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingOwner(sub);
                          setOwnerDecisionNotes("");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        <UserCheck2 className="w-3.5 h-3.5" />
                        <span>Review & Verify NID</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingOwner(sub);
                          setOwnerDecisionNotes(sub.adminNotes || "");
                        }}
                        className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                      >
                        View Verification Record
                      </button>
                    )}
                  </div>
                </div>

                {/* Submitted Documents Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/40 text-xs">
                  <div className="p-2.5 rounded-xs bg-background border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>Govt National ID (NID):</span>
                    </span>
                    <p className="font-mono font-bold text-foreground">{sub.nidNumber}</p>
                    <p className="text-[10px] text-muted-foreground">Verified against Election Commission Registry (Simulated)</p>
                  </div>

                  <div className="p-2.5 rounded-xs bg-background border border-border space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>Municipality Holding Tax No:</span>
                    </span>
                    <p className="font-mono font-bold text-foreground">{sub.holdingTaxNumber}</p>
                    <p className="text-[10px] text-muted-foreground">Local Corporation City Holding Document</p>
                  </div>
                </div>

                {sub.adminNotes && (
                  <p className="text-xs text-muted-foreground bg-secondary/40 p-2 rounded-xs border border-border">
                    <strong className="text-foreground">Moderation Notes:</strong> {sub.adminNotes}
                  </p>

                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCAM REPORTS & SEARCH SUPPRESSION */}
      {activeTab === "scams" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xs p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <BadgeAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">
                  Track C3 Requirement 8: Scam Reporting & Automatic Search Suppression
                </h3>
              </div>
              <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
                Rule: Reported listings are automatically hidden from public search immediately upon receiving a qualifying report until reviewed by staff.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs shrink-0">
              <span className="px-2.5 py-1 rounded-xs font-semibold bg-rose-600 text-white shadow-2xs">
                {activeScamCount} Awaiting Moderation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap bg-card border border-border rounded-xs p-3 shadow-2xs">
            <span className="text-xs text-muted-foreground font-medium">Filter Reports:</span>
            {(["all", "awaiting_review", "investigating", "confirmed_fraud", "dismissed"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setScamFilter(st)}
                className={`px-2.5 py-1 text-xs rounded-xs font-semibold transition-colors capitalize cursor-pointer ${
                  scamFilter === st ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {st === "all" ? `All (${store.scamReports.length})` : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="space-y-3.5">
            {filteredScams.map((report) => (
              <div
                key={report.id}
                className="border border-border rounded-xs p-4 bg-card space-y-3 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        report.status !== "dismissed"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {report.status !== "dismissed" ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hidden From Public Search</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Restored to Search</span>
                        </>
                      )}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{report.propertyTitle}</h3>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>Reported {new Date(report.reportedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xs bg-background border border-border text-xs space-y-1">
                  <div className="flex items-start gap-2 text-foreground">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Reason Reported:</span> {report.reason}
                    </div>
                  </div>
                  {report.details && (
                    <p className="text-muted-foreground text-xs pl-5.5">{report.details}</p>
                  )}
                  <div className="text-[11px] text-muted-foreground pl-5.5 pt-1 border-t border-border/40 mt-1">
                    Reported by: <strong className="text-foreground">{report.reportedBy}</strong> ({report.contactInfo || "No phone given"}) • Location: {report.propertyLocation}
                  </div>
                </div>

                {report.adminNotes && (
                  <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded-xs border border-border">
                    <strong className="text-foreground">Moderator Resolution Notes:</strong> {report.adminNotes}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs">
                  <div className="text-[11px] text-muted-foreground">
                    Report ID: <code className="font-mono bg-muted px-1.5 py-0.5 rounded-xs">{report.id}</code> • Listing Ref: <code className="font-mono bg-muted px-1.5 py-0.5 rounded-xs">{report.propertyId}</code>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReviewingScam(report);
                        setScamActionType("dismiss");
                        setScamActionNotes("Listing inspected and verified. Landlord provided valid clarification. Restoring to public search.");
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-card hover:bg-secondary text-foreground border border-border rounded-xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-primary" />
                      <span>Dismiss & Restore</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewingScam(report);
                        setScamActionType("confirm_fraud");
                        setScamActionNotes("Confirmed fraudulent listing. Advance bKash token demand verified. Property permanently removed.");
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>Confirm Fraud & De-list</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MODERATION AUDIT TRAIL */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-foreground">Immutable Moderation Audit Trail</h3>
              <p className="text-[11px] text-muted-foreground">
                Chronological record of listing inspections, owner NID approvals, and scam suppression actions.
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Total Logged Decisions: {store.auditLogs.length}
            </span>
          </div>

          <div className="bg-card border border-border rounded-xs overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3">Action Taken</th>
                    <th className="py-2.5 px-3">Admin / Policy</th>
                    <th className="py-2.5 px-3">Notes & Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {store.auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground max-w-xs truncate">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-xs bg-muted text-muted-foreground mr-1.5">
                          {log.targetType}
                        </span>
                        <span>{log.targetTitle}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-foreground">{log.action}</span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground text-[11px] whitespace-nowrap">
                        {log.adminUser}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground text-xs max-w-sm">
                        {log.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DIALOG: REJECT LISTING WITH NOTES */}
      <Dialog open={Boolean(rejectingListing)} onOpenChange={(open) => { if (!open) { setRejectingListing(null); setRejectionPreset(""); setRejectionNotes(""); } }}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border border-border text-foreground rounded-xs shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 border-b border-border space-y-1.5 shrink-0 pr-14 text-left">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xs bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                <XCircle className="w-4 h-4" />
              </span>
              <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                Reject Accommodation Listing
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Review and provide actionable feedback for <strong className="text-foreground">{rejectingListing?.title}</strong>. This feedback is sent directly to the landlord so they can revise and resubmit.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Property Summary Pill */}
            {rejectingListing && (
              <div className="p-3.5 rounded-xs bg-secondary/40 border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-xs bg-secondary text-primary border border-primary/20">
                    {rejectingListing.type}
                  </span>
                  <span className="font-bold font-mono text-primary">{rejectingListing.rent}</span>
                </div>
                <h4 className="font-bold text-foreground leading-snug">{rejectingListing.title}</h4>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px] pt-1 border-t border-border/40">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <span>{rejectingListing.location}</span>
                  </span>
                  <span>•</span>
                  <span>Host: <strong className="text-foreground">{rejectingListing.ownerName}</strong> ({rejectingListing.ownerPhone})</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Standard Rejection Reason</span>
                <span className="text-[11px] text-muted-foreground font-normal">Preset shortcuts</span>
              </label>
              <AppSelect
                value={rejectionPreset}
                onValueChange={(val) => {
                  setRejectionPreset(val);
                  setRejectionNotes(val);
                }}
                options={rejectionPresetOptions}
                placeholder="Choose a common rejection reason..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Moderator Feedback & Revision Instructions <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={4}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Explain the specific safety, hygiene, or photographic issues required for re-inspection..."
                className="w-full p-3 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-primary outline-hidden placeholder:text-muted-foreground leading-relaxed resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                This notice will appear directly on the landlord&apos;s owner dashboard under their listing card.
              </p>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 border-t border-border bg-card shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => { setRejectingListing(null); setRejectionPreset(""); setRejectionNotes(""); }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isActionPending}
              onClick={handleConfirmRejectListing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Confirm Listing Rejection</span>
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: OWNER NID REVIEW */}
      <Dialog open={Boolean(reviewingOwner)} onOpenChange={(open) => !open && setReviewingOwner(null)}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border border-border text-foreground rounded-xs shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 border-b border-border space-y-1.5 shrink-0 pr-14 text-left">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xs bg-secondary text-primary border border-primary/20 shrink-0">
                <UserCheck2 className="w-4 h-4" />
              </span>
              <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                Review Landlord Identity Documents
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Verify submitted Govt National ID and Municipal Holding Tax records for landlord <strong className="text-foreground">{reviewingOwner?.ownerName}</strong> (Track C3 Requirement 3).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Landlord Contact & Overview Card */}
            {reviewingOwner && (
              <div className="bg-secondary/40 border border-border rounded-xs p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xs bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                      {reviewingOwner.ownerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground leading-tight">
                        {reviewingOwner.ownerName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Property Host & Landlord</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs ${
                      reviewingOwner.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : reviewingOwner.status === "pending"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                  >
                    Status: {reviewingOwner.status === "approved" ? "Verified" : reviewingOwner.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{reviewingOwner.ownerPhone}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{reviewingOwner.ownerEmail}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Document Verification Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Document 1: Govt National ID */}
              <div className="border border-border rounded-xs p-3.5 bg-background space-y-2.5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Govt NID Match</span>
                    </span>
                    <FileCheck2 className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground pt-1">
                    National ID (NID):
                  </p>
                  <p className="font-mono font-bold text-foreground text-xs sm:text-sm tracking-wide">
                    {reviewingOwner?.nidNumber}
                  </p>
                  <div className="pt-1.5 border-t border-border/40">
                    <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-primary" />
                      <span>Date of Birth (DOB):</span>
                    </p>
                    <p className="font-mono font-bold text-foreground text-xs sm:text-sm tracking-wide">
                      {reviewingOwner?.dob || "1985-08-15"}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
                  Verified against Bangladesh Election Commission database (Simulated).
                </p>
              </div>

              {/* Document 2: Holding Tax Receipt */}
              <div className="border border-border rounded-xs p-3.5 bg-background space-y-2.5 flex flex-col justify-between shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-xs bg-secondary text-primary border border-primary/20 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      <span>City Holding</span>
                    </span>
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground pt-1">
                    Holding Tax Assessment Ref:
                  </p>
                  <p className="font-mono font-bold text-foreground text-xs sm:text-sm tracking-wide">
                    {reviewingOwner?.holdingTaxNumber}
                  </p>

                </div>
                <div className="border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                  <span className="truncate">{reviewingOwner?.propertyLocation}</span>
                </div>
              </div>
            </div>

            {/* Admin Verification Notes Form */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Administrative Verification Notes</span>
                <span className="text-[11px] text-muted-foreground font-normal">Audit Trail Remark</span>
              </label>
              <textarea
                rows={3}
                value={ownerDecisionNotes}
                onChange={(e) => setOwnerDecisionNotes(e.target.value)}
                placeholder="E.g., Govt NID verified against Election Commission database. Holding tax receipt matched."
                className="w-full p-3 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-primary outline-hidden placeholder:text-muted-foreground leading-relaxed resize-none"
              />
            </div>

            {/* Platform Impact Note */}
            <div className="bg-primary/5 border border-primary/20 rounded-xs p-3 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong className="text-foreground font-semibold">Verification Impact:</strong> Approving these identity credentials will automatically award the green <strong className="text-primary font-semibold">&quot;Host NID: Verified&quot;</strong> badge across all current and future listings published by {reviewingOwner?.ownerName}.
              </p>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 border-t border-border bg-card shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              disabled={isActionPending}
              onClick={() => handleOwnerDecision("reject")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xs transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject NID Documents</span>
            </button>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setReviewingOwner(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionPending}
                onClick={() => handleOwnerDecision("approve")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Mark Verified</span>
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: SCAM MODERATION ACTION */}
      <Dialog open={Boolean(reviewingScam)} onOpenChange={(open) => !open && setReviewingScam(null)}>
        <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-card border border-border text-foreground rounded-xs shadow-2xl">
          <DialogHeader className="p-5 sm:p-6 border-b border-border space-y-1.5 shrink-0 pr-14 text-left">
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-xs shrink-0 ${
                  scamActionType === "dismiss"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {scamActionType === "dismiss" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
              </span>
              <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                {scamActionType === "dismiss"
                  ? "Dismiss Report & Restore Listing"
                  : "Confirm Fraud & Permanently De-list"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {scamActionType === "dismiss"
                ? "Conclude the investigation as compliant. This immediately unhides the property and restores it back to student search results."
                : "Confirm the fraud investigation. This permanently suppresses the property from the platform and logs the safety violation."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Incident Summary Card */}
            {reviewingScam && (
              <div className="p-4 bg-secondary/40 border border-border rounded-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground text-sm">{reviewingScam.propertyTitle}</span>
                  <span className="font-mono text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded-xs border border-border">
                    {reviewingScam.id}
                  </span>
                </div>

                <div className="p-3 rounded-xs bg-background border border-border space-y-1">
                  <p className="text-foreground font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Reported Reason: {reviewingScam.reason}</span>
                  </p>

                  {reviewingScam.details && (
                    <p className="text-muted-foreground text-xs pl-5">{reviewingScam.details}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px] pt-1 border-t border-border/40">
                  <span>Reported by: <strong className="text-foreground">{reviewingScam.reportedBy}</strong></span>
                  <span>•</span>
                  <span>Location: {reviewingScam.propertyLocation}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Moderation Resolution Remark <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={4}
                value={scamActionNotes}
                onChange={(e) => setScamActionNotes(e.target.value)}
                placeholder="Document your findings, inspection evidence, or reasons for this moderation decision..."
                className="w-full p-3 text-xs bg-background border border-border rounded-xs focus:ring-1 focus:ring-primary outline-hidden placeholder:text-muted-foreground leading-relaxed resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                This resolution note is permanently logged into the immutable Moderation Audit Trail.
              </p>
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-5 border-t border-border bg-card shrink-0 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setReviewingScam(null)}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isActionPending}
              onClick={handleConfirmScamAction}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xs transition-colors shadow-2xs cursor-pointer ${
                scamActionType === "dismiss"
                  ? "bg-primary hover:bg-primary-dark text-primary-foreground"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              }`}
            >
              {scamActionType === "dismiss" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Restore Listing to Search</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Confirm Fraud & De-list</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* RESET CONFIRMATION */}
      <AppConfirmDialog
        isOpen={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset Moderation Demo Store?"
        description="This will restore all pre-seeded listings, owner NID submissions, scam reports, and audit logs to their initial demonstration values."
        confirmText="Reset Store"
        cancelText="Keep Current"
        variant="warning"
        onConfirm={handleResetData}
      />
    </div>
  );
}


export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-xs font-mono">Loading Admin Portal...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
