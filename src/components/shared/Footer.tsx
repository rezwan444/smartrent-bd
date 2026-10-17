"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  PhoneCall,
  Mail,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { WEBSITE_DETAILS } from "@/lib/constants";

export interface FooterProps {
  onLocationSelect?: (location: string) => void;
}

export function Footer({ onLocationSelect }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLocationClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    loc: string
  ) => {
    if (typeof window !== "undefined" && window.location.pathname !== "/" && window.location.pathname !== "") {
      return;
    }
    e.preventDefault();
    if (onLocationSelect) {
      onLocationSelect(loc);
    }
    const exploreSection = document.getElementById("explore");
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        window.history.pushState(null, "", "/");
      }
    }
  };

  return (
    <footer className="bg-card border-t border-border text-foreground">
      {/* 1. Trust, Safety & Caution Notice (Essential for Bangladesh Rental Reality) */}
      <div className="bg-background border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-card border border-border rounded-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-destructive" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>Important Safety Advisory for Renters</span>
                  <span className="text-[11px] font-semibold text-destructive bg-background px-2 py-0.5 rounded-xs border border-destructive/30">
                    Caution
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  Never send advance booking money or security deposits via bKash, Nagad, or bank transfer without visiting the property in person and meeting the landlord or manager directly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Choose Verified Listings
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Organization Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" onClick={handleLogoClick} className="inline-block cursor-pointer">
              <Image
                src={WEBSITE_DETAILS.SITE_LOGO}
                alt="SmartRent BD"
                width={170}
                height={50}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              SmartRent BD is an open rental discovery platform dedicated to university students, bachelor tenants, and families seeking affordable, verified housing across Dhaka and Bogura.
            </p>

            <div className="pt-2 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>Primary Hubs: Dhaka & Bogura, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>Helpdesk: support@smartrentbd.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-primary shrink-0" />
                <span>Support Hours: Daily 9:00 AM – 10:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 2: Bogura Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              Bogura Locations
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Satmatha")}
                  className="hover:text-primary transition-colors"
                >
                  Satmatha & College Road
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Azizul Haque")}
                  className="hover:text-primary transition-colors"
                >
                  Govt. Azizul Haque College Area
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Joleshwaritola")}
                  className="hover:text-primary transition-colors"
                >
                  Joleshwaritola Residential Area
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Colony")}
                  className="hover:text-primary transition-colors"
                >
                  Colony & Sherpur Road (Near Medical)
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Bogura")}
                  className="font-medium text-primary hover:underline"
                >
                  All Bogura Properties →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Dhaka Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              Dhaka Locations
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Banasree")}
                  className="hover:text-primary transition-colors"
                >
                  Banasree & Rampura (EWU Area)
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Mirpur")}
                  className="hover:text-primary transition-colors"
                >
                  Mirpur-10 & Mirpur DOHS
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Mohammadpur")}
                  className="hover:text-primary transition-colors"
                >
                  Mohammadpur & Ring Road
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Farmgate")}
                  className="hover:text-primary transition-colors"
                >
                  Farmgate & Indira Road
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Bashundhara")}
                  className="hover:text-primary transition-colors"
                >
                  Bashundhara R/A (NSU, IUB Area)
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Uttara")}
                  className="hover:text-primary transition-colors"
                >
                  Uttara (Sectors 7 & 11)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Navigation & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              Platform & Services
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#explore"
                  className="hover:text-primary transition-colors"
                >
                  Find Accommodation
                </a>
              </li>
              <li>
                <a
                  href="#roommates"
                  className="hover:text-primary transition-colors"
                >
                  Find Roommates (Beta)
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary transition-colors"
                >
                  Create Free Account
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin"
                  className="text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <p>© {currentYear} SmartRent BD. All rights reserved.</p>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-[11px] text-muted-foreground/80">
              Student rental & bachelor housing network for Dhaka and Bogura
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-primary font-medium">
              Find Your Place. Feel at Home.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer as SiteFooter };
export default Footer;
