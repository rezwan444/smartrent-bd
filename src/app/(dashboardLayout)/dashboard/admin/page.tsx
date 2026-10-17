"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  EyeOff,
  Eye,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  MapPin,
  Clock,
} from "lucide-react";

interface PendingListing {
  id: string;
  title: string;
  ownerName: string;
  ownerPhone: string;
  location: string;
  rent: string;
  type: string;
  nidStatus: "Verified" | "Submitted (Pending)" | "Not Submitted";
  status: "pending" | "approved" | "rejected";
}

interface ScamReport {
  id: string;
  listingId: string;
  listingTitle: string;
  location: string;
  reportedBy: string;
  reason: string;
  date: string;
  isHiddenFromSearch: boolean;
  status: "under_review" | "resolved" | "dismissed";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Guard: if logged in as Student or Owner, redirect to their respective dashboard
  useEffect(() => {
    if (reduxUser) {
      if (reduxUser.role === "STUDENT" || (reduxUser.role as string) === "CUSTOMER") {
        router.replace("/dashboard/student");
      } else if (reduxUser.role === "OWNER") {
        router.replace("/dashboard/owner");
      }
    }
  }, [reduxUser, router]);

  // Feature 3: Listing & Owner Verification Queue
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([
    {
      id: "ver-01",
      title: "Quiet Study Flat Share for University Students",
      ownerName: "Rahim Chowdhury",
      ownerPhone: "+880 1711-223344",
      location: "Nilkhet Katabon, Dhaka",
      rent: "৳ 6,500 / seat",
      type: "Mess Seat",
      nidStatus: "Verified",
      status: "pending",
    },
    {
      id: "ver-02",
      title: "Furnished Mess Seat near Bogura Govt College",
      ownerName: "Abdul Matin",
      ownerPhone: "+880 1819-556677",
      location: "Jaleshwaritola, Bogura",
      rent: "৳ 3,200 / seat",
      type: "Mess Seat",
      nidStatus: "Submitted (Pending)",
      status: "pending",
    },
    {
      id: "ver-03",
      title: "Spacious Master Bed in Mirpur 10",
      ownerName: "Kamrul Islam",
      ownerPhone: "+880 1912-334455",
      location: "Mirpur 10, Dhaka",
      rent: "৳ 11,000 / month",
      type: "Single Room",
      nidStatus: "Verified",
      status: "pending",
    },
  ]);

  // Feature 8: Scam Reporting & Hiding Reported Listings
  const [scamReports, setScamReports] = useState<ScamReport[]>([
    {
      id: "scam-01",
      listingId: "prop-fake-01",
      listingTitle: "Luxury 2-Bed Flat in Dhanmondi for ৳ 4,000/mo",
      location: "Dhanmondi, Dhaka",
      reportedBy: "Tanvir Hasan (DU CSE)",
      reason: "Suspiciously low rent. Landlord demanded ৳ 2,000 advance bKash token before allowing room inspection.",
      date: "Today, Oct 17",
      isHiddenFromSearch: true,
      status: "under_review",
    },
    {
      id: "scam-02",
      listingId: "prop-fake-02",
      listingTitle: "Duplex Mess Seat in Uttara Sector 11",
      location: "Uttara, Dhaka",
      reportedBy: "Nafis Fuad (BUET EEE)",
      reason: "Images copied from an Indian real estate portal. Physical address does not exist on Road 12.",
      date: "Yesterday, Oct 16",
      isHiddenFromSearch: true,
      status: "under_review",
    },
  ]);

