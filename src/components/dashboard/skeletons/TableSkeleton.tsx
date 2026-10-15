import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
}

const TableSkeleton = ({ columns = 6, rows = 8 }: TableSkeletonProps) => {
  return (
    <div className="rounded-xl border border-white/20 overflow-x-auto w-full">
      <table className="w-full text-sm">
        <thead className="bg-black/40">
          <tr className="text-left border-b border-white/10">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-4">
                <Skeleton className="h-4 w-20 bg-white/10" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-white/10 hover:bg-white/5 transition-colors"
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-4">
                  <Skeleton
                    className={`h-4 bg-white/10 ${
                      colIndex === 0
                        ? "w-32"
                        : colIndex === columns - 1
                        ? "w-8 ml-auto"
                        : "w-24"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
