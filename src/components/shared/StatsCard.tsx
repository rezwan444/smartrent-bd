"use client";

import { cn } from "@/utils";
import { Icons } from "@/utils/icons";
import { motion } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatsCardProps {
  title: string;
  icon?: keyof typeof Icons;
  value?: string | number;
  valueText?: string;
  iconColor?: string;
  iconBgColor?: string;
  cardClass?: string;
  isLoading?: boolean;
  variant?: "default" | "compact";
}

const StatsCard = ({
  title,
  icon = "Users",
  value,
  valueText,
  iconColor,
  iconBgColor,
  cardClass,
  isLoading,
  variant = "default",
}: StatsCardProps) => {
  const Icon = Icons[icon];
  const hasValue = value !== undefined && value !== null;

  let parsedNum = NaN;
  let prefix = "";
  let suffix = "";
  let decimals = 0;

  if (hasValue) {
    if (typeof value === "number") {
      parsedNum = value;
      decimals = !Number.isInteger(value)
        ? value.toString().split(".")[1]?.length || 0
        : 0;
    } else if (typeof value === "string") {
      const match = value.match(/^([^0-9.-]*)(-?[0-9.]+)(.*)$/);
      if (match) {
        prefix = match[1];
        parsedNum = parseFloat(match[2]);
        suffix = match[3];
        decimals = match[2].includes(".") ? match[2].split(".")[1].length : 0;
      }
    }
  }

  /* ================= COMPACT VARIANT ================= */
  if (variant === "compact") {
    return (
      <motion.div
        className={cn(
          "flex flex-col justify-between gap-4 rounded-xl border border-white/10 hover:border-white/30",
          "bg-linear-to-b from-[#0e1116] to-[#090b0f]",
          "px-6 py-5 transition-colors duration-300",
          cardClass,
        )}
      >
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 bg-white/10" />
            <Skeleton className="h-4 w-40 bg-white/10" />
          </div>
        ) : (
          <>
            <p className="text-3xl font-medium text-white">
              {hasValue ? (
                !isNaN(parsedNum) ? (
                  <AnimatedNumber
                    value={parsedNum}
                    prefix={prefix}
                    suffix={suffix}
                    decimals={decimals}
                  />
                ) : (
                  value
                )
              ) : (
                "--"
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{title}</p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "relative min-w-0 rounded-xl border border-white/10 hover:border-white/30",
        "bg-linear-to-b from-[#0e1116] to-[#090b0f]",
        "px-5 py-4 transition-colors duration-300",
        cardClass,
      )}
      aria-busy={isLoading || undefined}
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between">
        {isLoading ? (
          <>
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-muted-foreground line-clamp-1">
              {title}
            </p>

            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-white/10",
                iconBgColor,
              )}
            >
              <Icon className={cn("h-5 w-5 text-white", iconColor)} />
            </div>
          </>
        )}
      </div>

      {/* ===== VALUE ===== */}
      <div className="mt-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-28 bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
          </div>
        ) : hasValue || valueText ? (
          <>
            <p className="text-2xl font-normal text-white leading-tight">
              {hasValue ? (
                !isNaN(parsedNum) ? (
                  <AnimatedNumber
                    value={parsedNum}
                    prefix={prefix}
                    suffix={suffix}
                    decimals={decimals}
                  />
                ) : (
                  value
                )
              ) : null}
            </p>

            {valueText && (
              <p className="mt-1 text-sm text-muted-foreground">{valueText}</p>
            )}
          </>
        ) : (
          <Skeleton className="h-7 w-28 bg-white/10" />
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
