"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  X,
  Building2,
  MapPin,
  Banknote,
  Sparkles,
  Image as ImageIcon,
  Check,
  Loader2,
  Info,
  Upload,
  Trash2,
  Star,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import { AppSelect, type AppSelectOption } from "@/components/shared/AppSelect";
import type { PropertyType, PropertyFacility } from "@/types/property";

interface CreateEditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSuccess: (listing: any) => void;
}

const PRESET_IMAGES = [
  {
    label: "Modern Student Room",
    url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Master Bed & Balcony",
    url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Budget Mess Seat",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Spacious Flat",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  },
];

const FACILITY_OPTIONS: { id: PropertyFacility; label: string }[] = [
  { id: "wifi", label: "High-Speed WiFi" },
  { id: "attached_bath", label: "Attached Bathroom" },
  { id: "furnished", label: "Furnished / Bed Included" },
  { id: "balcony", label: "Private Balcony" },
  { id: "generator", label: "Generator / IPS Backup" },
  { id: "lift", label: "Elevator / Lift" },
  { id: "cctv", label: "CCTV & Security Guard" },
  { id: "kitchen", label: "Shared / Private Kitchen" },
  { id: "family_friendly", label: "Family / Student Friendly" },
];

export function CreateEditListingModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: CreateEditListingModalProps) {
  const isEdit = Boolean(initialData && (initialData.id || initialData._id));

  // Form State initialized directly from initialData
  const [title, setTitle] = useState(() => initialData?.title || "");
  const [propertyType, setPropertyType] = useState<PropertyType>(() => initialData?.type || "room");
  const [roomType, setRoomType] = useState<"single" | "shared" | "master" | "entire_flat">(
    () => initialData?.roomType || "single"
  );
  const [neighborhood, setNeighborhood] = useState(
    () =>
      initialData?.location?.neighborhood ||
      (typeof initialData?.location === "string" ? initialData.location.split(",")[0]?.trim() : "") ||
      ""
  );
  const [city, setCity] = useState(
    () =>
      initialData?.location?.city ||
      (typeof initialData?.location === "string" ? initialData.location.split(",")[1]?.trim() : "Dhaka") ||
      "Dhaka"
  );
  const [address, setAddress] = useState(() => initialData?.location?.address || "");
  const [rent, setRent] = useState<number | "">(() => {
    if (!initialData) return "";
    const rentNum = typeof initialData.rent === "number"
      ? initialData.rent
      : parseInt(String(initialData.rent || "").replace(/\D/g, ""), 10);
    return isNaN(rentNum) ? "" : rentNum;
  });
  const [serviceCharge, setServiceCharge] = useState<number | "">(() => initialData?.serviceCharge || 0);
  const [securityDeposit, setSecurityDeposit] = useState<number | "">(() => initialData?.securityDeposit || "");
  const [bedrooms, setBedrooms] = useState(() => initialData?.bedrooms || 1);
  const [bathrooms, setBathrooms] = useState(() => initialData?.bathrooms || 1);
  const [balconies, setBalconies] = useState(() => initialData?.balconies || 0);
  const [seatsAvailable, setSeatsAvailable] = useState(() => initialData?.seatsAvailable || 1);
  const [facilities, setFacilities] = useState<PropertyFacility[]>(() => initialData?.facilities || ["wifi", "attached_bath"]);
  const [availability, setAvailability] = useState(() => initialData?.availability || "Available Now");
  const [genderPreference, setGenderPreference] = useState<"any" | "male_only" | "female_only" | "family_only">(
    () => initialData?.genderPreference || "any"
  );
  const [tenantType, setTenantType] = useState<"students" | "bachelors" | "job_holders" | "family" | "any">(
    () => initialData?.tenantType || "students"
  );
  const [images, setImages] = useState<string[]>(() => {
    if (Array.isArray(initialData?.images) && initialData.images.length > 0) {
      return initialData.images;
    }
    if (initialData?.featuredImage) {
      return [initialData.featuredImage];
    }
    return [PRESET_IMAGES[0].url];
  });
  const [featuredImage, setFeaturedImage] = useState<string>(
    () => initialData?.featuredImage || initialData?.images?.[0] || PRESET_IMAGES[0].url
  );
  const [isUploading, setIsUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [description, setDescription] = useState(() => initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleFacility = (facility: PropertyFacility) => {
    setFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.url) {
            uploadedUrls.push(json.data.url);
          }
        } else {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(dataUrl);
        }
      } catch {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(dataUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => {
        const updated = [...prev, ...uploadedUrls];
        if (!featuredImage || prev.length === 0) {
          setFeaturedImage(uploadedUrls[0]);
        }
        return updated;
      });
      toast.success(`${uploadedUrls.length} photo(s) added successfully!`);
    } else {
      toast.error("Failed to upload photos. Please try again.");
    }

    setIsUploading(false);
    e.target.value = "";
  };

  const handleAddUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed) {
      toast.error("Please enter a valid image URL.");
      return;
    }
    if (!images.includes(trimmed)) {
      setImages((prev) => [...prev, trimmed]);
      if (!featuredImage) {
        setFeaturedImage(trimmed);
      }
      toast.success("Image URL added to gallery!");
    } else {
      toast.info("This image is already in your gallery.");
    }
    setNewImageUrl("");
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);

    if (featuredImage === removedUrl) {
      setFeaturedImage(updated[0] || "");
    }
    toast.info("Photo removed from listing.");
  };

  const handleSetCover = (imgUrl: string) => {
    setFeaturedImage(imgUrl);
    setImages((prev) => [imgUrl, ...prev.filter((u) => u !== imgUrl)]);
    toast.success("Set as primary cover photo!");
  };

  const handleAddPreset = (presetUrl: string) => {
    if (!images.includes(presetUrl)) {
      setImages((prev) => [...prev, presetUrl]);
      if (!featuredImage) setFeaturedImage(presetUrl);
      toast.success("Sample preset photo added!");
    } else {
      handleSetCover(presetUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || title.trim().length < 5) {
      toast.error("Please enter a listing title of at least 5 characters.");
      return;
    }
    if (!neighborhood.trim()) {
      toast.error("Neighborhood (e.g. Banasree, Mirpur, Dhanmondi) is required.");
      return;
    }
    if (!rent || Number(rent) <= 0) {
      toast.error("Please specify a valid monthly rent in BDT.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      toast.error("Please provide a description of at least 10 characters.");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload or add at least one property photo.");
      return;
    }

    const primaryCover = (featuredImage || images[0]).trim();
    const finalImages = [primaryCover, ...images.filter((img) => img !== primaryCover)];

    const payload = {
      title: title.trim(),
      type: propertyType,
      roomType,
      location: {
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        address: address.trim() || `${neighborhood.trim()}, ${city.trim()}`,
      },
      rent: Number(rent),
      serviceCharge: Number(serviceCharge) || 0,
      securityDeposit: Number(securityDeposit) || Number(rent),
      bedrooms: Number(bedrooms) || 1,
      bathrooms: Number(bathrooms) || 1,
      balconies: Number(balconies) || 0,
      seatsAvailable: Number(seatsAvailable) || 1,
      facilities,
      availability,
      genderPreference,
      tenantType,
      featuredImage: primaryCover,
      images: finalImages,
      description: description.trim(),
    };

    setIsSubmitting(true);
    try {
      const targetId = initialData?.id || initialData?._id;
      const url = isEdit ? `/api/properties/${targetId}` : "/api/properties";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save property listing.");
      }

      toast.success(
        isEdit
          ? "Listing updated successfully! Resubmitted for safety inspection."
          : "Listing submitted! Saved as pending admin verification."
      );

      onSuccess(data.data);
      onClose();
    } catch (err) {
      console.error("Save listing error:", err);
      toast.error(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypeOptions: AppSelectOption[] = [
    { value: "room", label: "Single Room (Sublet/Hostel)" },
    { value: "flat", label: "Full Apartment / Flat" },
    { value: "mess", label: "Bachelor Mess Seat" },
    { value: "hostel", label: "Student Hostel Seat" },
  ];

  const roomTypeOptions: AppSelectOption[] = [
    { value: "single", label: "Single Private Room" },
    { value: "master", label: "Master Bed (Attached Bath)" },
    { value: "shared", label: "Shared Room / Seat" },
    { value: "entire_flat", label: "Entire Flat / House" },
  ];

  const genderOptions: AppSelectOption[] = [
    { value: "any", label: "Anyone (Co-ed / Family / Students)" },
    { value: "male_only", label: "Male Students Only" },
    { value: "female_only", label: "Female Students Only" },
    { value: "family_only", label: "Family Only" },
  ];

  const tenantTypeOptions: AppSelectOption[] = [
    { value: "students", label: "University Students" },
    { value: "bachelors", label: "Bachelors / Job Holders" },
    { value: "family", label: "Family Residents" },
    { value: "any", label: "Any Tenant" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-card border border-border rounded-xs shadow-xl max-w-2xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xs bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">
                {isEdit ? "Edit Accommodation Listing" : "Create New Property Listing"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "Updates are automatically queued for admin safety review."
                  : "Listings undergo verification before receiving the trust badge."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm">
          {/* Section 1: Title & Classification */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Basic Listing Information</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Listing Title <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Furnished Master Bed near East West University, Banasree"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Property Type <span className="text-destructive">*</span>
                </label>
                <AppSelect
                  value={propertyType}
                  options={propertyTypeOptions}
                  onValueChange={(val) => setPropertyType(val as PropertyType)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Room Configuration <span className="text-destructive">*</span>
                </label>
                <AppSelect
                  value={roomType}
                  options={roomTypeOptions}
                  onValueChange={(val) =>
                    setRoomType(val as "single" | "shared" | "master" | "entire_flat")
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Accommodation Description <span className="text-destructive">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe room condition, natural light, floor, window grills, security gates, distance to universities, and tenant rules..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                required
              />
            </div>
          </div>

          {/* Section 2: Location & Rental Pricing */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>2. Location & Rental Rates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Neighborhood / Area <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g. Block C, Banasree or Mirpur 2"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  City <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Dhaka or Bogura"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Street Address / House & Road (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House 24, Road 5, Block C"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Monthly Rent (BDT) <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">৳</span>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value ? Number(e.target.value) : "")}
                    placeholder="7500"
                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Service Charge (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">৳</span>
                  <input
                    type="number"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value ? Number(e.target.value) : "")}
                    placeholder="500"
                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Security Deposit (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">৳</span>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Same as 1 mo rent"
                    className="w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-xs border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Room Features & Amenities */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Banknote className="w-3.5 h-3.5" />
              <span>3. Room Features & Tenant Policy</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={1}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={1}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Balconies</label>
                <input
                  type="number"
                  min={0}
                  value={balconies}
                  onChange={(e) => setBalconies(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">Seats Available</label>
                <input
                  type="number"
                  min={1}
                  value={seatsAvailable}
                  onChange={(e) => setSeatsAvailable(Number(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Tenant Gender Preference
                </label>
                <AppSelect
                  value={genderPreference}
                  options={genderOptions}
                  onValueChange={(val) =>
                    setGenderPreference(val as "any" | "male_only" | "female_only" | "family_only")
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Preferred Tenant Group
                </label>
                <AppSelect
                  value={tenantType}
                  options={tenantTypeOptions}
                  onValueChange={(val) =>
                    setTenantType(val as "students" | "bachelors" | "job_holders" | "family" | "any")
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Move-in Availability
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g. Available Now or From 1st of Next Month"
                  className="w-full px-3 py-2 text-xs rounded-xs border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                Available Facilities & Inclusions
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FACILITY_OPTIONS.map((f) => {
                  const isChecked = facilities.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFacility(f.id)}
                      className={`flex items-center gap-2 p-2 rounded-xs border text-left transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-2xs border flex items-center justify-center shrink-0 ${
                          isChecked ? "bg-primary border-primary text-white" : "border-muted-foreground"
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] truncate">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Property Photos & Multi-Image Gallery */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>4. Property Photos & Gallery ({images.length} Attached)</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                High resolution room, washroom, and kitchen photos earn 3x more student inquiries
              </span>
            </div>

            {/* Direct File Upload Dropzone */}
            <label className="relative border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-secondary/20 rounded-xs p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelected}
                disabled={isUploading}
                className="sr-only"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-semibold">Uploading and optimizing photos...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-foreground">
                      Click to browse or drag & drop property photos here
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0.5">
                      Select multiple photos from PC or phone (JPG, PNG, WEBP up to 10MB each)
                    </span>
                  </div>
                </>
              )}
            </label>

            {/* Gallery Grid (Thumbnails with Cover Badge, Set Cover, and Delete Actions) */}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Attached Photo Gallery:</span>
                  <span className="text-muted-foreground text-[11px]">
                    Click &ldquo;Make Cover&rdquo; to choose the primary listing card photo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => {
                    const isCover = imgUrl === featuredImage || (!featuredImage && idx === 0);
                    return (
                      <div
                        key={`${imgUrl}-${idx}`}
                        className={`group relative rounded-xs border overflow-hidden bg-background shadow-2xs transition-all ${
                          isCover
                            ? "border-primary ring-2 ring-primary/40 shadow-xs"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`Property photo ${idx + 1}`}
                          className="w-full h-24 object-cover"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                          {isCover ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-primary text-primary-foreground shadow-xs pointer-events-auto">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Cover</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-xs text-[9px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs">
                              #{idx + 1}
                            </span>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            className="w-6 h-6 rounded-xs bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center transition-opacity pointer-events-auto shadow-xs cursor-pointer"
                            title="Remove this photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom Action Bar */}
                        {!isCover && (
                          <div className="p-1.5 bg-background border-t border-border flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleSetCover(imgUrl)}
                              className="w-full py-1 text-[10px] font-semibold text-primary hover:text-primary-foreground hover:bg-primary rounded-xs transition-colors cursor-pointer border border-primary/20 flex items-center justify-center gap-1"
                            >
                              <Star className="w-3 h-3" />
                              <span>Make Cover</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Secondary Actions: Add via URL & Quick Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowUrlInput((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{showUrlInput ? "Hide Web URL input" : "+ Add photo by Web URL"}</span>
                </button>
              </div>

              <span className="text-[11px] text-muted-foreground">
                Or select room presets below to add quickly:
              </span>
            </div>

            {/* Collapsible Web URL Input */}
            {showUrlInput && (
              <div className="p-3 rounded-xs border border-border bg-secondary/20 flex items-center gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://i.imgur.com/..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xs border border-border bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xs hover:bg-primary-dark transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add URL</span>
                </button>
              </div>
            )}

            {/* Quick Sample Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_IMAGES.map((preset) => {
                const isAttached = images.includes(preset.url);
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddPreset(preset.url)}
                    className={`p-1.5 rounded-xs border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isAttached
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-background hover:bg-secondary/40"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-14 object-cover rounded-2xs"
                    />
                    <div className="flex items-center justify-between w-full px-0.5">
                      <span className="text-[10px] font-medium text-foreground truncate text-left">
                        {preset.label}
                      </span>
                      {isAttached && (
                        <Check className="w-3 h-3 text-primary shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Verification Notice */}
            <div className="p-3 bg-secondary/50 border border-border rounded-xs flex items-start gap-2.5 text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>
                Newly submitted listings enter <strong className="text-foreground">Pending Inspection</strong> status. The SmartRent BD safety team verifies photos against reported location before issuing the Verified badge and publishing to public search.
              </p>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary rounded-xs border border-border transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Listing...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Listing" : "Submit Listing"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
