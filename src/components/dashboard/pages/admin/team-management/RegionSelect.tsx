"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IRegion } from "@/types/global";
import { REGIONS } from "./data";

type Props = {
  value: IRegion | "ALL";
  onChange: (value: IRegion | "ALL") => void;
};

export default function RegionSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full md:w-55 border border-muted-foreground/50 bg-primary text-muted-foreground hover:cursor-pointer">
        <SelectValue placeholder="All Regions" />
      </SelectTrigger>

      <SelectContent className="max-h-75 border bg-primary text-muted-foreground">
        {REGIONS.map((region) => (
          <SelectItem
            key={region.value}
            value={region.value}
            className="border-b bg-primary"
          >
            {region.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
