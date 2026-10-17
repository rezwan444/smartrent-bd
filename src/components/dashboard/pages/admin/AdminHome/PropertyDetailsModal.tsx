"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
  Info,
  Users,
  Building,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { IProperty } from "@/types/property";
import { FACILITY_DEFINITIONS } from "@/lib/propertyFilters";

interface PropertyDetailsModalProps {
  property: IProperty | null;
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_MODAL_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500' fill='%23DDE8DF'><rect width='800' height='500' fill='%23DDE8DF'/><g fill='%2324483D' opacity='0.6'><path d='M400 160 L240 280 L280 280 L280 380 L520 380 L520 280 Z'/><rect x='360' y='300' width='80' height='80' fill='%23FAF9F6'/></g><text x='400' y='420' font-family='sans-serif' font-size='20' fill='%2324483D' text-anchor='middle' font-weight='600'>SmartRent BD</text></svg>";

export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
}: PropertyDetailsModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showContactAdvisory, setShowContactAdvisory] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [prevPropId, setPrevPropId] = useState<string | null>(null);

  if (property && property.id !== prevPropId) {
    setPrevPropId(property.id);
    setActiveImageIndex(0);
    setShowContactAdvisory(false);
    setImageError(false);
  }

  if (!property) return null;

  const images = property.images?.length
    ? property.images
    : [property.featuredImage];
  const activeImage =
    imageError || !images[activeImageIndex]
      ? PROPERTY_MODAL_FALLBACK
      : images[activeImageIndex];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-5xl h-[90dvh] max-h-[850px]">
        {/* 1. Sticky Header */}
        <DialogHeader className="p-3.5 sm:p-5 border-b border-border bg-background shrink-0 pr-12">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-xs uppercase bg-secondary text-primary border border-primary/20">
                {property.type}
              </span>
              {property.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-xs bg-card text-primary border border-primary/25">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Verified</span>
                </span>
              )}
              <span className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{property.availability}</span>
              </span>
            </div>

            <DialogTitle className="text-base sm:text-xl font-bold text-foreground leading-snug line-clamp-2">
              {property.title}
            </DialogTitle>

            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="truncate">
                {property.location.address || property.location.neighborhood},{" "}
                {property.location.city}
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* 2. Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-6">
          {/* Top Grid: Gallery & Pricing Side-by-Side on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Gallery Frame & Thumbnails */}
            <div className="space-y-2">
              <div className="relative aspect-16/10 w-full rounded-xs overflow-hidden bg-background border border-border shadow-2xs">
                <Image
                  src={activeImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`View photo ${idx + 1}`}
                      className={`relative w-16 h-12 rounded-xs overflow-hidden border-2 shrink-0 cursor-pointer ${
                        activeImageIndex === idx
                          ? "border-primary"
                          : "border-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Specifications Summary Card */}
            <div className="space-y-3">
              <div className="p-4 rounded-xs bg-background border border-border space-y-2">
                <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block">
                  Monthly Rent
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-bold text-primary font-heading">
                    ৳ {property.rent.toLocaleString("en-US")}
                  </span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
                {property.serviceCharge ? (
                  <p className="text-xs text-muted-foreground">
                    +৳{property.serviceCharge} monthly service charge
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Service charge included
                  </p>
                )}
                {property.securityDeposit && (
                  <p className="text-xs text-muted-foreground pt-1.5 border-t border-border">
                    Security Deposit:{" "}
                    <strong className="text-foreground">
                      ৳{property.securityDeposit.toLocaleString("en-US")}
                    </strong>{" "}
                    (Refundable)
                  </p>
                )}
              </div>

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {property.bedrooms ? (
                  <div className="p-2.5 rounded-xs bg-background border border-border flex items-center gap-2">
                    <Bed className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        Bedrooms
                      </span>
                      <span className="font-semibold text-foreground">
                        {property.bedrooms} Bed
                      </span>
                    </div>
                  </div>
                ) : null}

                {property.bathrooms ? (
                  <div className="p-2.5 rounded-xs bg-background border border-border flex items-center gap-2">
                    <Bath className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        Bathrooms
                      </span>
                      <span className="font-semibold text-foreground">
                        {property.bathrooms} Bath
                      </span>
                    </div>
                  </div>
                ) : null}

                {property.sizeSqFt ? (
                  <div className="p-2.5 rounded-xs bg-background border border-border flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        Unit Size
                      </span>
                      <span className="font-semibold text-foreground">
                        {property.sizeSqFt} sq ft
                      </span>
                    </div>
                  </div>
                ) : null}

                {property.seatsAvailable ? (
                  <div className="p-2.5 rounded-xs bg-background border border-border flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        Seats
                      </span>
                      <span className="font-semibold text-foreground">
                        {property.seatsAvailable} Seat(s)
                      </span>
                    </div>
                  </div>
                ) : null}

                {property.floor ? (
                  <div className="p-2.5 rounded-xs bg-background border border-border flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-[10px] text-muted-foreground block">
                        Floor
                      </span>
                      <span className="font-semibold text-foreground truncate">
                        {property.floor}
                      </span>
                    </div>
                  </div>
                ) : null}

                <div className="p-2.5 rounded-xs bg-background border border-border flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block">
                      Available
                    </span>
                    <span className="font-semibold text-foreground truncate">
                      {property.availability}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Property Description
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Included Amenities & Facilities */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Included Amenities & Facilities
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {property.facilities.map((facId) => {
                const def = FACILITY_DEFINITIONS.find((f) => f.id === facId);
                return (
                  <div
                    key={facId}
                    className="flex items-center gap-2 text-xs text-foreground bg-background border border-border px-3 py-2 rounded-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{def ? def.label : facId}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact / Booking Status Section */}
          {showContactAdvisory && (
            <div className="rounded-xs border border-primary/30 bg-secondary/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>Direct Landlord Contact & Booking Information</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Online booking and verified direct messaging are currently in beta testing. To schedule an in-person viewing or connect directly with the landlord/property manager, please contact our support team at <strong className="text-foreground">support@smartrentbd.com</strong> or call our hotline: <strong className="text-foreground">01700-000000</strong> (Daily 9:00 AM – 10:00 PM).
              </p>
            </div>
          )}

          {/* Location & Interactive Map Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>Location & Map View</span>
              </h4>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  property.mapCoordinates
                    ? `${property.mapCoordinates.lat},${property.mapCoordinates.lng}`
                    : property.location.address || `${property.location.neighborhood}, ${property.location.city}, Bangladesh`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-primary bg-secondary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open in Google Maps</span>
              </a>
            </div>

            <div className="relative w-full h-44 sm:h-56 rounded-xs overflow-hidden border border-border bg-card shadow-2xs">
              <iframe
                title={`Map location for ${property.title}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  property.mapCoordinates
                    ? `${property.mapCoordinates.lat},${property.mapCoordinates.lng}`
                    : `${property.location.address || property.location.neighborhood}, ${property.location.city}, Bangladesh`
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              {property.mapCoordinates && (
                <div className="absolute bottom-2 left-2 text-[10px] font-mono font-medium text-foreground bg-card/95 backdrop-blur-xs px-2 py-0.5 rounded-xs border border-border shadow-xs pointer-events-none">
                  GPS: {property.mapCoordinates.lat.toFixed(4)}, {property.mapCoordinates.lng.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* Security Advisory for Bangladesh Tenants */}
          <div className="rounded-xs border border-border bg-background p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs text-foreground space-y-1">
              <p className="font-semibold text-destructive">
                In-Person Inspection & Tenancy Safety Advisory
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Before finalizing any tenancy agreement, always inspect the premises in person to verify gas connections (cylinder vs. pipeline), electricity sub-metering, and drinking water supply directly with the owner.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Sticky Modal Actions Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-card shrink-0 flex items-center justify-between gap-2.5 z-10 shadow-xs">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary bg-secondary hover:bg-primary hover:text-primary-foreground border border-primary/25 rounded-xs transition-colors cursor-pointer text-center"
          >
            <span>View Full Details</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex px-4 py-2.5 text-xs font-medium text-foreground bg-background border border-border rounded-xs hover:bg-secondary/40 transition-colors cursor-pointer shrink-0"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => setShowContactAdvisory((prev) => !prev)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Contact Host</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
