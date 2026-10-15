import { cn } from "@/utils";
import { REGIONS, TRegion } from "../constants";

interface Props {
  value: TRegion;
  onChange: (v: TRegion) => void;
}

const RegionFilter = ({ value, onChange }: Props) => {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {REGIONS.map((r) => {
        const active = value === r.key;

        return (
          <button
            key={r.key}
            onClick={() => onChange(r.key)}
            className={cn(
              "whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition",
              active
                ? "bg-destructive text-white"
                : "bg-transparent text-muted-foreground border border-primary-dark hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
};

export default RegionFilter;
