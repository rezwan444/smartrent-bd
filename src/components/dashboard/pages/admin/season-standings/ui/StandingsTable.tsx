"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { getInitials } from "@/utils/nameTrim";
import { formatStatusText } from "@/utils/formatStatusText";
import { Skeleton } from "@/components/ui/skeleton";

export const StandingsTableSkeleton = ({ isPlayoff = false }: { isPlayoff?: boolean }) => {
  const rowCount = isPlayoff ? 2 : 5;
  return (
    <div className="overflow-x-auto rounded-xl border border-primary-dark">
      <table className="min-w-225 w-full text-sm">
        <thead className="bg-linear-to-r from-destructive to-black text-white">
          <tr className="">
            {[
              "Rank",
              "Team",
              ...(isPlayoff ? [] : ["Played", "Win", "Lost", "Draw"]),
              isPlayoff ? "Score" : "Total Points",
              "Winning Amount",
            ].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, i) => (
            <tr key={i} className="my-6 border border-primary-dark">
              <td className="px-4 py-3"><Skeleton className="h-4 w-4 bg-primary-dark" /></td>
              <td className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-6 w-6 rounded-full bg-primary-dark" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-primary-dark" />
                  <Skeleton className="h-3 w-16 bg-primary-dark" />
                </div>
              </td>
              {!isPlayoff && (
                <>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-6 bg-primary-dark" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-6 bg-primary-dark" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-6 bg-primary-dark" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-6 bg-primary-dark" /></td>
                </>
              )}
              <td className="px-4 py-3"><Skeleton className="h-4 w-8 bg-primary-dark" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-12 bg-primary-dark" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TeamLogo = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className="h-6 w-6 rounded-full bg-destructive flex items-center justify-center text-[8px] font-bold text-white shrink-0 overflow-hidden text-center leading-none">
        {getInitials(alt)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={20}
      height={20}
      draggable={false}
      onError={() => setError(true)}
      className="h-6 w-6 rounded-full bg-white object-cover"
    />
  );
};

const StandingsTable = ({
  data,
  isPlayoff = false,
}: {
  data: any[];
  isPlayoff?: boolean;
}) => {
  if (data.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No standings available for this region.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-primary-dark">
      <table className="min-w-225 w-full text-sm">
        <thead className="bg-linear-to-r from-destructive to-black text-white">
          <tr className="">
            {[
              "Rank",
              "Team",
              ...(isPlayoff ? [] : ["Played", "Win", "Lost", "Draw"]),
              isPlayoff ? "Score" : "Total Points",
              "Winning Amount",
            ].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <motion.tbody
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {data.map((row, index) => (
            <motion.tr
              variants={{
                hidden: { opacity: 0, x: -10 },
                show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
              }}
              key={`${row.team.id}-${row.rank}-${index}`}
              className="my-6 border border-primary-dark hover:bg-primary-dark/40"
            >
              <td className="px-4 py-3">{row.rank}</td>

              <td className="flex items-center gap-3">
                <TeamLogo src={row.team.logo} alt={row.team.name} />

                <div className="pt-1">
                  {/* <div className="font-medium">{row.team.name}</div> */}
                  <div className="font-medium flex items-center gap-1">
                    {row.team.name}
                    {row.isWinner && (
                      <span className="text-yellow-400">👑</span>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {formatStatusText(row.team.tier)}
                  </div>
                </div>
              </td>

              {!isPlayoff && (
                <>
                  <td className="px-4 py-3">{row.played}</td>
                  <td className="px-4 py-3 text-success">{row.win}</td>
                  <td className="px-4 py-3 text-destructive">{row.lost}</td>
                  <td className="px-4 py-3 text-yellow-400">{row.draw}</td>
                </>
              )}
              <td className="px-4 py-3">{row.points}</td>
              <td className="px-4 py-3 font-medium">{row.prize ?? "-"}</td>
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
};

export default StandingsTable;
