"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface AppCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function AppCheckbox({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: AppCheckboxProps) {
  return (
    <div className={cn("flex items-start gap-2.5 select-none", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(Boolean(val))}
        disabled={disabled}
        className="mt-0.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-xs"
      />
      <label
        htmlFor={id}
        className={cn(
          "text-xs font-medium text-foreground cursor-pointer leading-normal",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span>{label}</span>
        {description && (
          <span className="block text-[11px] text-muted-foreground mt-0.5">
            {description}
          </span>
        )}
      </label>
    </div>
  );
}
