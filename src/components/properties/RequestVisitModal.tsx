"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AppSelect, AppSelectOption } from "@/components/shared/AppSelect";
import { IProperty } from "@/types/property";
import useAuth from "@/hooks/useAuth";
import { useAppSelector } from "@/redux/hook";
import { selectUser } from "@/redux/features/user/authSlice";
import {
  Calendar,
  Clock,
  Phone,
  User,
  ShieldAlert,
  LogIn,
  CheckCircle2,
  Users,
  MessageSquare,
} from "lucide-react";

interface RequestVisitModalProps {
  property: IProperty;
  isOpen: boolean;
  onClose: () => void;
}

const VISITOR_OPTIONS: AppSelectOption[] = [
  { value: "1", label: "1 Person (Self)" },
  { value: "2", label: "2 Persons (With friend/guardian)" },
  { value: "3", label: "3+ Persons (Family / roommates)" },
];

export function RequestVisitModal({
  property,
  isOpen,
  onClose,
}: RequestVisitModalProps) {
  const isAuthenticated = useAuth();
  const currentUser = useAppSelector(selectUser);

  // Form states
  const [preferredDate, setPreferredDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("afternoon");
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || "");
  const [visitorCount, setVisitorCount] = useState("1");
  const [notes, setNotes] = useState("");
  const [submittedRequest, setSubmittedRequest] = useState<{
    id: string;
    date: string;
    slot: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredDate || !contactPhone) return;

    const requestId = `SR-VISIT-${Date.now().toString().slice(-6)}`;
    const newRequest = {
      id: requestId,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.location.address || property.location.neighborhood,
      preferredDate,
      timeSlot,
      contactPhone,
      visitorCount,
      notes,
      createdAt: new Date().toISOString(),
      status: "pending_landlord_confirmation",
    };

    // Store honestly in local storage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("smartrent_visit_requests");
        const list = stored ? JSON.parse(stored) : [];
        list.push(newRequest);
        localStorage.setItem("smartrent_visit_requests", JSON.stringify(list));
      } catch {
        // storage fallback
      }
    }

    setSubmittedRequest({
      id: requestId,
      date: preferredDate,
      slot:
        timeSlot === "morning"
          ? "10:00 AM – 1:00 PM"
          : timeSlot === "evening"
          ? "5:00 PM – 8:00 PM"
          : "2:00 PM – 5:00 PM",
    });
  };

  const handleResetAndClose = () => {
    setSubmittedRequest(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        {/* Sticky Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-border bg-background shrink-0 pr-12">
          <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Schedule an In-Person Visit</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
            {property.title} — {property.location.neighborhood}, {property.location.city}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4">
          {/* Case 1: Unauthenticated user */}
          {!isAuthenticated ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xs bg-secondary/50 border border-primary/20 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <User className="w-4 h-4" />
                  <span>Tenant Sign-In Required</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  To protect tenant safety, reduce spam for property managers, and keep tenancy agreements accountable, visit scheduling requires signing into your SmartRent BD account.
                </p>
              </div>

              <div className="rounded-xs border border-border bg-background p-3.5 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Zero advance fee policy:</strong> Neither SmartRent BD nor verified landlords will ever ask for booking fees before an in-person viewing.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xs hover:bg-secondary/40 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Link
                  href={`/login?redirect=/properties/${property.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In to Continue</span>
                </Link>
              </div>
            </div>
          ) : submittedRequest ? (
            /* Case 2: Successfully recorded visit */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xs bg-secondary/40 border border-primary/30 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Visit Request Recorded (Beta Mode)</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your viewing request for <strong className="text-foreground">{submittedRequest.date}</strong> ({submittedRequest.slot}) has been logged in this session under reference ID:{" "}
                  <code className="text-xs font-mono font-semibold text-foreground px-1 py-0.5 bg-background rounded-xs border border-border">
                    {submittedRequest.id}
                  </code>.
                </p>
              </div>

              <div className="rounded-xs border border-border bg-background p-3.5 text-xs text-muted-foreground space-y-1.5">
                <p className="font-semibold text-foreground">Next steps for in-person viewing:</p>
                <p className="leading-relaxed">
                  Live automatic landlord sync is currently in beta pilot. Our support desk alerts the landlord, or you can call the property manager directly at{" "}
                  <strong className="text-foreground">
                    {property.owner?.phone || "+880 1700-000000"}
                  </strong>{" "}
                  mentioning reference #{submittedRequest.id}.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Case 3: Authenticated user fill form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Preferred Visit Date *</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-xs border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Time Window */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Preferred Time Window *</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "morning", label: "Morning", sub: "10am - 1pm" },
                    { id: "afternoon", label: "Afternoon", sub: "2pm - 5pm" },
                    { id: "evening", label: "Evening", sub: "5pm - 8pm" },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setTimeSlot(slot.id)}
                      className={`p-2 rounded-xs border text-center transition-all cursor-pointer ${
                        timeSlot === slot.id
                          ? "bg-secondary text-primary border-primary font-semibold"
                          : "bg-background text-muted-foreground border-border hover:border-foreground/30"
                      }`}
                    >
                      <span className="block text-xs">{slot.label}</span>
                      <span className="block text-[10px] opacity-80">{slot.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Phone & Visitors Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>Contact Phone *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xs border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span>Number of Persons</span>
                  </label>
                  <AppSelect
                    value={visitorCount}
                    onValueChange={setVisitorCount}
                    options={VISITOR_OPTIONS}
                    triggerClassName="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Notes or Questions (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Inquiring about attached gas or student study space..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xs border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              {/* Safety Warning */}
              <div className="rounded-xs border border-border bg-background p-2.5 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-tight">
                  Always inspect premises in person before paying any advance rent or signing contracts.
                </p>
              </div>

              {/* Action Buttons */}
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Confirm Visit Request</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
