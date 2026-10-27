"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CleanlinessStandard,
  FoodPreference,
  GuestPolicy,
  SleepSchedule,
  SmokingHabit,
  StudyEnvironment,
  UserPreferencesProfile,
} from "@/types/roommate";
import {
  Sparkles,
  SlidersHorizontal,
  GraduationCap,
  Sun,
  Moon,
  Utensils,
  VolumeX,
  Coffee,
  Users,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface RoommatePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserPreferencesProfile;
  onSavePreferences: (updated: UserPreferencesProfile) => void;
}

export function RoommatePreferencesModal({
  isOpen,
  onClose,
  userProfile,
  onSavePreferences,
}: RoommatePreferencesModalProps) {
  const [formData, setFormData] = useState<UserPreferencesProfile>({
    ...userProfile,
    lifestyle: { ...userProfile.lifestyle },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(formData);
    toast.success("Preferences saved! Roommate match scores recalculated.");
    onClose();
  };

  const updateLifestyle = <K extends keyof UserPreferencesProfile["lifestyle"]>(
    key: K,
    val: UserPreferencesProfile["lifestyle"][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [key]: val,
      },
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-2xl md:max-w-3xl max-h-[90dvh] sm:max-h-[86vh] p-0 flex flex-col rounded-xs bg-card border border-border shadow-2xl overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="shrink-0 p-4 sm:p-5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base md:text-lg font-bold text-foreground font-heading truncate">
                Customize Habits & Baseline Preferences
              </DialogTitle>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
                Adjust your routine and budget to recalculate compatibility scores in real-time.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form Container with Scrollable Body and Fixed Footer */}
        <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Options Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
            {/* Section 1: Academic & Budget Info */}
            <div className="bg-secondary/30 border border-border rounded-xs p-3.5 sm:p-4.5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Profile & Budget</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pref-name" className="text-[11px] font-medium text-foreground">
                    Your Full Name
                  </Label>
                  <Input
                    id="pref-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-xs rounded-xs bg-background border-border"
                    placeholder="e.g. Rayhan Ahmed"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pref-uni" className="text-[11px] font-medium text-foreground">
                    University / College
                  </Label>
                  <Input
                    id="pref-uni"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    className="h-9 text-xs rounded-xs bg-background border-border"
                    placeholder="e.g. Pundro University (PUB) or DU"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pref-dept" className="text-[11px] font-medium text-foreground">
                    Department / Major
                  </Label>
                  <Input
                    id="pref-dept"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-9 text-xs rounded-xs bg-background border-border"
                    placeholder="e.g. CSE"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="pref-budget" className="text-[11px] font-medium text-foreground">
                    Seat Budget (BDT / mo)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground pointer-events-none">
                      ৳
                    </span>
                    <Input
                      id="pref-budget"
                      type="number"
                      min={2000}
                      max={25000}
                      step={500}
                      value={formData.maxBudget}
                      onChange={(e) =>
                        setFormData({ ...formData, maxBudget: Number(e.target.value) || 5000 })
                      }
                      className="pl-7 h-9 text-xs font-semibold rounded-xs bg-background border-border"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Lifestyle Habits & Routine */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Daily Living Routines</span>
                </h4>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Tap to update your comparison preferences
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. Sleep Schedule */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-primary" /> Sleep & Waking Routine
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "early_bird" as SleepSchedule,
                        label: "Early Bird",
                        desc: "Sleeps before 11 PM",
                        icon: Sun,
                      },
                      {
                        id: "moderate" as SleepSchedule,
                        label: "Moderate",
                        desc: "11 PM – 1 AM routine",
                        icon: Moon,
                      },
                      {
                        id: "night_owl" as SleepSchedule,
                        label: "Night Owl",
                        desc: "Stays up after 1 AM",
                        icon: Sparkles,
                      },
                    ].map((opt) => {
                      const isSelected = formData.lifestyle.sleepSchedule === opt.id;
                      const Icon = opt.icon;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => updateLifestyle("sleepSchedule", opt.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xs border text-left transition-all min-h-[44px] cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                              : "bg-background hover:bg-secondary/60 text-foreground border-border"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xs flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-secondary text-primary"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">
                              {opt.label}
                            </p>
                            <p
                              className={`text-[10px] truncate ${
                                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}
                            >
                              {opt.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Smoking Policy */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground block">
                    Smoking Policy
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "non_smoker" as SmokingHabit,
                        label: "Strict Non-Smoker",
                        desc: "100% Smoke-free flat",
                      },
                      {
                        id: "outside_only" as SmokingHabit,
                        label: "Outside / Balcony",
                        desc: "No smoking inside room",
                      },
                      {
                        id: "smoker" as SmokingHabit,
                        label: "Smoker",
                        desc: "Smoker friendly",
                      },
                    ].map((opt) => {
                      const isSelected = formData.lifestyle.smokingHabit === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => updateLifestyle("smokingHabit", opt.id)}
                          className={`p-2.5 rounded-xs border text-left transition-all min-h-[44px] cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                              : "bg-background hover:bg-secondary/60 text-foreground border-border"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold truncate leading-tight">
                              {opt.label}
                            </p>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                          </div>
                          <p
                            className={`text-[10px] mt-0.5 truncate ${
                              isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Study Environment */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-primary" /> Study Environment
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        id: "silent" as StudyEnvironment,
                        label: "Library Quiet",
                        icon: VolumeX,
                      },
                      {
                        id: "ambient_music" as StudyEnvironment,
                        label: "Soft Ambient",
                        icon: Coffee,
                      },
                      {
                        id: "group_friendly" as StudyEnvironment,
                        label: "Group Study",
                        icon: Users,
                      },
                      {
                        id: "flexible" as StudyEnvironment,
                        label: "Flexible",
                        icon: Sparkles,
                      },
                    ].map((opt) => {
                      const isSelected = formData.lifestyle.studyEnvironment === opt.id;
                      const Icon = opt.icon;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => updateLifestyle("studyEnvironment", opt.id)}
                          className={`flex items-center gap-2 p-2 rounded-xs border text-left transition-all min-h-[40px] cursor-pointer ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                              : "bg-background hover:bg-secondary/60 text-foreground border-border"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Cleanliness & Food Arrangement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cleanliness */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-foreground block">
                      Cleanliness Standard
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "strict" as CleanlinessStandard, label: "Strict Daily" },
                        { id: "moderate" as CleanlinessStandard, label: "Weekly Tidy" },
                        { id: "relaxed" as CleanlinessStandard, label: "Relaxed" },
                      ].map((opt) => {
                        const isSelected = formData.lifestyle.cleanliness === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => updateLifestyle("cleanliness", opt.id)}
                            className={`py-2 px-1 text-center rounded-xs border text-[11px] sm:text-xs transition-all min-h-[38px] cursor-pointer truncate ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                                : "bg-background hover:bg-secondary/60 text-foreground border-border"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Food Arrangement */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-primary" /> Food Arrangement
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "mess_system" as FoodPreference, label: "Mess System" },
                        { id: "cook_myself" as FoodPreference, label: "Cook Myself" },
                        { id: "veg_only" as FoodPreference, label: "Veg / Halal" },
                        { id: "flexible" as FoodPreference, label: "Flexible" },
                      ].map((opt) => {
                        const isSelected = formData.lifestyle.foodPreference === opt.id;
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            onClick={() => updateLifestyle("foodPreference", opt.id)}
                            className={`py-2 px-2 text-center rounded-xs border text-[11px] sm:text-xs transition-all min-h-[38px] cursor-pointer truncate ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                                : "bg-background hover:bg-secondary/60 text-foreground border-border"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 5. Guest Policy */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-foreground block">
                    Guest Policy
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "no_guests" as GuestPolicy, label: "No Guests" },
                      { id: "daytime_only" as GuestPolicy, label: "Daytime Only" },
                      { id: "advance_notice" as GuestPolicy, label: "With Notice" },
                      { id: "flexible" as GuestPolicy, label: "Flexible" },
                    ].map((opt) => {
                      const isSelected = formData.lifestyle.guestPolicy === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => updateLifestyle("guestPolicy", opt.id)}
                          className={`py-2 px-2 text-center rounded-xs border text-xs transition-all min-h-[38px] cursor-pointer truncate ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-2xs font-bold"
                              : "bg-background hover:bg-secondary/60 text-foreground border-border"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer with Live Summary & Action Buttons */}
          <div className="shrink-0 p-3.5 sm:p-4 border-t border-border bg-card/98 backdrop-blur-xs flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground hidden sm:block truncate">
              <span className="font-medium text-foreground">Active Preview:</span>{" "}
              {formData.name || "Student"} • ৳{formData.maxBudget.toLocaleString()} BDT/mo
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary rounded-xs border border-border transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary-dark rounded-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Recalculate</span>
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
