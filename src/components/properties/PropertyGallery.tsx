"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Maximize2, Image as ImageIcon } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  featuredImage: string;
  title: string;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500' fill='%23DDE8DF'><rect width='800' height='500' fill='%23DDE8DF'/><g fill='%2324483D' opacity='0.6'><path d='M400 160 L240 280 L280 280 L280 380 L520 380 L520 280 L560 280 Z'/><rect x='360' y='300' width='80' height='80' fill='%23FAF9F6'/></g><text x='400' y='420' font-family='sans-serif' font-size='20' fill='%2324483D' text-anchor='middle' font-weight='600'>SmartRent BD</text></svg>";

export function PropertyGallery({ images, featuredImage, title }: PropertyGalleryProps) {
  const photoList = images && images.length > 0 ? images : [featuredImage];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % photoList.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "Escape") setIsLightboxOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Main Image Frame */}
      <div
        onClick={() => setIsLightboxOpen(true)}
        className="group relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden rounded-xs bg-border/40 border border-border cursor-pointer shadow-2xs"
      >
        <Image
          src={imageErrors[activeIndex] ? FALLBACK_IMAGE : photoList[activeIndex]}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-300 group-hover:scale-101"
          onError={() => setImageErrors((prev) => ({ ...prev, [activeIndex]: true }))}
        />

        {/* Counter Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-foreground/80 text-primary-foreground text-xs font-medium backdrop-blur-xs">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>
            {activeIndex + 1} / {photoList.length}
          </span>
        </div>

        {/* Expand / Lightbox Trigger */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-card/90 text-foreground border border-border text-xs font-semibold shadow-xs hover:bg-card transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>View Fullscreen</span>
        </div>

        {/* Prev / Next Arrows on Main Image (Hover) */}
        {photoList.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous photo"
              className="pointer-events-auto w-9 h-9 rounded-xs bg-card/90 text-foreground hover:bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next photo"
              className="pointer-events-auto w-9 h-9 rounded-xs bg-card/90 text-foreground hover:bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {photoList.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {photoList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative aspect-4/3 rounded-xs overflow-hidden border transition-all cursor-pointer bg-border/40 ${
                activeIndex === idx
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border opacity-70 hover:opacity-100 hover:border-foreground/30"
              }`}
            >
              <Image
                src={imageErrors[idx] ? FALLBACK_IMAGE : img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 25vw, 15vw"
                className="object-cover"
                onError={() => setImageErrors((prev) => ({ ...prev, [idx]: true }))}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent
          onKeyDown={handleKeyDown}
          className="sm:max-w-5xl w-full h-[85vh] p-0"
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-background shrink-0 pr-12">
            <DialogTitle className="text-sm font-semibold text-foreground truncate">
              {title} — Photo {activeIndex + 1} of {photoList.length}
            </DialogTitle>
          </div>

          {/* Lightbox Image Viewport */}
          <div className="relative flex-1 bg-foreground/95 flex items-center justify-center p-4">
            <div className="relative w-full h-full">
              <Image
                src={imageErrors[activeIndex] ? FALLBACK_IMAGE : photoList[activeIndex]}
                alt={`${title} - Photo ${activeIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation buttons inside lightbox */}
            {photoList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xs bg-card/90 text-foreground hover:bg-card flex items-center justify-center cursor-pointer shadow-md"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xs bg-card/90 text-foreground hover:bg-card flex items-center justify-center cursor-pointer shadow-md"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Thumbnails Strip */}
          {photoList.length > 1 && (
            <div className="p-3 bg-background border-t border-border flex items-center justify-center gap-2 overflow-x-auto">
              {photoList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-16 h-12 shrink-0 rounded-xs overflow-hidden border transition-all cursor-pointer ${
                    activeIndex === idx
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={imageErrors[idx] ? FALLBACK_IMAGE : img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
