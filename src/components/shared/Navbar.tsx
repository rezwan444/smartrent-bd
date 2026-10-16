"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { WEBSITE_DETAILS } from "@/lib/constants";

export interface NavbarProps {
  onFindPlaceClick?: () => void;
}

export function Navbar({ onFindPlaceClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handlePlacesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onFindPlaceClick) {
      e.preventDefault();
      onFindPlaceClick();
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If already on the homepage, scroll smoothly to the top
    if (typeof window !== "undefined" && (window.location.pathname === "/" || window.location.pathname === "")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        window.history.pushState(null, "", "/");
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        scrolled
          ? "bg-background/98 backdrop-blur-md border-border shadow-2xs"
          : "bg-background border-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Brand Logo */}
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            aria-label="SmartRent BD Home"
          >
            <Image
              src={WEBSITE_DETAILS.SITE_LOGO}
              alt="SmartRent BD"
              width={160}
              height={44}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 lg:gap-2"
          >
            <a
              href="#explore"
              onClick={handlePlacesClick}
              className="px-3 py-1.5 text-xs lg:text-sm font-medium text-foreground hover:text-primary rounded-xs transition-colors hover:bg-secondary/40"
            >
              বাসা ও মেস খুঁজুন
            </a>

            <a
              href="#roommates"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("roommates");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3 py-1.5 text-xs lg:text-sm font-medium text-foreground hover:text-primary rounded-xs transition-colors hover:bg-secondary/40 flex items-center gap-1.5"
            >
              <span>রুমমেট ম্যাচিং</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded-xs bg-secondary text-primary border border-primary/25">
                Beta
              </span>
            </a>

            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("how-it-works");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-3 py-1.5 text-xs lg:text-sm font-medium text-muted-foreground hover:text-foreground rounded-xs transition-colors hover:bg-secondary/40"
            >
              ব্যবহার নির্দেশিকা
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs lg:text-sm font-medium text-foreground hover:text-primary transition-colors rounded-xs"
            >
              লগইন (Sign In)
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-xs lg:text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs"
            >
              অ্যাকাউন্ট খুলুন
            </Link>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-foreground hover:text-primary rounded-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 top-16 bg-foreground/40 z-30"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed top-16 inset-x-0 bg-background border-b border-border shadow-md z-40 px-5 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              <a
                href="#explore"
                onClick={handlePlacesClick}
                className="px-3 py-2 text-sm font-medium text-foreground rounded-xs hover:bg-secondary/50"
              >
                বাসা ও মেস খুঁজুন
              </a>
              <a
                href="#roommates"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const el = document.getElementById("roommates");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-2 text-sm font-medium text-foreground rounded-xs hover:bg-secondary/50 flex items-center justify-between"
              >
                <span>রুমমেট ম্যাচিং</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-xs bg-secondary text-primary">
                  Beta
                </span>
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  const el = document.getElementById("how-it-works");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-xs hover:bg-secondary/50"
              >
                ব্যবহার নির্দেশিকা
              </a>
            </nav>

            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-foreground border border-border rounded-xs hover:bg-background"
              >
                লগইন (Sign In)
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs shadow-2xs"
              >
                অ্যাকাউন্ট খুলুন (Free Account)
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { Navbar as SiteNavbar };
export default Navbar;
