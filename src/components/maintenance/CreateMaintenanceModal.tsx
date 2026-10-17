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
import {
  MaintenanceRequest,
  MaintenanceCategory,
  MaintenanceUrgency,
} from "@/types/maintenance";
import { Wrench, AlertCircle } from "lucide-react";

interface CreateMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: MaintenanceRequest) => void;
}

const CATEGORY_OPTIONS = [
  { value: "plumbing", label: "Plumbing / Water Tap / Washroom" },
  { value: "electrical", label: "Electrical / Wiring / Light / Fan" },
  { value: "wifi", label: "Fiber Internet / Router / Connection" },
  { value: "gas", label: "LP Gas / Stove / Cylinder Regulator" },
  { value: "structural", label: "Door Lock / Window / Balcony Grill" },
  { value: "cleaning", label: "Waste Disposal / Drain Cleaning" },
  { value: "other", label: "Other Common Flat Issue" },
];

const URGENCY_OPTIONS = [
  { value: "low", label: "Low — Minor issue, can be addressed during routine visit" },
  { value: "medium", label: "Medium — Needs resolution within 2–3 days" },
  { value: "high", label: "High — Urgent (Affects daily cooking/study/sanitation)" },
  { value: "emergency", label: "Emergency — Gas leak / short circuit / water overflow" },
];

interface MaintenanceFormContentProps {
  onClose: () => void;
  onSubmit: (request: MaintenanceRequest) => void;
}

function MaintenanceFormContent({
  onClose,
  onSubmit,
}: MaintenanceFormContentProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MaintenanceCategory>("plumbing");
  const [urgency, setUrgency] = useState<MaintenanceUrgency>("medium");
  const [roomNumber, setRoomNumber] = useState("Padma Flat 4B (Common Area)");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter a short request summary.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Please describe the maintenance problem in detail.");
      return;
    }

    const newRequest: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      tenantId: "demo-student-01",
      tenantName: "Rayhan Ahmed",
      tenantPhone: "+880 1712-345678",
      propertyId: "prop-01",
      propertyTitle: "Padma Nilkhet Student Flat - 4B",
      roomNumber: roomNumber.trim() || undefined,
      category,
      urgency,
      title: title.trim(),
      description: description.trim(),
      status: "pending",
      createdAt: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }),
      updatedAt: "Just now",
      ownerNotes: "Request submitted to landlord/caretaker queue.",
    };

    onSubmit(newRequest);
    onClose();
  };

  return (
    <>
      {/* 1. Fixed Header */}
      <DialogHeader className="shrink-0 p-4 sm:p-5 border-b border-border bg-secondary/30 pr-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <Wrench className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
              Submit Flat Maintenance Request
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate">
              Notify property owner and caretaker of repairs or utility breakdowns.
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
            <Label htmlFor="maint-title" className="text-xs font-semibold">
              Issue Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maint-title"
              placeholder="e.g. Washbasin tap leakage, Gas cylinder odor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Issue Category</Label>
              <AppSelect
                value={category}
                onValueChange={(val) => setCategory(val as MaintenanceCategory)}
                options={CATEGORY_OPTIONS}
                triggerClassName="h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Urgency Level</Label>
              <AppSelect
                value={urgency}
                onValueChange={(val) => setUrgency(val as MaintenanceUrgency)}
                options={URGENCY_OPTIONS}
                triggerClassName="h-10 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maint-location" className="text-xs font-semibold">
              Location in Flat / Room
            </Label>
            <Input
              id="maint-location"
              placeholder="e.g. Master Bedroom, Kitchen, Common Corridor"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="maint-description" className="text-xs font-semibold">
              Problem Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="maint-description"
              rows={3}
              placeholder="Explain what happened, since when, and any immediate hazards..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xs border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring resize-none"
            />
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
            Submit Request
          </button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CreateMaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateMaintenanceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] p-0 flex flex-col rounded-xs bg-card border border-border shadow-2xl overflow-hidden">
        {isOpen && (
          <MaintenanceFormContent
            key={isOpen ? "open-maint" : "closed-maint"}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
