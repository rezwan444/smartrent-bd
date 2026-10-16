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
                  <span>ভাড়াটিয়াদের জন্য জরুরি নিরাপত্তা বার্তা</span>
                  <span className="text-[11px] font-semibold text-destructive bg-background px-2 py-0.5 rounded-xs border border-destructive/30">
                    সতর্কতা
                  </span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                  সরাসরি বাসা, মেস বা হোস্টেলে গিয়ে রুম ও পরিবেশ না দেখে এবং বাড়িওয়ালা/ম্যানেজারের সাথে মুখোমুখি কথা না বলে কখনোই বিকাশ, নগদ বা ব্যাংকে কোনো অগ্রিম বুকিং মানি পাঠাবেন না।
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                যাচাইকৃত লিস্টিং বেছে নিন
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
              স্মার্টরেন্ট বিডি — ঢাকা, বগুড়া এবং বাংলাদেশের সকল বিভাগীয় ও জেলা শহরের বিশ্ববিদ্যালয় শিক্ষার্থী, চাকরিজীবী ও ব্যাচেলরদের জন্য সাশ্রয়ী বাসা ও মেস খোঁজার উন্মুক্ত ডিজিটাল মাধ্যম।
            </p>

            <div className="pt-2 space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent shrink-0" />
                <span>প্রধান সেবা এলাকা: ঢাকা ও বগুড়া শহর</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>হেল্পডেস্ক: support@smartrentbd.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-primary shrink-0" />
                <span>সাপোর্ট সময়: প্রতিদিন সকাল ৯টা থেকে রাত ১০টা</span>
              </div>
            </div>
          </div>

          {/* Column 2: বগুড়া আবাসন হাব (Bogura Student & Family Hubs) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              বগুড়া আবাসন (Bogura)
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Satmatha")}
                  className="hover:text-primary transition-colors"
                >
                  সাতমাথা ও কলেজ রোড
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Azizul Haque")}
                  className="hover:text-primary transition-colors"
                >
                  সরকারি আযীযুল হক কলেজ এলাকা
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Joleshwaritola")}
                  className="hover:text-primary transition-colors"
                >
                  জলেশ্বরীতলা আবাসিক এলাকা
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Colony")}
                  className="hover:text-primary transition-colors"
                >
                  কলোনী ও শেরপুর রোড (মেডিকেল সংলগ্ন)
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Bogura")}
                  className="font-medium text-primary hover:underline"
                >
                  বগুড়ার সকল মেস ও বাসা →
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: ঢাকা আবাসন হাব (Dhaka Student Hubs) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              ঢাকা আবাসন (Dhaka)
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Banasree")}
                  className="hover:text-primary transition-colors"
                >
                  বনশ্রী ও রামপুরা (EWU এলাকা)
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Mirpur")}
                  className="hover:text-primary transition-colors"
                >
                  মিরপুর-১০ ও মিরপুর ডিওএইচএস
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Mohammadpur")}
                  className="hover:text-primary transition-colors"
                >
                  মোহাম্মদপুর ও রিং রোড
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Farmgate")}
                  className="hover:text-primary transition-colors"
                >
                  ফার্মগেট ও ইন্দিরা রোড
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Bashundhara")}
                  className="hover:text-primary transition-colors"
                >
                  বসুন্ধরা আ/এ (NSU, IUB এলাকা)
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  onClick={(e) => handleLocationClick(e, "Uttara")}
                  className="hover:text-primary transition-colors"
                >
                  উত্তরা (সেক্টর ৭ ও ১১)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Navigation & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-2">
              সেবাসমূহ ও তথ্য
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#explore"
                  className="hover:text-primary transition-colors"
                >
                  বাসা ও মেস খুঁজুন
                </a>
              </li>
              <li>
                <a
                  href="#roommates"
                  className="hover:text-primary transition-colors"
                >
                  রুমমেট খুঁজুন (Beta)
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-primary transition-colors"
                >
                  কিভাবে কাজ করে
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-primary transition-colors"
                >
                  অ্যাকাউন্ট লগইন
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-primary transition-colors"
                >
                  নতুন অ্যাকাউন্ট খুলুন
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/admin"
                  className="text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  অ্যাডমিন পোর্টাল
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal & Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <p>© {currentYear} SmartRent BD. সর্বস্বত্ব সংরক্ষিত।</p>
            <span className="hidden sm:inline text-border">|</span>
            <span className="text-[11px] text-muted-foreground/80">
              বগুড়া ও ঢাকার শিক্ষার্থীদের জন্য তৈরি মেস ও ভাড়া আবাসন নেটওয়ার্ক
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
