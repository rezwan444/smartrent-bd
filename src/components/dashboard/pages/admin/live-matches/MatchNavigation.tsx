import { cn } from "@/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MatchNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 mb-6 bg-card/40 p-1.5 rounded-lg border border-white/5 w-fit">
      <Link
        href="/dashboard/admin/live-matches"
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all",
          pathname === "/dashboard/admin/live-matches"
            ? "bg-white/10 text-white shadow-sm"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        Live Matches
      </Link>
      <Link
        href="/dashboard/admin/scheduled-matches"
        className={cn(
          "px-4 py-2 rounded-md text-sm font-medium transition-all",
          pathname === "/dashboard/admin/scheduled-matches"
            ? "bg-white/10 text-white shadow-sm"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )}
      >
        Scheduled Matches
      </Link>
    </div>
  );
}
