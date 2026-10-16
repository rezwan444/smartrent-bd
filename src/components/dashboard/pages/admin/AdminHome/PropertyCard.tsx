"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Heart,
  Calendar,
  Users,
} from "lucide-react";
import { IProperty, PropertyType } from "@/types/property";

interface PropertyCardProps {
  property: IProperty;
  onViewDetails: (property: IProperty) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: string) => void;
}

const TYPE_CONFIG: Record<
  PropertyType,
  { label: string; bangla: string; bg: string; text: string; border: string }
> = {
  room: {
    label: "Room",
    bangla: "সিঙ্গেল রুম",
    bg: "bg-secondary",
    text: "text-primary",
    border: "border-primary/20",
  },
  mess: {
    label: "Mess Seat",
    bangla: "মেস সিট",
    bg: "bg-background",
    text: "text-foreground",
    border: "border-border",
  },
  flat: {
    label: "Full Flat",
    bangla: "ফ্ল্যাট",
    bg: "bg-primary",
    text: "text-primary-foreground",
    border: "border-primary",
  },
  hostel: {
    label: "Hostel",
    bangla: "হোস্টেল সিট",
    bg: "bg-background",
    text: "text-accent",
    border: "border-accent/30",
  },
};

const PROPERTY_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500' fill='%23DDE8DF'><rect width='800' height='500' fill='%23DDE8DF'/><g fill='%2324483D' opacity='0.6'><path d='M400 160 L240 280 L280 280 L280 380 L520 380 L520 280 L560 280 Z'/><rect x='360' y='300' width='80' height='80' fill='%23FAF9F6'/></g><text x='400' y='420' font-family='sans-serif' font-size='20' fill='%2324483D' text-anchor='middle' font-weight='600'>SmartRent BD</text></svg>";

export function PropertyCard({
  property,
  onViewDetails,
  isFavorite = false,
  onToggleFavorite,
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const typeBadge = TYPE_CONFIG[property.type] || TYPE_CONFIG.room;
  const formattedRent = property.rent.toLocaleString("en-US");

  return (
    <article className="group bg-card border border-border rounded-xs overflow-hidden hover:border-primary/50 transition-all duration-200 flex flex-col h-full shadow-2xs hover:shadow-xs">
      {/* Property Image Container with crisp 16:10 ratio */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-border/40">
        <Image
          src={
            imageError || !property.featuredImage
              ? PROPERTY_IMAGE_FALLBACK
              : property.featuredImage
          }
          alt={property.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-101"
          onError={() => setImageError(true)}
          priority={false}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {/* Property Type Badge */}
            <span
              className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold tracking-wide uppercase border shadow-xs ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}
            >
              {typeBadge.label} ({typeBadge.bangla})
            </span>

            {/* Verified Badge */}
            {property.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-semibold bg-card text-primary border border-primary/25 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">যাচাইকৃত</span>
              </span>
            )}
          </div>

          {/* Favorite Action Button - Non-bubbly square with subtle 2px radius */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(property.id);
            }}
            aria-label={
              isFavorite
                ? `Remove ${property.title} from saved`
                : `Save ${property.title}`
            }
            className="pointer-events-auto p-1.5 rounded-xs bg-card/90 hover:bg-card text-foreground hover:text-destructive shadow-xs border border-border transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? "fill-destructive text-destructive"
                  : "text-foreground/70 hover:text-destructive"
              }`}
            />
          </button>
        </div>

        {/* Bottom Availability Strip */}
        <div className="absolute bottom-2 left-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium bg-foreground/85 text-primary-foreground">
            <Calendar className="w-3 h-3 text-secondary" />
            <span>{property.availability}</span>
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Location Line */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="truncate">
              {property.location.neighborhood}, {property.location.city}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {property.title}
          </h3>

          {/* Specifications Row */}
          <div className="pt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {property.type === "mess" || property.type === "hostel" ? (
              property.seatsAvailable ? (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{property.seatsAvailable} সিট খালি আছে</span>
                </span>
              ) : null
            ) : property.bedrooms ? (
              <span className="inline-flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-foreground" />
                <span>{property.bedrooms} Bed</span>
              </span>
            ) : null}

            {property.bathrooms && (
              <span className="inline-flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-foreground" />
                <span>{property.bathrooms} Bath</span>
              </span>
            )}

            {property.sizeSqFt && (
              <span className="inline-flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-foreground" />
                <span>{property.sizeSqFt} sq ft</span>
              </span>
            )}
          </div>

          {/* Facility Highlights */}
          <div className="pt-1 flex flex-wrap gap-1">
            {property.facilities.slice(0, 3).map((facility) => {
              const labelMap: Record<string, string> = {
                wifi: "Wi-Fi",
                attached_bath: "অ্যাটাচড বাথ",
                furnished: "ফার্নিশড",
                balcony: "বারান্দা",
                family_friendly: "ফ্যামিলি",
                generator: "জেনারেটর/IPS",
                lift: "লিফট",
                cctv: "সিসিটিভি",
                kitchen: "রান্নাঘর/খালা",
              };
              return (
                <span
                  key={facility}
                  className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-background text-muted-foreground border border-border"
                >
                  {labelMap[facility] || facility}
                </span>
              );
            })}
            {property.facilities.length > 3 && (
              <span className="px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{property.facilities.length - 3} আরও
              </span>
            )}
          </div>
        </div>

        {/* Card Footer: Rent and View Details */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-primary tracking-tight">
                ৳ {formattedRent}
              </span>
              <span className="text-xs text-muted-foreground">/ মাস</span>
            </div>
            {property.serviceCharge ? (
              <p className="text-[10px] text-muted-foreground">
                +৳{property.serviceCharge} সার্ভিস চার্জ
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">সার্ভিস চার্জ অন্তর্ভুক্ত</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onViewDetails(property)}
            className="inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-primary bg-secondary hover:bg-primary hover:text-primary-foreground rounded-xs border border-primary/20 transition-colors cursor-pointer"
          >
            বিস্তারিত দেখুন
          </button>
        </div>
      </div>
    </article>
  );
}
