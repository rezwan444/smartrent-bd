"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import {
  Building2,
  CalendarCheck,
  PlusCircle,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  EyeOff,
  Wrench,
  Clock,
  Check,
  AlertTriangle,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getOwnerProperties } from "@/lib/propertyModerationStorage";
import { CreateEditListingModal } from "@/components/properties/CreateEditListingModal";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import type { ModeratedPropertyItem } from "@/types/moderation";

export default function OwnerDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Property Owner";

  const ownerQuery = displayName && displayName !== "Property Owner" ? displayName : "";

  // Reactive owner properties from live database with fallback to demo store
  const [myProperties, setMyProperties] = useState<ModeratedPropertyItem[]>([]);
  const [isLoadingProps, setIsLoadingProps] = useState(true);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingListing, setEditingListing] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deletingListing, setDeletingListing] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load properties from backend API upon user actions (refresh, save, delete)
  const fetchOwnerProperties = useCallback(async () => {
    setIsLoadingProps(true);
    try {
      const res = await fetch("/api/owner/properties");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: ModeratedPropertyItem[] = json.data.map((item: any) => ({
            id: item.id || item._id,
            title: item.title,
            type: item.type,
            location:
              typeof item.location === "string"
                ? item.location
                : `${item.location?.neighborhood || ""}, ${item.location?.city || ""}`,
            rent: typeof item.rent === "number" ? `৳ ${item.rent.toLocaleString()} / mo` : String(item.rent),
            ownerName: item.owner?.name || displayName,
            ownerPhone: item.owner?.phone || "+880 1700-000000",
            nidStatus: item.owner?.isVerified ? "Verified" : "Submitted (Pending)",
            status: item.status || (item.isVerified ? "verified" : "pending"),
            isHiddenFromSearch: Boolean(item.isHiddenFromSearch),
            submittedAt: item.createdAt || new Date().toISOString(),
            adminNotes: item.adminNotes || item.moderationNotes,
            rawProperty: item,
          }));
          setMyProperties(mapped);
          setIsLoadingProps(false);
          return;
        }
      }
    } catch {
      // Fall through to local fallback
    }
    setMyProperties(getOwnerProperties(ownerQuery));
    setIsLoadingProps(false);
  }, [displayName, ownerQuery]);

  // Initial load without synchronous setState in effect body
  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        const res = await fetch("/api/owner/properties");
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && Array.isArray(json.data)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped: ModeratedPropertyItem[] = json.data.map((item: any) => ({
              id: item.id || item._id,
              title: item.title,
              type: item.type,
              location:
                typeof item.location === "string"
                  ? item.location
                  : `${item.location?.neighborhood || ""}, ${item.location?.city || ""}`,
              rent: typeof item.rent === "number" ? `৳ ${item.rent.toLocaleString()} / mo` : String(item.rent),
              ownerName: item.owner?.name || displayName,
              ownerPhone: item.owner?.phone || "+880 1700-000000",
              nidStatus: item.owner?.isVerified ? "Verified" : "Submitted (Pending)",
              status: item.status || (item.isVerified ? "verified" : "pending"),
              isHiddenFromSearch: Boolean(item.isHiddenFromSearch),
              submittedAt: item.createdAt || new Date().toISOString(),
              adminNotes: item.adminNotes || item.moderationNotes,
              rawProperty: item,
            }));
            setMyProperties(mapped);
            setIsLoadingProps(false);
            return;
          }
        }
      } catch {
        // Fallback
      }
      if (!ignore) {
        setMyProperties(getOwnerProperties(ownerQuery));
        setIsLoadingProps(false);
      }
    }

    initialLoad();

    const handleUpdate = () => {
      fetchOwnerProperties();
    };
    window.addEventListener("smartrent_moderation_updated", handleUpdate);
    return () => {
      ignore = true;
      window.removeEventListener("smartrent_moderation_updated", handleUpdate);
    };
  }, [displayName, fetchOwnerProperties, ownerQuery]);

  // Handle successful creation or editing
  const handleSaveSuccess = () => {
    fetchOwnerProperties();
  };

  // Handle listing deletion or safe deactivation
  const handleConfirmDelete = async () => {
    if (!deletingListing) return;
    const targetId = deletingListing.id || deletingListing._id;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/properties/${targetId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to remove listing.");
      }

      toast.success(data.message || "Listing removed successfully.");
      setDeletingListing(null);
      fetchOwnerProperties();
    } catch (err) {
      console.error("Delete listing error:", err);
      toast.error(err instanceof Error ? err.message : "Error deleting listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [visitRequests, setVisitRequests] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [maintenanceTickets, setMaintenanceTickets] = useState<any[]>([]);

  useEffect(() => {
    let ignore = false;
    async function loadVisitsAndMaint() {
      try {
        const vRes = await fetch("/api/owner/visits");
        if (vRes.ok) {
          const vJson = await vRes.json();
          if (!ignore && vJson.success && Array.isArray(vJson.data)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setVisitRequests(vJson.data.map((r: any) => ({
              id: r.id || r._id,
              studentName: r.studentName,
              institution: r.institution || "Student",
              propertyTitle: r.propertyTitle,
              propertyId: r.propertyId,
              date: r.preferredDate,
              time: r.timeSlot,
              status: r.status,
            })));
          }
        }
      } catch {
        // Fallback
      }

      try {
        const mRes = await fetch("/api/owner/maintenance");
        if (mRes.ok) {
          const mJson = await mRes.json();
          if (!ignore && mJson.success && Array.isArray(mJson.data)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setMaintenanceTickets(mJson.data.map((t: any) => ({
              id: t.id || t._id,
              propertyTitle: t.propertyTitle,
              tenantName: t.tenantName,
              issue: t.issue,
              urgency: t.urgency,
              status: t.status,
              date: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
            })));
          }
        }
      } catch {
        // Fallback
      }
    }

    loadVisitsAndMaint();
    return () => {
      ignore = true;
    };
  }, []);

  const handleAction = async (id: string, action: "approve" | "decline") => {
    const targetStatus = action === "approve" ? "approved" : "declined";
    try {
      await fetch(`/api/owner/visits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
    } catch {
      // Local sync
    }

    setVisitRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: targetStatus } : req
      )
    );
    toast.success(
      action === "approve"
        ? "Visit request confirmed! Student will receive arrival details."
        : "Visit request declined."
    );
  };

  const handleMaintAction = async (id: string, newStatus: "in_progress" | "resolved") => {
    try {
      await fetch(`/api/owner/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Local sync
    }

    setMaintenanceTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    toast.success(
      newStatus === "in_progress"
        ? "Technician assigned! Tenant notified."
        : "Maintenance ticket marked as resolved."
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Property Owner Portal</span>
            </span>
            <Link
              href="/dashboard/owner/verification"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Host NID: Verified &bull; Details &rarr;</span>
            </Link>
            <span className="text-xs text-muted-foreground">
              • {user?.email ? `${user.email} Session` : "Demo Landlord Session"}
            </span>
            {isLoadingProps && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span>Syncing live listings...</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your listed student accommodations, review visit requests, and track verification inspection status.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchOwnerProperties()}
            disabled={isLoadingProps}
            title="Refresh listings"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xs border border-border transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingProps ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Listing</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <a href="#listings" className="bg-card border border-border hover:border-primary/50 rounded-xs p-4 shadow-2xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{myProperties.length} Accommodations</p>
            <p className="text-xs text-muted-foreground">
              {myProperties.filter((p) => p.status === "verified" && !p.isHiddenFromSearch).length} Verified & Public
            </p>
          </div>
        </a>

        <Link href="/dashboard/owner/visits" className="bg-card border border-border hover:border-primary/50 rounded-xs p-4 shadow-2xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              {visitRequests.filter((r) => r.status === "pending").length} Pending
            </p>
            <p className="text-xs text-muted-foreground">Student Visit Requests &rarr;</p>
          </div>
        </Link>

        <Link href="/dashboard/owner/maintenance" className="bg-card border border-border hover:border-primary/50 rounded-xs p-4 shadow-2xs flex items-center gap-3.5 transition-colors">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              {maintenanceTickets.filter((t) => t.status !== "resolved").length} Active Repairs
            </p>
            <p className="text-xs text-muted-foreground">Tenant Maintenance &rarr;</p>
          </div>
        </Link>
      </div>

      {/* Pending Student Visit Requests */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground font-heading">
              Incoming Student Visit Requests
            </h2>
          </div>
          <Link
            href="/dashboard/owner/visits"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Manage All Visits ({visitRequests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {visitRequests.map((req) => (
            <div
              key={req.id}
              className="border border-border rounded-xs p-4 bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {req.studentName}
                  </h3>
                  <span className="text-[11px] text-muted-foreground">• {req.institution}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requested to tour: <strong className="text-foreground">{req.propertyTitle}</strong>
                </p>
                <p className="text-[11px] text-primary font-medium">
                  Requested Time: {req.date} at {req.time}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {req.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, "approve")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(req.id, "decline")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card hover:bg-secondary text-foreground border border-border rounded-xs transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                      <span>Decline</span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-xs border ${
                      req.status === "approved"
                        ? "bg-secondary text-primary border-primary/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {req.status === "approved" ? "Visit Approved" : "Visit Declined"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tenant Maintenance & Repair Requests (Feature 10) */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground font-heading">
              Tenant Maintenance & Repair Requests
            </h2>
          </div>
          <Link
            href="/dashboard/owner/maintenance"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>Manage All Repairs ({maintenanceTickets.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {maintenanceTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="border border-border rounded-xs p-4 bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {ticket.issue}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs ${
                      ticket.urgency === "High"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {ticket.urgency} Urgency
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Property: <strong className="text-foreground">{ticket.propertyTitle}</strong> • Reported by: {ticket.tenantName}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Reported on {ticket.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {ticket.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => handleMaintAction(ticket.id, "in_progress")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Assign Technician</span>
                  </button>
                ) : ticket.status === "in_progress" ? (
                  <button
                    type="button"
                    onClick={() => handleMaintAction(ticket.id, "resolved")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Resolved & Closed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Accommodations & Verification Status */}
      <div id="listings" className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">
                My Listed Accommodations & Verification Status
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Review live inspection status, admin feedback notes, and visibility on the SmartRent BD public search.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium">
              {myProperties.length} listings registered
            </span>
          </div>
        </div>

        {myProperties.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary text-primary mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No Accommodations Listed Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start by publishing your first student room, sublet, or flat. It will be queued for admin inspection immediately.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Listing</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {myProperties.map((prop) => (
              <div
                key={prop.id}
                className={`border rounded-xs p-4 bg-background space-y-3 flex flex-col justify-between transition-colors ${
                  prop.status === "pending"
                    ? "border-amber-500/30"
                    : prop.status === "rejected"
                    ? "border-destructive/40 bg-destructive/5"
                    : prop.isHiddenFromSearch
                    ? "border-rose-500/40 bg-rose-500/5"
                    : "border-border"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-secondary text-primary rounded-xs border border-primary/20 uppercase">
                      {prop.type}
                    </span>

                    {/* Status Badge */}
                    {prop.isHiddenFromSearch ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-xs border border-rose-500/25">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Under Safety Review (Hidden)</span>
                      </span>
                    ) : prop.status === "verified" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-xs border border-emerald-500/25">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified & Published</span>
                      </span>
                    ) : prop.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-xs border border-amber-500/25">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending Admin Inspection</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-xs border border-destructive/25">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rejected: Revisions Required</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span>{prop.location}</span>
                  </p>
                  <p className="text-xs font-bold text-primary pt-0.5">{prop.rent}</p>

                  {/* Admin Feedback Notes */}
                  {prop.adminNotes && (
                    <div className="p-2.5 rounded-xs bg-secondary/60 border border-border text-xs space-y-1 mt-2">
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Moderation Feedback:</span>
                      </span>
                      <p className="text-xs text-foreground font-medium">{prop.adminNotes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs mt-2">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Ref: {prop.id}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingListing(prop.rawProperty || prop)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-foreground hover:text-primary hover:bg-secondary rounded-2xs border border-border transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingListing(prop.rawProperty || prop)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/10 rounded-2xs border border-destructive/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>

                    <Link
                      href={`/properties/${prop.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-[11px] ml-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateEditListingModal
          key="create-listing-modal"
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          initialData={null}
          onSuccess={handleSaveSuccess}
        />
      )}

      {/* Edit Modal */}
      {editingListing && (
        <CreateEditListingModal
          key={`edit-${editingListing.id || editingListing._id}`}
          isOpen={Boolean(editingListing)}
          onClose={() => setEditingListing(null)}
          initialData={editingListing}
          onSuccess={handleSaveSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AppConfirmDialog
        isOpen={Boolean(deletingListing)}
        onOpenChange={(open) => {
          if (!open) setDeletingListing(null);
        }}
        title="Remove or Deactivate Listing?"
        description={`Are you sure you want to delete "${deletingListing?.title || "this accommodation"}"? If there are active safety reports, the listing will be safely deactivated to preserve moderation logs.`}
        confirmText={isDeleting ? "Processing..." : "Confirm Removal"}
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
