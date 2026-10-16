"use client";

import { useState } from "react";
import Image from "next/image";
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
} from "lucide-react";
import { IProperty } from "@/types/property";
import { FACILITY_DEFINITIONS } from "@/lib/propertyFilters";

interface PropertyDetailsModalProps {
  property: IProperty | null;
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_MODAL_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500' fill='%23DDE8DF'><rect width='800' height='500' fill='%23DDE8DF'/><g fill='%2324483D' opacity='0.6'><path d='M400 160 L240 280 L280 280 L280 380 L520 380 L520 280 L560 280 Z'/><rect x='360' y='300' width='80' height='80' fill='%23FAF9F6'/></g><text x='400' y='420' font-family='sans-serif' font-size='20' fill='%2324483D' text-anchor='middle' font-weight='600'>SmartRent BD</text></svg>";

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
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-xs bg-card border border-border text-foreground shadow-lg">
        {/* Modal Header */}
        <DialogHeader className="p-5 sm:p-6 pb-0">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-xs uppercase bg-secondary text-primary border border-primary/20">
                {property.type}
              </span>
              {property.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-xs bg-card text-primary border border-primary/25">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  যাচাইকৃত লিস্টিং
                </span>
              )}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {property.availability}
              </span>
            </div>

            <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
              {property.title}
            </DialogTitle>

            <DialogDescription className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-accent shrink-0" />
              <span>
                {property.location.address || property.location.neighborhood},{" "}
                {property.location.city}
              </span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Main Photo & Thumbnails */}
          <div className="space-y-2">
            <div className="relative aspect-16/10 w-full rounded-xs overflow-hidden bg-background border border-border">
              <Image
                src={activeImage}
                alt={property.title}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
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
                    className={`relative w-20 h-14 rounded-xs overflow-hidden border-2 shrink-0 cursor-pointer ${
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

          {/* Rent and Primary Specifications */}
          <div className="p-4 rounded-xs bg-background border border-border flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                মাসিক ভাড়া (Monthly Rent)
              </p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-primary">
                  ৳ {property.rent.toLocaleString("en-US")}
                </span>
                <span className="text-sm text-muted-foreground">/ মাস</span>
              </div>
              {property.serviceCharge ? (
                <p className="text-xs text-muted-foreground">
                  সার্ভিস চার্জ: ৳{property.serviceCharge} / মাস
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  কোন অতিরিক্ত সার্ভিস চার্জ নেই
                </p>
              )}
            </div>

            <div className="flex items-center gap-5 text-sm text-foreground">
              {property.bedrooms && (
                <div className="text-center">
                  <div className="flex items-center justify-center text-muted-foreground mb-0.5">
                    <Bed className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{property.bedrooms}</span>{" "}
                  <span className="text-xs text-muted-foreground">রুম/বেড</span>
                </div>
              )}

              {property.bathrooms && (
                <div className="text-center">
                  <div className="flex items-center justify-center text-muted-foreground mb-0.5">
                    <Bath className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{property.bathrooms}</span>{" "}
                  <span className="text-xs text-muted-foreground">বাথরুম</span>
                </div>
              )}

              {property.sizeSqFt && (
                <div className="text-center">
                  <div className="flex items-center justify-center text-muted-foreground mb-0.5">
                    <Maximize2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{property.sizeSqFt}</span>{" "}
                  <span className="text-xs text-muted-foreground">বর্গফুট</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2">
              আবাসন বিবরণী (Description)
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Facilities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
              উপলব্ধ সুবিধাসমূহ (Included Facilities)
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
                <span>বাড়িওয়ালার সরাসরি যোগাযোগ ও অনলাইন বুকিং তথ্য</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                অনলাইন বুকিং ও ভেরিফায়েড সরাসরি মেসেজিং ব্যবস্থা বর্তমানে সীমিত বেটা টেস্টে রয়েছে। সরাসরি বাসা পরিদর্শন করতে বা বাড়িওয়ালার সাথে কথা বলতে আমাদের সাপোর্ট টিমে যোগাযোগ করুন: <strong className="text-foreground">support@smartrentbd.com</strong> অথবা হটলাইন: <strong className="text-foreground">01700-000000</strong> (সকাল ৯টা-রাত ১০টা)।
              </p>
            </div>
          )}

          {/* Security Advisory for Bangladesh Tenants */}
          <div className="rounded-xs border border-border bg-background p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs text-foreground space-y-1">
              <p className="font-semibold text-destructive">
                সরাসরি পরিদর্শন ও চুক্তিপত্র সংক্রান্ত পরামর্শ
              </p>
              <p className="text-muted-foreground">
                বাসা চূড়ান্ত করার আগে গ্যাস সংযোগের ধরণ (সিলিন্ডার/পাইপলাইন), বিদ্যুৎ বিলের সাবমিটার ব্যবস্থা এবং খাবার পানির ফিল্টারিং সম্পর্কে সরাসরি কথা বলে নিন।
              </p>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-border flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xs hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
            <button
              type="button"
              onClick={() => setShowContactAdvisory(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>যোগাযোগ ও বুকিং তথ্য (Beta)</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
