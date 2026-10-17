import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Building2, Users } from "lucide-react";

interface AuthSidePanelProps {
  heading?: string;
  subheading?: string;
}

export function AuthSidePanel({
  heading = "Verified Student & Bachelor Housing in Bangladesh",
  subheading = "Connect directly with verified owners across Dhaka and Bogura university areas with zero brokerage fees.",
}: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 bg-primary text-primary-foreground relative flex-col justify-between p-8 xl:p-12 overflow-hidden border-r border-border/20">
      {/* Ambient background decoration */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_30%_20%,#ffffff_0%,transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Top Brand Link */}
      <div className="relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 group cursor-pointer focus:outline-hidden"
          aria-label="SmartRent BD Home"
        >
          <div className="bg-card px-3 py-1.5 rounded-xs shadow-xs">
            <Image
              src="/smartrent-bd.png"
              alt="SmartRent BD"
              width={140}
              height={35}
              priority
              className="h-7 w-auto object-contain"
            />
          </div>
        </Link>
        <span className="block mt-2 text-[11px] font-medium tracking-wide text-primary-foreground/75 uppercase">
          Student & Bachelor Housing Platform
        </span>
      </div>

      {/* Center Value Proposition */}
      <div className="relative z-10 space-y-6 my-auto py-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-primary-dark/60 text-primary-foreground border border-primary-foreground/15 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Dhaka & Bogura Hubs</span>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-2xl xl:text-3xl font-bold font-heading tracking-tight leading-tight text-primary-foreground">
            {heading}
          </h2>
          <p className="text-xs xl:text-sm text-primary-foreground/80 leading-relaxed max-w-md">
            {subheading}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xs bg-primary-foreground/10 flex items-center justify-center shrink-0 border border-primary-foreground/10">
              <ShieldCheck className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-foreground">
                100% Verified Listings
              </p>
              <p className="text-[11px] text-primary-foreground/75 leading-tight">
                Authentic room photos, transparent rent, and security deposit details.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xs bg-primary-foreground/10 flex items-center justify-center shrink-0 border border-primary-foreground/10">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-foreground">
                Zero Brokerage Charges
              </p>
              <p className="text-[11px] text-primary-foreground/75 leading-tight">
                Contact owners directly and schedule physical visits without commission.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xs bg-primary-foreground/10 flex items-center justify-center shrink-0 border border-primary-foreground/10">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-primary-foreground">
                Student & Bachelor Community
              </p>
              <p className="text-[11px] text-primary-foreground/75 leading-tight">
                Filters for study environments, mess meal systems, and campus proximity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Trust Marker */}
      <div className="relative z-10 pt-4 border-t border-primary-foreground/15 flex items-center justify-between text-[11px] text-primary-foreground/70">
        <span>Trusted by students across Bangladesh</span>
        <span className="font-semibold text-primary-foreground">★ 4.9/5 Rating</span>
      </div>
    </div>
  );
}