  const handleVerifyListing = (id: string, action: "approve" | "reject") => {
    setPendingListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: action === "approve" ? "approved" : "rejected" }
          : item
      )
    );
    toast.success(
      action === "approve"
        ? "Listing approved! Verified badge issued and published to live search."
        : "Listing rejected. Feedback sent to owner for revision."
    );
  };

  const handleToggleHideListing = (reportId: string) => {
    setScamReports((prev) =>
      prev.map((report) => {
        if (report.id === reportId) {
          const nextHidden = !report.isHiddenFromSearch;
          toast.info(
            nextHidden
              ? "Listing hidden from public search until full investigation concludes."
              : "Listing unhidden and restored to search results."
          );
          return { ...report, isHiddenFromSearch: nextHidden };
        }
        return report;
      })
    );
  };

  const handleDismissReport = (reportId: string) => {
    setScamReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: "dismissed" } : report
      )
    );
    toast.success("Report dismissed. Listing marked as compliant.");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin & Verification Portal</span>
            </span>
            <span className="text-xs text-muted-foreground">• Demo Staff Session</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Administrator Overview & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Audit landlord identity verifications, review listing compliance, and suppress fraudulent listings across Dhaka & Bogura.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xs transition-colors shrink-0 shadow-2xs"
        >
          <ExternalLink className="w-4 h-4 text-primary" />
          <span>View Public Platform</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Pending Listings
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-foreground">
              {pendingListings.filter((l) => l.status === "pending").length} Awaiting
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Property Verification Queue
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Owner NID Verification
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-primary">
              2 Pending
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Govt NID & Holding Tax Checks
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
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
              {scamReports.filter((r) => r.status === "under_review").length} Active
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Reported by Verified Tenants
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active Verified Listings
            </span>
            <div className="w-8 h-8 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-heading text-foreground">
              12 Published
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dhaka (8) • Bogura (4)
            </p>
          </div>
        </div>
      </div>

      {/* Feature 3: Listing & Owner Verification Workflow */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground font-heading">
                Feature 3 • Owner & Listing Verification Queue
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Review landlord identity documents and room details before awarding the green &quot;Verified&quot; trust badge.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {pendingListings.filter((l) => l.status === "pending").length} pending review
          </span>
        </div>

        <div className="space-y-3">
          {pendingListings.map((listing) => (
            <div
              key={listing.id}
              className="border border-border rounded-xs p-4 bg-background flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-secondary text-primary rounded-xs border border-primary/20">
                    {listing.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-xs ${
                      listing.nidStatus === "Verified"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    NID: {listing.nidStatus}
                  </span>
                  <span className="text-xs font-bold text-primary font-mono">{listing.rent}</span>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-foreground">{listing.title}</h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{listing.location}</span>
                  </span>
                  <span>•</span>
                  <span>Host: <strong className="text-foreground">{listing.ownerName}</strong> ({listing.ownerPhone})</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                {listing.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleVerifyListing(listing.id, "approve")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-primary-foreground rounded-xs transition-colors shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyListing(listing.id, "reject")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card hover:bg-secondary text-foreground border border-border rounded-xs transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-destructive" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-xs border ${
                      listing.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                  >
                    {listing.status === "approved" ? "Verified & Published" : "Rejected"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 8: Scam Reporting & Hiding Reported Listings */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-foreground font-heading">
                Feature 8 • Scam Reporting & Listing Suppression Moderation
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              PUB CSE Fest Track C3 Requirement: Reported fraudulent listings are hidden from public search until reviewed.
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0 self-start sm:self-auto">
            {scamReports.filter((r) => r.isHiddenFromSearch).length} Listings Hidden
          </span>
        </div>

        <div className="space-y-3.5">
          {scamReports.map((report) => (
            <div
              key={report.id}
              className={`border rounded-xs p-4 bg-background space-y-3 transition-colors ${
                report.isHiddenFromSearch ? "border-amber-500/40 bg-amber-500/5" : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      report.isHiddenFromSearch
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {report.isHiddenFromSearch ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hidden From Search</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Publicly Visible</span>
                      </>
                    )}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">{report.listingTitle}</h3>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>Reported {report.date}</span>
                </div>
              </div>

              <div className="p-3 rounded-xs bg-background border border-border text-xs space-y-1">
                <div className="flex items-start gap-2 text-foreground">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Reason Reported:</span> {report.reason}
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground pl-5.5">
                  Reported by: <strong className="text-foreground">{report.reportedBy}</strong> • Location: {report.location}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                <div className="text-[11px] text-muted-foreground">
                  Listing ID: <code className="font-mono bg-muted px-1.5 py-0.5 rounded-xs">{report.listingId}</code>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleHideListing(report.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors cursor-pointer ${
                      report.isHiddenFromSearch
                        ? "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow-2xs"
                    }`}
                  >
                    {report.isHiddenFromSearch ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>Unhide Listing</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide From Search</span>
                      </>
                    )}
                  </button>

                  {report.status === "under_review" && (
                    <button
                      type="button"
                      onClick={() => handleDismissReport(report.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-card border border-border rounded-xs transition-colors cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roommate Matching Directory Link */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground font-heading">
                Roommate Matching Platform
              </h3>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-xs bg-secondary text-primary border border-primary/20">
                Track C3
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audit student compatibility algorithms, consent-based contact exchange, and lifestyle profile directory.
            </p>
          </div>
        </div>

        <Link
          href="/roommates"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Audit Roommates</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
