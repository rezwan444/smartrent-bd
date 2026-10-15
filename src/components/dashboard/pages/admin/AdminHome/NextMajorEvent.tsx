import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils";
import { Clock, Calendar } from "lucide-react";

interface NextMajorEventProps {
  title: string;
  eventName: string;
  dateText: string;
  isLoading?: boolean;
  className?: string;
}

const NextMajorEvent = ({
  title,
  eventName,
  dateText,
  isLoading,
  className,
}: NextMajorEventProps) => {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/20",
        "bg-linear-to-b from-[#0e1116] to-[#090b0f]",
        "px-6 py-5",
        className,
      )}
      aria-busy={isLoading || undefined}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-white/10 p-2 border border-white/5">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-6 w-40 mt-1 bg-white/10" />
            ) : (
              <p className="text-lg font-semibold text-white">{eventName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-1.5 border border-white/5 mt-3 sm:mt-0">
          <Clock className="h-4 w-4 text-primary" />
          {isLoading ? (
            <Skeleton className="h-4 w-32 bg-white/10" />
          ) : (
            <p className="text-sm font-medium text-white">{dateText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextMajorEvent;
