"use client";

import Link from "next/link";
import { useAppSelector } from "@/redux/hook";
import {
  CalendarCheck,
  Bookmark,
  Home,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  Sparkles,
} from "lucide-react";

export default function StudentDashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "Student Tenant";

  const scheduledVisits = [
    {
      id: "v-01",
      propertyTitle: "Single Master Bed in Dhanmondi 27",
      propertyId: "prop-01",
      location: "Dhanmondi, Dhaka",
      date: "Tomorrow, Oct 18",
      time: "4:00 PM",
      status: "Confirmed",
      ownerName: "Rahim Chowdhury",
      ownerPhone: "+880 1711-223344",
    },
    {
      id: "v-02",
      propertyTitle: "Furnished Mess Seat near Bogura Govt College",
      propertyId: "prop-02",
      location: "Jaleshwaritola, Bogura",
      date: "Monday, Oct 20",
      time: "11:30 AM",
      status: "Pending Host",
      ownerName: "Abdul Matin",
      ownerPhone: "+880 1819-556677",
    },
  ];

  const savedListings = [
    {
      id: "prop-01",
      title: "Quiet Study Flat Share for University Students",
      area: "Nilkhet, Dhaka",
      rent: "৳ 6,500/mo",
      type: "Mess Seat",
    },
    {
      id: "prop-03",
      title: "Spacious Bachelor Room with Attached Bath",
      area: "Mirpur 10, Dhaka",
      rent: "৳ 8,000/mo",
      type: "Single Room",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-xs p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-secondary text-primary border border-primary/20">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student / Tenant Portal</span>
            </span>
            <span className="text-xs text-muted-foreground">• Demo Session</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground tracking-tight">
            Welcome, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your visit bookings, saved properties, and landlord messages across Dhaka & Bogura.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs"
        >
          <Home className="w-4 h-4" />
          <span>Browse Available Rooms</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">2 Visits</p>
            <p className="text-xs text-muted-foreground">Scheduled Room Tours</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">3 Rooms</p>
            <p className="text-xs text-muted-foreground">Saved to Favorites</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xs p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">100% Free</p>
            <p className="text-xs text-muted-foreground">Zero Broker Charges</p>
          </div>
        </div>
      </div>

      {/* Scheduled Visits Section */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground font-heading">
              My Scheduled Room Visits
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">2 active bookings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {scheduledVisits.map((visit) => (
            <div
              key={visit.id}
              className="border border-border rounded-xs p-4 bg-background space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold uppercase tracking-wider ${
                      visit.status === "Confirmed"
                        ? "bg-secondary text-primary border border-primary/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {visit.status}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{visit.date} at {visit.time}</span>
                  </div>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                  {visit.propertyTitle}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span>{visit.location}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="text-[11px] text-muted-foreground">
                  Host: <strong className="text-foreground">{visit.ownerName}</strong> ({visit.ownerPhone})
                </div>
                <Link
                  href={`/properties/${visit.propertyId}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-xs"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roommate Matching Feature Banner */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-foreground font-heading">
                Find Compatible Roommates
              </h3>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-xs bg-secondary text-primary border border-primary/20">
                Live Beta
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compare study habits, sleep schedules, and smoking policies with verified students across Dhaka and Bogura.
            </p>
          </div>
        </div>

        <Link
          href="/roommates"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shrink-0 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore Directory</span>
        </Link>
      </div>

      {/* Saved Properties Quick Access */}
      <div className="bg-card border border-border rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground font-heading">
              Quick Saved Accommodations
            </h2>
          </div>
          <Link href="/" className="text-xs text-primary hover:underline font-medium">
            Search all listings
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {savedListings.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-xs p-3.5 bg-background flex items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-secondary text-primary rounded-xs">
                    {item.type}
                  </span>
                  <span className="text-xs font-bold text-primary">{item.rent}</span>
                </div>
                <p className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                  {item.title}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{item.area}</span>
                </p>
              </div>

              <Link
                href={`/properties/${item.id}`}
                className="px-2.5 py-1.5 text-xs font-medium text-foreground bg-card hover:bg-secondary border border-border rounded-xs transition-colors shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
