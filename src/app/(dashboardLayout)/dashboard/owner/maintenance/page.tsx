"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Wrench,
  CheckCircle2,
  Building2,
  Loader2,
  RefreshCw,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

interface MaintenanceTicketItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  tenantPhone?: string;
  issue: string;
  description?: string;
  category: string;
  urgency: "Low" | "Medium" | "High" | "Emergency";
  status: "pending" | "in_progress" | "resolved";
  technicianNotes?: string;
  createdAt: string;
}

export default function OwnerMaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/owner/maintenance");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTickets(json.data);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Local fallback
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function initialLoad() {
      try {
        const res = await fetch("/api/owner/maintenance");
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && Array.isArray(json.data)) {
            setTickets(json.data);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Local fallback
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

  const handleUpdateStatus = async (
    id: string,
    newStatus: "in_progress" | "resolved"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/owner/maintenance/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          technicianNotes:
            newStatus === "in_progress"
              ? "Technician assigned for on-site inspection."
              : "Repair completed and verified.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update ticket.");
      }

      toast.success(
        newStatus === "in_progress"
          ? "Technician assigned! Status marked as In Progress."
          : "Repair ticket marked as Resolved!"
      );

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating ticket.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "active") return t.status !== "resolved";
    if (filter === "resolved") return t.status === "resolved";
    return true;
  });

  const activeCount = tickets.filter((t) => t.status !== "resolved").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

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
            <Wrench className="w-6 h-6 text-primary" />
            <span>Maintenance & Repair Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track plumbing, electrical, and appliance repair tickets submitted by active tenants across your properties.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => fetchTickets()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-background hover:bg-secondary border border-border rounded-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">Total Tickets Logged</span>
          <span className="text-2xl font-bold text-foreground mt-0.5 block">{tickets.length}</span>
        </div>
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">Active Repairs Needed</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
            {activeCount}
          </span>
        </div>
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs">
          <span className="text-xs text-muted-foreground block">Completed & Resolved</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {resolvedCount}
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
          All Tickets ({tickets.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
            filter === "active"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-background text-muted-foreground hover:bg-secondary"
          }`}
        >
          Active Repairs ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter("resolved")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
            filter === "resolved"
              ? "bg-primary text-primary-foreground shadow-2xs"
              : "bg-background text-muted-foreground hover:bg-secondary"
          }`}
        >
          Resolved ({resolvedCount})
        </button>
      </div>

      {/* Tickets List */}
      {isLoading ? (
        <div className="p-12 text-center bg-card border border-border rounded-xs space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">Loading maintenance tickets from database...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-xs space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">No maintenance tickets pending</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            All your rental units are in good working order. When tenants report issues, tickets will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-card border border-border rounded-xs p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground font-heading">
                    {ticket.issue}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
                      ticket.urgency === "High" || ticket.urgency === "Emergency"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {ticket.urgency} Urgency
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase border ${
                      ticket.status === "resolved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : ticket.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {ticket.status === "resolved"
                      ? "Resolved"
                      : ticket.status === "in_progress"
                      ? "Technician Assigned"
                      : "Pending Landlord Review"}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1.5 text-foreground font-medium">
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Property: {ticket.propertyTitle}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span>Reported by: <strong className="text-foreground">{ticket.tenantName}</strong> {ticket.tenantPhone && `(${ticket.tenantPhone})`}</span>
                  </p>
                  {ticket.description && (
                    <p className="p-2.5 rounded-xs bg-background border border-border text-xs text-foreground mt-2">
                      {ticket.description}
                    </p>
                  )}
                  {ticket.technicianNotes && (
                    <p className="text-[11px] text-primary font-medium">
                      Action Note: {ticket.technicianNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                {ticket.status !== "resolved" ? (
                  <>
                    {ticket.status === "pending" && (
                      <button
                        type="button"
                        disabled={updatingId === ticket.id}
                        onClick={() => handleUpdateStatus(ticket.id, "in_progress")}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
                      >
                        {updatingId === ticket.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" />
                        )}
                        <span>Assign Tech</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={updatingId === ticket.id}
                      onClick={() => handleUpdateStatus(ticket.id, "resolved")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolved</span>
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
