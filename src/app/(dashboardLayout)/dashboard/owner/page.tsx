"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppSelector } from "@/redux/hook";
import { toast } from "sonner";
import {
  Building2,
  CalendarCheck,
  Users,
  PlusCircle,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
} from "lucide-react";

export default function OwnerDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Property Owner";

  const [visitRequests, setVisitRequests] = useState([
    {
      id: "req-01",
      studentName: "Tanvir Hasan",
      institution: "Dhaka University (Dept of CSE)",
      propertyTitle: "Master Bed in Dhanmondi 27",
      propertyId: "prop-01",
      date: "Saturday, Oct 19",
      time: "3:30 PM",
      status: "pending",
    },
    {
      id: "req-02",
      studentName: "Sajjad Ali",
      institution: "Bogura Govt College",
      propertyTitle: "Furnished Mess Seat near Campus",
      propertyId: "prop-02",
      date: "Sunday, Oct 20",
      time: "10:00 AM",
      status: "pending",
    },
  ]);

  const handleAction = (id: string, action: "approve" | "decline") => {
    setVisitRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action === "approve" ? "approved" : "declined" } : req
      )
    );
    toast.success(
      action === "approve"
        ? "Visit request approved! Confirmation SMS simulated."
        : "Visit request declined."
    );
  };

  const myProperties = [
    {
      id: "prop-01",
      title: "Master Bedroom with Attached Balcony & Bath",
      area: "Dhanmondi 27, Dhaka",
      rent: "৳ 12,000 / month",
      type: "Single Room",
      status: "Active",
      views: 142,
    },
    {
      id: "prop-02",
      title: "Clean Student Mess Seat (All Utilities Included)",
      area: "Jaleshwaritola, Bogura",
      rent: "৳ 3,200 / month",
      type: "Mess Seat",
      status: "1 Seat Vacant",
      views: 89,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Property Owner Portal</span>
            </span>
            <span className="text-xs text-muted-foreground">• Demo Session</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your listed student accommodations, review visit requests, and connect with tenants.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toast.info("Property listing form is simulated in this frontend demo.", {
              duration: 3500,
            })
          }
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Listing (Demo)</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">2 Listings</p>
            <p className="text-xs text-muted-foreground">Active in Dhaka & Bogura</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              {visitRequests.filter((r) => r.status === "pending").length} Pending
            </p>
            <p className="text-xs text-muted-foreground">Student Visit Requests</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">231 Views</p>
            <p className="text-xs text-muted-foreground">Student Reach This Month</p>
          </div>
        </div>
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
          <span className="text-xs text-muted-foreground">Review & confirm scheduled times</span>
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

      {/* My Active Listings */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground font-heading">
              My Active Listings
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">2 listings published</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {myProperties.map((prop) => (
            <div
              key={prop.id}
              className="border border-border rounded-xs p-4 bg-background space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-secondary text-primary rounded-xs border border-primary/20">
                    {prop.type}
                  </span>
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{prop.views} views</span>
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                  {prop.title}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{prop.area}</span>
                </p>
                <p className="text-xs font-bold text-primary pt-0.5">{prop.rent}</p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>{prop.status}</span>
                </span>
                <Link
                  href={`/properties/${prop.id}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
                >
                  <span>Public View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
