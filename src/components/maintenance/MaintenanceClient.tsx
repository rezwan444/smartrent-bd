"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MaintenanceRequest,
  MaintenanceStatus,
} from "@/types/maintenance";
import {
  SavedSearchCriteria,
  MatchedListingAlert,
} from "@/types/savedSearch";
import {
  loadMaintenanceRequests,
  saveMaintenanceRequests,
  resetMaintenanceRequests,
} from "@/lib/maintenanceStorage";
import {
  loadSavedSearches,
  saveSavedSearches,
  loadMatchedAlerts,
  saveMatchedAlerts,
} from "@/lib/savedSearchStorage";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreateMaintenanceModal } from "./CreateMaintenanceModal";
import { CreateSavedSearchModal } from "./CreateSavedSearchModal";
import { AppConfirmDialog } from "@/components/shared/AppConfirmDialog";
import { toast } from "sonner";
import {
  Wrench,
  Bell,
  Plus,
  RotateCcw,
  Clock,
  CheckCircle2,
  Flame,
  Zap,
  Wifi,
  Droplets,
  Layers,
  Sparkles,
  MapPin,
  ArrowRight,
  Trash2,
  Check,
  Building2,
  ShieldAlert,
} from "lucide-react";

export function MaintenanceClient() {
  const [maintenanceRequests, setMaintenanceRequests] = useState<
    MaintenanceRequest[]
  >(() => loadMaintenanceRequests());

  const [savedSearches, setSavedSearches] = useState<SavedSearchCriteria[]>(
    () => loadSavedSearches()
  );

  const [matchedAlerts, setMatchedAlerts] = useState<MatchedListingAlert[]>(
    () => loadMatchedAlerts()
  );

  const [activeTab, setActiveTab] = useState<string>("maintenance");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    variant?: "destructive" | "warning" | "default";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Sync helpers
  const updateRequests = (data: MaintenanceRequest[]) => {
    setMaintenanceRequests(data);
    saveMaintenanceRequests(data);
  };

  const updateSearches = (data: SavedSearchCriteria[]) => {
    setSavedSearches(data);
    saveSavedSearches(data);
  };

  const updateAlerts = (data: MatchedListingAlert[]) => {
    setMatchedAlerts(data);
    saveMatchedAlerts(data);
  };

  // Handlers
  const handleCreateRequest = (req: MaintenanceRequest) => {
    const updated = [req, ...maintenanceRequests];
    updateRequests(updated);
    toast.success("Maintenance request submitted to landlord queue!");
  };

  const handleCancelRequest = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Cancel Maintenance Ticket",
      description: "Are you sure you want to cancel this maintenance request? The landlord will see this ticket marked as cancelled.",
      confirmText: "Cancel Ticket",
      variant: "destructive",
      onConfirm: () => {
        const updated = maintenanceRequests.map((r) =>
          r.id === id ? { ...r, status: "cancelled" as MaintenanceStatus } : r
        );
        updateRequests(updated);
        toast.info("Maintenance ticket marked as cancelled.");
      },
    });
  };

  const handleResolveRequest = (id: string) => {
    const updated = maintenanceRequests.map((r) =>
      r.id === id ? { ...r, status: "resolved" as MaintenanceStatus, updatedAt: "Just now" } : r
    );
    updateRequests(updated);
    toast.success("Maintenance marked as resolved by tenant!");
  };

  const handleCreateSavedSearch = (search: SavedSearchCriteria) => {
    const updated = [search, ...savedSearches];
    updateSearches(updated);
    toast.success(`Saved search '${search.title}' created! Alerts active.`);
  };

  const handleDeleteSavedSearch = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Saved Search",
      description: "Are you sure you want to delete this saved search? You will no longer receive alerts for new matching listings.",
      confirmText: "Delete Search",
      variant: "destructive",
      onConfirm: () => {
        const updated = savedSearches.filter((s) => s.id !== id);
        updateSearches(updated);
        toast.info("Saved search removed.");
      },
    });
  };

  const handleMarkAlertRead = (id: string) => {
    const updated = matchedAlerts.map((a) =>
      a.id === id ? { ...a, isRead: true } : a
    );
    updateAlerts(updated);
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Reset Maintenance Data",
      description: "Reset maintenance tickets and saved search data back to demo defaults?",
      confirmText: "Reset Data",
      variant: "warning",
      onConfirm: () => {
        const reset = resetMaintenanceRequests();
        setMaintenanceRequests(reset);
        toast.info("Maintenance data reset to demo defaults.");
      },
    });
  };

  const filteredRequests = maintenanceRequests.filter((req) => {
    if (statusFilter === "all") return true;
    return req.status === statusFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "plumbing":
        return <Droplets className="w-4 h-4 text-cyan-500" />;
      case "electrical":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "wifi":
        return <Wifi className="w-4 h-4 text-blue-500" />;
      case "gas":
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <Layers className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase tracking-wider">
            Emergency
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 uppercase tracking-wider">
            High Urgency
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-secondary text-muted-foreground border border-border">
            Low
          </span>
        );
    }
  };

  const unreadAlertsCount = matchedAlerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xs p-3.5 flex items-start sm:items-center gap-3 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <strong className="font-semibold">Simulated Demo Feature:</strong> Flat maintenance tickets and saved search matching alerts are simulated client-side for hackathon evaluation. No real external technician dispatch or live SMS is executed.
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feature 10 • Maintenance & Saved Search Alerts</span>
            </span>
            <span className="text-xs text-muted-foreground">• Demo Prototype</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary shrink-0" />
            <span>Flat Maintenance & Search Alerts Center</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground">
            Track repairs for Padma Flat 4B and get instant alerts when rooms matching your preferences are listed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-background border border-border rounded-xs transition-colors"
            title="Reset to default mock tickets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {activeTab === "maintenance" ? (
            <button
              type="button"
              onClick={() => setIsMaintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Repair Request</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save New Search</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-card border border-border rounded-xs p-1 h-auto inline-flex gap-1">
            <TabsTrigger
              value="maintenance"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance Requests ({maintenanceRequests.filter((r) => r.status !== "cancelled").length})</span>
            </TabsTrigger>

            <TabsTrigger
              value="alerts"
              className="text-xs px-3.5 py-2 rounded-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Saved Searches & Alerts ({savedSearches.length})</span>
              {unreadAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-1" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Maintenance Requests */}
        <TabsContent value="maintenance" className="mt-0 space-y-5">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xs p-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All Requests" },
                { id: "pending", label: "Pending Host" },
                { id: "in_progress", label: "In Progress" },
                { id: "resolved", label: "Resolved" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setStatusFilter(btn.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                    statusFilter === btn.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground">
              Showing {filteredRequests.length} of {maintenanceRequests.length} tickets
            </span>
          </div>

          {/* Request Cards */}
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center bg-card border border-dashed border-border rounded-xs space-y-2">
              <Wrench className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">No Maintenance Tickets</h3>
              <p className="text-xs text-muted-foreground">
                No tickets found for the selected status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-card border border-border rounded-xs p-4 sm:p-5 shadow-2xs space-y-3.5 transition-colors hover:border-primary/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-7 h-7 rounded-xs bg-secondary flex items-center justify-center shrink-0">
                        {getCategoryIcon(req.category)}
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                        {req.title}
                      </h3>
                      {getUrgencyBadge(req.urgency)}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                          req.status === "resolved"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : req.status === "in_progress"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : req.status === "cancelled"
                            ? "bg-muted text-muted-foreground border border-border"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {req.status === "in_progress"
                          ? "Technician Assigned"
                          : req.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <p className="text-xs text-foreground bg-muted/40 p-3 rounded-xs border border-border/50">
                    {req.description}
                  </p>

                  {/* Meta details & Technician Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-secondary/30 p-3 rounded-xs border border-border">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{req.propertyTitle} • {req.roomNumber || "Common Flat Area"}</span>
                      </div>
                      <div className="text-muted-foreground text-[11px] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Submitted: {req.createdAt}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-foreground">
                        <strong className="font-semibold text-primary">Landlord / Caretaker Update:</strong>{" "}
                        <span className="text-muted-foreground">{req.ownerNotes || "Pending review."}</span>
                      </div>
                      {req.estimatedResolution && (
                        <div className="text-[11px] text-muted-foreground">
                          Estimated ETA: <strong className="text-foreground">{req.estimatedResolution}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      Ticket ID: <code className="font-mono">{req.id}</code>
                    </span>

                    <div className="flex items-center gap-2">
                      {req.status !== "resolved" && req.status !== "cancelled" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResolveRequest(req.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xs transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Resolved</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(req.id)}
                            className="px-2.5 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xs transition-colors cursor-pointer"
                          >
                            Cancel Ticket
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Saved Searches & Match Alerts */}
        <TabsContent value="alerts" className="mt-0 space-y-6">
          {/* Matched Listing Alerts Sub-section */}
          <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground font-heading">
                  New Property Match Alerts ({matchedAlerts.length})
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">
                Matches from your active search subscriptions
              </span>
            </div>

            {matchedAlerts.length === 0 ? (
              <div className="p-8 text-center bg-background border border-dashed border-border rounded-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">All Caught Up!</h3>
                <p className="text-xs text-muted-foreground">
                  No new property match alerts right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {matchedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-xs p-3.5 bg-background transition-all space-y-3 flex flex-col justify-between ${
                      !alert.isRead
                        ? "border-primary/40 shadow-2xs bg-secondary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-xs overflow-hidden border border-border shrink-0 bg-muted">
                        <Image
                          src={alert.imageUrl}
                          alt={alert.propertyTitle}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-secondary text-primary rounded-xs">
                            {alert.type}
                          </span>
                          {!alert.isRead && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-500 text-white rounded-xs">
                              NEW
                            </span>
                          )}
                          <span className="text-xs font-bold text-primary font-mono ml-auto">
                            {alert.rent}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-foreground truncate" title={alert.propertyTitle}>
                          {alert.propertyTitle}
                        </h4>

                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{alert.location}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-muted-foreground">
                        Matched: {alert.matchedAt}
                      </span>

                      <div className="flex items-center gap-2">
                        {!alert.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkAlertRead(alert.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                        <Link
                          href={`/properties/${alert.propertyId}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
                        >
                          <span>View Room</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Saved Searches Sub-section */}
          <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground font-heading">
                  Active Saved Searches ({savedSearches.length})
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Search Filter</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="border border-border rounded-xs p-4 bg-background space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground">
                        {search.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedSearch(search.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                        title="Delete saved search"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] pt-1">
                      <span className="px-2 py-0.5 bg-secondary text-primary rounded-xs font-semibold">
                        📍 {search.location}
                      </span>
                      <span className="px-2 py-0.5 bg-secondary text-foreground rounded-xs">
                        🏷️ {search.propertyType.replace("_", " ")}
                      </span>
                      {search.maxBudget && (
                        <span className="px-2 py-0.5 bg-secondary text-foreground rounded-xs font-mono font-medium">
                          ৳ Max {search.maxBudget.toLocaleString()}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-xs">
                        🚻 {search.genderPreference.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {search.notifyInApp && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Check className="w-3 h-3" /> In-App
                        </span>
                      )}
                      {search.notifyEmail && (
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <Check className="w-3 h-3" /> Email Digest
                        </span>
                      )}
                    </div>
                    <span>Created {search.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateMaintenanceModal
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        onSubmit={handleCreateRequest}
      />

      <CreateSavedSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSubmit={handleCreateSavedSearch}
      />

      <AppConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, isOpen: open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
