"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AppSelectOption {
  value: string;
  label: string;
  secondaryLabel?: string;
}

export interface AppSelectProps {
  id?: string;
  value: string;
  onValueChange: (val: string) => void;
  options: AppSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function AppSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder = "নির্বাচন করুন",
  className,
  triggerClassName,
  contentClassName,
  disabled = false,
}: AppSelectProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className={cn(
            "h-11 w-full bg-background border-border text-foreground text-sm rounded-xs transition-colors hover:border-primary/40 focus:ring-2 focus:ring-ring",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "bg-popover border border-border rounded-xs shadow-lg min-w-[12rem] z-50",
            contentClassName
          )}
        >
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center justify-between w-full gap-3">
                <span className="font-medium text-foreground">{opt.label}</span>
                {opt.secondaryLabel && (
                  <span className="text-xs text-muted-foreground">
                    {opt.secondaryLabel}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
