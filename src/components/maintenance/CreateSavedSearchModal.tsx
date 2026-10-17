"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppSelect } from "@/components/shared/AppSelect";
import { AppCheckbox } from "@/components/shared/AppCheckbox";
import { SavedSearchCriteria } from "@/types/savedSearch";
import { PropertyType } from "@/types/property";
import { Bell, AlertCircle } from "lucide-react";

interface CreateSavedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (savedSearch: SavedSearchCriteria) => void;
}

const PROPERTY_TYPES = [
  { value: "all", label: "Any Property Type" },
  { value: "mess", label: "Mess Seat (Shared Hostel)" },
  { value: "room", label: "Single / Shared Room" },
  { value: "flat", label: "Full Apartment / Flat" },
  { value: "hostel", label: "Student Hostel" },
];

const GENDER_PREFERENCES = [
  { value: "any", label: "Any Gender Policy" },
  { value: "male_only", label: "Male Students / Bachelors Only" },
  { value: "female_only", label: "Female Students Only" },
  { value: "family_only", label: "Family Flat" },
];

interface SavedSearchFormContentProps {
  onClose: () => void;
  onSubmit: (savedSearch: SavedSearchCriteria) => void;
}

function SavedSearchFormContent({
  onClose,
  onSubmit,
}: SavedSearchFormContentProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("Nilkhet");
  const [propertyType, setPropertyType] = useState<PropertyType | "all">("mess");
  const [maxBudget, setMaxBudget] = useState("6500");
  const [genderPreference, setGenderPreference] = useState<
    "any" | "male_only" | "female_only" | "family_only"
  >("male_only");
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter a name for this saved search.");
      return;
    }

    if (!location.trim()) {
      setErrorMessage("Please specify your preferred area or campus location.");
      return;
    }

    const parsedBudget = maxBudget ? parseFloat(maxBudget) : null;
    if (parsedBudget !== null && (isNaN(parsedBudget) || parsedBudget <= 0)) {
      setErrorMessage("Please enter a valid maximum budget amount.");
      return;
    }

    const payload: SavedSearchCriteria = {
      id: `search-${Date.now()}`,
      title: title.trim(),
      location: location.trim(),
      propertyType,
      maxBudget: parsedBudget,
      genderPreference,
      facilities: ["wifi"],
      notifyInApp,
      notifyEmail,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <>
      {/* 1. Fixed Header */}
      <DialogHeader className="shrink-0 p-4 sm:p-5 border-b border-border bg-secondary/30 pr-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              Save Search & Listing Alerts
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              Receive automatic alerts whenever a landlord posts a matching room.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* 2. Form with Scrollable Body and Fixed Footer */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          {errorMessage && (
            <div className="p-3 rounded-xs bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="search-title" className="text-xs font-semibold">
              Alert Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="search-title"
              placeholder="e.g. DU Nilkhet Mess Seat under ৳ 6.5k"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="search-loc" className="text-xs font-semibold">
                Preferred Location / Campus <span className="text-destructive">*</span>
              </Label>
              <Input
                id="search-loc"
                placeholder="e.g. Nilkhet, Banasree, Bogura"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="search-budget" className="text-xs font-semibold">
                Max Monthly Budget (৳ BDT)
              </Label>
              <Input
                id="search-budget"
                type="number"
                min="1000"
                step="500"
                placeholder="e.g. 7000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Property Type</Label>
              <AppSelect
                value={propertyType}
                onValueChange={(val) => setPropertyType(val as PropertyType | "all")}
                options={PROPERTY_TYPES}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Gender Policy</Label>
              <AppSelect
                value={genderPreference}
                onValueChange={(val) =>
                  setGenderPreference(
                    val as "any" | "male_only" | "female_only" | "family_only"
                  )
                }
                options={GENDER_PREFERENCES}
                triggerClassName="h-10 text-xs"
              />
            </div>
          </div>

          {/* Alert Channel Checkboxes */}
          <div className="space-y-2 pt-1">
            <Label className="text-xs font-semibold">Notification Channels</Label>
            <div className="space-y-2.5 p-3 bg-muted/40 rounded-xs border border-border">
              <AppCheckbox
                id="notify-inapp"
                checked={notifyInApp}
                onCheckedChange={setNotifyInApp}
                label="Instant In-App Alerts"
                description="Surface alert cards and unread badge on Student Portal dashboard"
              />
              <AppCheckbox
                id="notify-email"
                checked={notifyEmail}
                onCheckedChange={setNotifyEmail}
                label="Simulated Email / SMS Digest"
                description="Notify when verified landlords list rooms matching this criteria"
              />
            </div>
          </div>
        </div>

        {/* 3. Fixed Footer */}
        <DialogFooter className="shrink-0 p-3.5 sm:p-4 border-t border-border bg-secondary/30 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
          >
            Save Search & Activate Alerts
          </button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CreateSavedSearchModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateSavedSearchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] p-0 flex flex-col rounded-xs bg-card border border-border shadow-2xl overflow-hidden">
        {isOpen && (
          <SavedSearchFormContent
            key={isOpen ? "open-search" : "closed-search"}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
