"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Building2,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface VisitRequestItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress?: string;
  studentName: string;
  studentEmail?: string;
  institution?: string;
  preferredDate: string;
  timeSlot: string;
  contactPhone: string;
  visitorCount?: string;
  notes?: string;
  status: "pending" | "approved" | "declined" | "completed";
  createdAt: string;
}

export default function OwnerVisitsPage() {
  const [visits, setVisits] = useState<VisitRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "declined">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/owner/visits");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setVisits(json.data);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Local fallback
    }

    // Client fallback if offline
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("smartrent_visit_requests");
        if (stored) {
          setVisits(JSON.parse(stored));
        }
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        const res = await fetch("/api/owner/visits");
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && Array.isArray(json.data)) {
            setVisits(json.data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Local fallback
      }

      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("smartrent_visit_requests");
          if (stored && !ignore) {
            setVisits(JSON.parse(stored));
          }
        } catch {
          // ignore
        }
      }
      if (!ignore) {
        setIsLoading(false);
      }
    }

    initialLoad();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "declined") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/owner/visits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status.");
      }

      toast.success(
        newStatus === "approved"
          ? "Visit confirmed! Student will receive arrival instructions."
          : "Visit request declined."
      );

      setVisits((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating visit request.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredVisits = visits.filter((v) => {
    if (filter === "all") return true;
    return v.status === filter;
  });

  const pendingCount = visits.filter((v) => v.status === "pending").length;
  const approvedCount = visits.filter((v) => v.status === "approved").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/owner"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Owner Dashboard</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-primary" />
            <span>Student Visit Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Review and schedule in-person tour appointments requested by prospective student tenants.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchVisits()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-background hover:bg-secondary border border-border rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">Total Tour Inquiries</span>
          <span className="text-2xl font-bold text-foreground mt-0.5 block">{visits.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">Awaiting Confirmation</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
            {pendingCount}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">Confirmed Appointments</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {approvedCount}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-background text-muted-foreground hover:bg-secondary"
          }`}
        >
          All Requests ({visits.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("pending")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
            filter === "pending"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-background text-muted-foreground hover:bg-secondary"
          }`}
        >
          Pending Inspection ({pendingCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("approved")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
            filter === "approved"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-background text-muted-foreground hover:bg-secondary"
          }`}
        >
          Confirmed ({approvedCount})
        </button>
      </div>

      {/* Visit Request Cards */}
      {isLoading ? (
        <div className="p-12 text-center bg-card border border-border rounded-xs space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading appointment requests from database...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xs space-y-3">
          <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No visit requests found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When students request to inspect your accommodation listings, their requests will appear here for you to confirm or reschedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVisits.map((v) => (
            <div
              key={v.id}
              className="bg-card border border-border rounded-xs p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground font-heading">
                    {v.studentName}
                  </h3>
                  {v.institution && (
                    <span className="text-xs text-muted-foreground">
                      &bull; {v.institution}
                    </span>
                  )}
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-xs border ${
                      v.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : v.status === "declined"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {v.status === "approved"
                      ? "Visit Confirmed"
                      : v.status === "declined"
                      ? "Declined"
                      : "Pending Landlord Confirmation"}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5 text-foreground font-medium">
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Listing: {v.propertyTitle}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>Requested Schedule: <strong className="text-foreground">{v.preferredDate}</strong> ({v.timeSlot})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Contact Phone: <a href={`tel:${v.contactPhone}`} className="text-primary hover:underline font-mono">{v.contactPhone}</a></span>
                    {v.visitorCount && <span>&bull; Visitors: {v.visitorCount} Person(s)</span>}
                  </p>
                  {v.notes && (
                    <p className="p-2.5 rounded-xs bg-background border border-border text-xs italic text-muted-foreground mt-2">
                      &ldquo;{v.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                {v.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === v.id}
                      onClick={() => handleUpdateStatus(v.id, "approved")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      {updatingId === v.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Confirm Visit</span>
                    </button>
                    <button
                      type="button"
                      disabled={updatingId === v.id}
                      onClick={() => handleUpdateStatus(v.id, "declined")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-background hover:bg-secondary border border-border rounded-xs transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                      <span>Decline</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Action logged
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
