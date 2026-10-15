"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITier } from "@/types/global";
import { TIERS } from "./data";

type Props = {
  value: ITier | "ALL";
  onChange: (value: ITier | "ALL") => void;
};

export default function TierSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-55 border border-muted-foreground/50 bg-primary text-muted-foreground hover:cursor-pointer">
        <SelectValue placeholder="All Tiers" />
      </SelectTrigger>

      <SelectContent className="max-h-75 border bg-primary text-muted-foreground">
        {TIERS.map((tier) => (
          <SelectItem
            key={tier.value}
            value={tier.value}
            className="border-b bg-primary"
          >
            {tier.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
