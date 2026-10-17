"use client";

import { Users, Sparkles, Shield, UserCheck } from "lucide-react";
import Link from "next/link";

export function RoommateTeaser() {
  return (
    <section
      id="roommates"
      className="py-12 sm:py-16 bg-background border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-border bg-card p-6 sm:p-8 rounded-xs">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-secondary text-primary text-[11px] font-bold uppercase tracking-wider mb-3 border border-primary/20">
              <Sparkles className="w-3 h-3" />
              <span>Roommate Matching System (Live Beta)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              Find Roommates Who Match Your Routine & Study Habits
            </h2>

            <p className="mt-2 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Living with incompatible roommates is stressful. SmartRent BD is developing an explainable roommate matching engine—comparing study schedules, sleep habits, cleanliness standards, and meal arrangements before exchanging contacts.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-border">
            <div className="space-y-1.5 p-3.5 bg-background border border-border rounded-xs">
              <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center mb-1.5">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Lifestyle & Routine Matching
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Compare waking hours, quiet study hours, and guest guidelines before deciding to live together.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-background border border-border rounded-xs">
              <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center mb-1.5">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Mutual Consent Exchange
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                Contact details and verified profiles are only shared when both individuals agree to connect.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 bg-background border border-border rounded-xs">
              <div className="w-7 h-7 rounded-xs bg-secondary text-primary flex items-center justify-center mb-1.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Student & Identity Verification
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                College/university ID card and identity checks ensure peace of mind for everyone in the flat.
              </p>
            </div>
          </div>

          <div className="mt-7 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Ready to find a roommate with matching sleep, study, and cleanliness habits?
            </p>
            <Link
              href="/roommates"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors cursor-pointer"
            >
              Browse Roommates & Compatibility &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
