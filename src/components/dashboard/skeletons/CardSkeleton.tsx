import { Skeleton } from "@/components/ui/skeleton";

const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-white/10 bg-primary-dark p-4 h-full min-h-[330px] flex flex-col justify-between">
      <div>
        {/* HEADER */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 bg-white/10" />
              <span className="text-white/20">•</span>
              <Skeleton className="h-3 w-20 bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-md bg-white/10" />
        </div>

        {/* DETAILS */}
        <div className="space-y-3 mt-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-12 bg-white/10" />
            <Skeleton className="h-4 w-24 bg-white/10" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-10 bg-white/10" />
            <Skeleton className="h-4 w-20 bg-white/10" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-14 bg-white/10" />
            <Skeleton className="h-6 w-16 rounded-md bg-white/10" />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-6 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-11 w-full rounded-md bg-white/10" />
          <Skeleton className="h-11 w-full rounded-md bg-white/10" />
        </div>
        <Skeleton className="h-11 w-full rounded-md bg-white/10" />
      </div>
    </div>
  );
};

export default CardSkeleton;
