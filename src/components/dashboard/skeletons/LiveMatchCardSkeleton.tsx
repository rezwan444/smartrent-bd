import { Skeleton } from "@/components/ui/skeleton";

export default function LiveMatchCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 bg-primary-dark p-4 h-full min-h-[300px] flex flex-col justify-between space-y-4">
      <div className="space-y-4">
        {/* Header - Game Time and Status */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32 bg-white/10" />
          <Skeleton className="h-6 w-16 rounded-md bg-white/10" />
        </div>

        {/* Teams Matchup */}
        <div className="flex justify-between items-center bg-card/30 rounded-lg p-3 border border-white/5">
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
          <div className="text-xl font-bold text-white/20">VS</div>
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-12 w-12 rounded-full bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
            <Skeleton className="h-3 w-16 bg-white/10" />
          </div>
        </div>

        {/* Extra info (stream key/url) */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-4/5 bg-white/10" />
        </div>
      </div>
      
      {/* Action Button */}
      <Skeleton className="h-11 w-full rounded-md bg-white/10 mt-4" />
    </div>
  );
}
