"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import {
  ShieldCheck,
  UserCheck,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Calendar,
  AlertCircle,
  Clock,
  Building2,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function OwnerVerificationPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [nidNumber, setNidNumber] = useState("");
  const [dob, setDob] = useState("");
  const [holdingTaxNumber, setHoldingTaxNumber] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"unverified" | "pending" | "verified" | "rejected">("unverified");
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function fetchVerificationStatus() {
      try {
        const res = await fetch("/api/owner/verification");
        if (res.ok) {
          const json = await res.json();
          if (isSubscribed && json.data) {
            const d = json.data;
            setStatus(d.nidVerified ? "verified" : d.nidStatus || "unverified");
            if (d.nidNumber) setNidNumber(d.nidNumber);
            if (d.dob) setDob(d.dob);
            if (d.holdingTaxNumber) setHoldingTaxNumber(d.holdingTaxNumber);
            if (d.propertyAddress) setPropertyAddress(d.propertyAddress);
            if (d.adminNotes) setAdminNotes(d.adminNotes);
            if (d.submittedAt) setSubmittedAt(d.submittedAt);
          }
        }
      } catch {
        // Fallback for offline/demo
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    fetchVerificationStatus();
    return () => {
      isSubscribed = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nidNumber.trim() || !dob.trim() || !holdingTaxNumber.trim()) {
      toast.error("Please fill in NID number, Date of Birth, and municipal holding tax assessment.");
      return;
    }

    // DOB age validation (must be at least 18)
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      toast.error("Please enter a valid Date of Birth (YYYY-MM-DD).");
      return;
    }

    const today = new Date();
    if (birthDate > today) {
      toast.error("Date of Birth cannot be in the future.");
      return;
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      toast.error("Property owner must be at least 18 years old according to NID Date of Birth.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/owner/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nidNumber: nidNumber.trim(),
          dob: dob.trim(),
          holdingTaxNumber: holdingTaxNumber.trim(),
          propertyAddress: propertyAddress.trim() || "Dhaka, Bangladesh",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit verification documents.");
        setIsSubmitting(false);
        return;
      }

      setStatus("pending");
      setIsEditing(false);
      setSubmittedAt(new Date().toISOString());
      toast.success("Verification documents with NID and DOB submitted successfully! Under admin review.");
    } catch {
      toast.error("Network error while submitting verification. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/owner"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Owner Dashboard</span>
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span>Host Identity & Property Verification</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Verify your Government NID, Date of Birth, and property ownership holding tax records to earn the trusted &ldquo;NID Verified Host&rdquo; badge across all your listings.
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-semibold shrink-0 ${
              status === "verified"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : status === "pending"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                : status === "rejected"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {status === "verified" ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Host</span>
              </>
            ) : status === "pending" ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Under Review</span>
              </>
            ) : status === "rejected" ? (
              <>
                <AlertCircle className="w-4 h-4" />
                <span>Verification Rejected</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Unverified</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Trust Benefits Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xs border border-border bg-card space-y-1">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Top Search Ranking</span>
          </span>
          <p className="text-[11px] text-muted-foreground">
            Verified owner listings appear at the top of the search directory with priority placement.
          </p>
        </div>
        <div className="p-4 rounded-xs border border-border bg-card space-y-1">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>3x Higher Inquiries</span>
          </span>
          <p className="text-[11px] text-muted-foreground">
            Students and guardians strongly prefer visiting listings with verified landlord credentials.
          </p>
        </div>
        <div className="p-4 rounded-xs border border-border bg-card space-y-1">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-primary" />
            <span>Scam Protection</span>
          </span>
          <p className="text-[11px] text-muted-foreground">
            Protects your property against fraudulent duplicate postings by unauthorized brokers.
          </p>
        </div>
      </div>

      {/* VERIFIED STATE */}
      {status === "verified" && !isEditing && (
        <div className="bg-card border border-emerald-500/30 rounded-xs p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xs bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground font-heading">
                  Identity & Ownership Authenticated
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your credentials have been authenticated against the Bangladesh Election Commission registry.
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
              Host Badge Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-background border border-border rounded-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                <FileText className="w-3 h-3 text-primary" />
                <span>Smart NID Number</span>
              </span>
              <p className="font-mono font-bold text-sm text-foreground">
                {nidNumber ? `${nidNumber.slice(0, 4)} **** ${nidNumber.slice(-4)}` : "Verified on File"}
              </p>
            </div>

            <div className="p-3.5 bg-background border border-border rounded-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                <Calendar className="w-3 h-3 text-primary" />
                <span>Date of Birth (DOB)</span>
              </span>
              <p className="font-mono font-bold text-sm text-foreground">
                {dob || "Verified"}
              </p>
            </div>

            <div className="p-3.5 bg-background border border-border rounded-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" />
                <span>Holding Tax Ref</span>
              </span>
              <p className="font-mono font-bold text-sm text-foreground">
                {holdingTaxNumber || "Verified"}
              </p>
            </div>
          </div>

          <div className="p-3 bg-secondary/50 rounded-xs border border-border/60 text-xs text-muted-foreground flex items-center justify-between">
            <span>All your listings currently display the green &quot;Verified Landlord&quot; trust badge.</span>
            <Link
              href="/dashboard/owner"
              className="text-xs font-semibold text-primary hover:underline ml-2 shrink-0"
            >
              View Listings →
            </Link>
          </div>
        </div>
      )}

      {/* PENDING STATE */}
      {status === "pending" && !isEditing && (
        <div className="bg-card border border-amber-500/30 rounded-xs p-6 shadow-2xs space-y-6">
          <div className="flex items-start gap-4 border-b border-border pb-4">
            <div className="w-12 h-12 rounded-xs bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground font-heading">
                Verification Documents Under Administrative Inspection
              </h2>
              <p className="text-xs text-muted-foreground">
                Thank you, {user?.firstName || "Landlord"}. Your Government Smart NID, Date of Birth, and Holding Tax assessment receipt have been queued for moderator review. Inspection is typically completed within 12 business hours.
              </p>
              {submittedAt && (
                <p className="text-[11px] text-muted-foreground pt-1">
                  Submitted at: <span className="font-mono">{new Date(submittedAt).toLocaleString("en-GB")}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xs border border-border bg-background space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Submitted NID</span>
              <p className="font-mono font-bold text-foreground">{nidNumber}</p>
            </div>
            <div className="p-3 rounded-xs border border-border bg-background space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Date of Birth (DOB)</span>
              <p className="font-mono font-bold text-foreground">{dob}</p>
            </div>
            <div className="p-3 rounded-xs border border-border bg-background space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Holding Tax Reference</span>
              <p className="font-mono font-bold text-foreground">{holdingTaxNumber}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 rounded-xs border border-border cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              <span>Update / Correct Submitted Information</span>
            </button>
            <Link
              href="/dashboard/owner"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Back to Properties
            </Link>
          </div>
        </div>
      )}

      {/* REJECTED STATE BANNER */}
      {status === "rejected" && !isEditing && (
        <div className="p-4 rounded-xs bg-destructive/10 border border-destructive/30 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-bold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Verification Unsuccessful</span>
          </div>
          <p className="text-xs text-foreground">
            {adminNotes || "The submitted NID number or holding tax receipt did not match government registry records."}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs cursor-pointer transition-colors"
            >
              <span>Re-submit with Correct Credentials</span>
            </button>
          </div>
        </div>
      )}

      {/* FORM (Shown when unverified, rejected, or editing) */}
      {(status === "unverified" || isEditing || status === "rejected") && (
        <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                Submit Documents for Administrative Authentication
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                SmartRent BD moderators check NID credentials and Date of Birth against the Election Commission database and city corporation holding records.
              </p>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: NID */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <span>Government Smart NID Number *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1985 2692 4401 29"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xs border border-border bg-background text-foreground focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[11px] text-muted-foreground block">
                  10-digit Smart NID or 17-digit National ID card number.
                </span>
              </div>

              {/* Field 2: Date of Birth (DOB) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>Date of Birth (as per NID) *</span>
                </label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full text-xs p-2.5 rounded-xs border border-border bg-background text-foreground focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[11px] text-muted-foreground block">
                  Must match the birth date printed on your Government NID for Election Commission validation.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 3: Holding Tax Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <span>Municipal Holding Tax Assessment No. *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DNCC-HOLD-84920 / DSCC-4921"
                  value={holdingTaxNumber}
                  onChange={(e) => setHoldingTaxNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xs border border-border bg-background text-foreground focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[11px] text-muted-foreground block">
                  Municipal tax receipt number confirming ownership or authorization.
                </span>
              </div>

              {/* Field 4: Property Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Primary Property Ownership Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="House 14, Road 4, Block C, Banasree, Dhaka"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xs border border-border bg-background text-foreground focus:outline-none focus:border-primary"
                />
                <span className="text-[11px] text-muted-foreground block">
                  Address where holding tax is registered.
                </span>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="p-4 rounded-xs border border-dashed border-border bg-background text-center space-y-2">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
              <div className="text-xs">
                <span className="font-semibold text-primary">Upload Scanned NID (Front/Back) or Holding Tax Receipt</span>
                <span className="text-muted-foreground block text-[11px] mt-0.5">PDF, PNG, or JPG up to 10MB</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-xs cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? "Submitting..." : isEditing ? "Save & Re-submit Verification" : "Submit for Verification"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
