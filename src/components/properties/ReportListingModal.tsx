"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppSelect, AppSelectOption } from "@/components/shared/AppSelect";
import { IProperty } from "@/types/property";
import { CheckCircle2, Flag, EyeOff, ShieldAlert } from "lucide-react";
import { submitScamReport } from "@/lib/propertyModerationStorage";
import { toast } from "sonner";

interface ReportListingModalProps {
  property: IProperty;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Host asked for advance bKash / Nagad money before visit",
  "Misleading photos or inaccurate room specifications",
  "Incorrect monthly rent or unexpected hidden fees",
  "Property is already rented out or unavailable",
  "Suspected fraudulent / scam listing",
  "Safety, harassment or discriminatory policy",
  "Other tenancy guideline violation",
];

const REPORT_OPTIONS: AppSelectOption[] = REPORT_REASONS.map((reason) => ({
  value: reason,
  label: reason,
}));

export function ReportListingModal({
  property,
  isOpen,
  onClose,
}: ReportListingModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let reportRefId = "";

    try {
      const res = await fetch(`/api/properties/${property.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          details,
          contactInfo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        reportRefId = data.data?.reportId || "";
        toast.warning(data.message || "Report logged. Listing hidden from search results while under review.");
      } else if (res.status === 409) {
        toast.info(data.error || "You have already reported this listing.");
        setIsSubmitting(false);
        return;
      } else if (res.status === 401) {
        toast.error("Please sign in to report a listing.");
        setIsSubmitting(false);
        return;
      }
    } catch {
      // In offline/prototype mode, fallback gracefully to client store
    }

    // Call unified property moderation store (Track C3 Rule 8: Immediately hides listing from search)
    const localReport = submitScamReport({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: `${property.location.neighborhood}, ${property.location.city}`,
      reason: selectedReason,
      details,
      contactInfo,
      reportedBy: "Student Tenant",
    });

    setSubmittedReportId(reportRefId || localReport.id);
    setIsSubmitting(false);
  };

  const handleResetAndClose = () => {
    setSubmittedReportId(null);
    setDetails("");
    setContactInfo("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        {/* Sticky Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-background shrink-0 pr-12">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            <span>Report This Listing</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
            Listing #{property.id}: {property.title}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4">
          {submittedReportId ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xs bg-secondary/50 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Report Logged for Administrative Review</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thank you for keeping SmartRent BD safe for students. Your report has been recorded with reference ID:{" "}
                  <code className="text-xs font-mono font-semibold text-foreground px-1 py-0.5 bg-background rounded-xs border border-border">
                    {submittedReportId}
                  </code>.
                </p>
                <div className="flex items-center gap-2 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
                  <EyeOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Listing has been immediately suppressed from public search results during review.</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reason for Reporting <span className="text-destructive">*</span>
                </label>
                <AppSelect
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  options={REPORT_OPTIONS}
                  className="w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Specific Details / Description (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain what happened (e.g. host asked for ৳ 2,000 via bKash before visit, or address was incorrect)..."
                  rows={4}
                  className="w-full p-3 text-xs rounded-xs border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Your Phone or Email (Optional, for follow-up)
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="01XXXXXXXXX or email@domain.com"
                  className="w-full h-10 px-3 text-xs rounded-xs border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="rounded-xs border border-border bg-background p-3 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Reporting immediately flags the listing for admin inspection and temporarily removes it from public search results to protect other students.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xs hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Submitting Report..." : "Submit Safety Report"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
