"use client";

import { IProperty } from "@/types/property";
import {
  MapPin,
  ExternalLink,
  GraduationCap,
  Bus,
  Building2,
} from "lucide-react";

interface PropertyLocationSectionProps {
  property: IProperty;
}

export function PropertyLocationSection({
  property,
}: PropertyLocationSectionProps) {
  const fullAddress =
    property.location.address ||
    `${property.location.neighborhood}, ${property.location.city}, Bangladesh`;

  const mapQuery = encodeURIComponent(
    property.mapCoordinates
      ? `${property.mapCoordinates.lat},${property.mapCoordinates.lng}`
      : fullAddress
  );
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const defaultLandmarks = [
    {
      name: `${property.location.neighborhood} Main Stoppage`,
      distance: "3 mins walk",
      category: "transit",
    },
    {
      name: `Local Campus & Coaching Hub (${property.location.city})`,
      distance: "5-10 mins",
      category: "campus",
    },
    {
      name: `Neighborhood Grocery Bazaar`,
      distance: "2 mins walk",
      category: "market",
    },
  ];

  const landmarks =
    property.nearbyLandmarks && property.nearbyLandmarks.length > 0
      ? property.nearbyLandmarks
      : defaultLandmarks;

  return (
    <div className="bg-card border border-border rounded-xs p-5 sm:p-6 space-y-5 shadow-2xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span>Location & Neighborhood Transit</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {fullAddress}
          </p>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-secondary hover:bg-primary hover:text-primary-foreground border border-primary/20 rounded-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      {/* Real Interactive Map Viewport */}
      <div className="relative w-full h-64 sm:h-80 rounded-xs overflow-hidden border border-border bg-card shadow-2xs">
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

        {/* Floating coordinates badge */}
        {property.mapCoordinates && (
          <div className="absolute bottom-2.5 left-2.5 text-[11px] font-mono font-medium text-foreground bg-card/95 backdrop-blur-xs px-2.5 py-1 rounded-xs border border-border shadow-xs pointer-events-none">
            GPS: {property.mapCoordinates.lat.toFixed(4)}, {property.mapCoordinates.lng.toFixed(4)}
          </div>
        )}
      </div>

      {/* Transit & Campus Proximity Points */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Key Transit & Campus Landmarks Nearby
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {landmarks.map((lm, idx) => {
            const Icon =
              lm.category === "campus"
                ? GraduationCap
                : lm.category === "transit"
                ? Bus
                : Building2;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xs bg-background border border-border text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="w-6 h-6 rounded-xs bg-secondary text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-foreground truncate">
                    {lm.name}
                  </span>
                </div>
                <span className="font-semibold text-accent shrink-0 text-[11px]">
                  {lm.distance}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
