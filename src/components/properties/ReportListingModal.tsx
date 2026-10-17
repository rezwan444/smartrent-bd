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
import { AlertTriangle, CheckCircle2, Flag } from "lucide-react";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const reportId = `SR-REP-${Date.now().toString().slice(-6)}`;
    const reportData = {
      id: reportId,
      propertyId: property.id,
      propertyTitle: property.title,
      reason: selectedReason,
      details,
      contactInfo,
      reportedAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("smartrent_listing_reports");
        const list = stored ? JSON.parse(stored) : [];
        list.push(reportData);
        localStorage.setItem("smartrent_listing_reports", JSON.stringify(list));
      } catch {
        // ignore
      }
    }

    setSubmittedReportId(reportId);
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
                  Thank you for keeping SmartRent BD safe for students and tenants. Your report has been recorded locally with reference ID:{" "}
                  <code className="text-xs font-mono font-semibold text-foreground px-1 py-0.5 bg-background rounded-xs border border-border">
                    {submittedReportId}
                  </code>.
                </p>
              </div>

              <div className="rounded-xs border border-border bg-background p-3.5 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Immediate Scam Alert Hotline:</p>
                <p className="leading-relaxed">
                  If someone solicited illegal fees or engaged in impersonation fraud, please email us directly at{" "}
                  <strong className="text-foreground">support@smartrentbd.com</strong> or call our safety desk at{" "}
                  <strong className="text-foreground">+880 1700-000000</strong>.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Reason for reporting *
                </label>
                <AppSelect
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                  options={REPORT_OPTIONS}
                  triggerClassName="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Describe what happened (Optional)
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Provide any additional context or proof..."
                  className="w-full p-2.5 text-xs rounded-xs border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Reports are handled confidentially. We investigate suspicious listings and de-list landlords who violate safety policies.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-foreground bg-background border border-border rounded-xs hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-destructive hover:bg-destructive/90 rounded-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Submit Safety Report</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
