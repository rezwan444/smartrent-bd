import { cn } from "@/lib/utils";
import Image from "next/image";

interface SiteBrandProps {
  logo: string;
  name: string;
  description?: string;
  logoSize?: number;
  className?: string;
}

export function SiteBrand({
  logo,
  name,
  description,
  logoSize = 80,
  className,
}: SiteBrandProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src={logo}
        alt="site_logo"
        width={logoSize}
        height={logoSize}
        draggable={false}
        className="overflow-hidden"
      />

      <div className="flex flex-col leading-none">
        <span className="text-left text-sm font-semibold text-foreground tracking-wide">
          {name}
        </span>

        {description && (
          <span className="mt-0.5 text-[0.73rem] font-medium text-muted-foreground">
            {description}
          </span>
        )}
      </div>
    </div>
  );
}
