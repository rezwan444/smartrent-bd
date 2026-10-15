"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export default function TeamTierSelect({
  value,
  onChange,
  options,
  placeholder = "Select tier",
  disabled = false,
}: Props) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-10 w-full border border-muted-foreground/50 bg-primary text-muted-foreground hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent className="max-h-75 border bg-primary text-muted-foreground">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="border-b bg-primary"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
