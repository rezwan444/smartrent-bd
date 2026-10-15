"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAiViolationByIdQuery } from "@/redux/api/ai-violation/aiViolationApi";
import { formatStatusText } from "@/utils/formatStatusText";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Icons } from "@/utils/icons";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  violationId: string | null;
}

const AIViolationDetailsModal = ({ open, onOpenChange, violationId }: Props) => {
  const { data: response, isLoading, refetch } = useGetAiViolationByIdQuery(
    violationId || "",
    { skip: !violationId }
  );

  useEffect(() => {
    if (open && violationId) {
      refetch();
    }
  }, [open, violationId, refetch]);

  const [imgError, setImgError] = useState(false);

  const violation = response?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card border border-white/20 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Violation Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full bg-white/10" />
            <Skeleton className="h-40 w-full bg-white/10" />
          </div>
        ) : !violation ? (
          <div className="py-10 text-center text-muted-foreground">
            {violationId ? "Failed to load details" : "No violation selected"}
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* USER & TEAM */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-2 tracking-wider">Reporter</p>
                <div className="flex items-center gap-3">
                  <Image
                    src={"https://i.pravatar.cc/40?img=12"}
                    alt={violation.reporter?.firstName || "User"}
                    width={40}
                    height={40}
                    draggable={false}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-foreground">
                      {violation.reporter?.firstName} {violation.reporter?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {violation.reporter?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase mb-2 tracking-wider">Team</p>
                <div className="flex items-center justify-end gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {violation.team?.mascot || "No Team"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {violation.team?.region ? formatStatusText(violation.team.region) : "-"}
                    </p>
                  </div>
                  <Image
                    src={violation.team?.logoUrl || "/team.png"}
                    alt={violation.team?.mascot || "Team"}
                    width={40}
                    height={40}
                    draggable={false}
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-4 text-sm bg-white/5 p-4 rounded-lg">
              <div>
                <p className="text-muted-foreground mb-1">Date Reported</p>
                <p className="font-medium">
                  {format(new Date(violation.createdAt), "MMM dd, yyyy - hh:mm a")}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <Badge variant={violation.status === "COMPLETED" ? "default" : "outline"} className={violation.status === "COMPLETED" ? "bg-green-500/20 text-green-400 border-green-500/20 hover:bg-green-500/30" : "text-yellow-400 border-yellow-500/30"}>
                  {formatStatusText(violation.status)}
                </Badge>
              </div>
              
              <div className="col-span-2 mt-2">
                <p className="text-muted-foreground mb-1">Reporter Note</p>
                <p className="text-foreground leading-relaxed bg-black/20 p-3 rounded-md border border-white/5">
                  {violation.note || "No notes provided."}
                </p>
              </div>
            </div>

            {/* IMAGE */}
            <div>
              <p className="text-xs text-muted-foreground uppercase mb-2 tracking-wider">Screenshot Evidence</p>
              <div className="relative w-full h-64 overflow-hidden rounded-lg border border-white/10 bg-black/40 flex flex-col items-center justify-center">
                {!imgError && violation.screenshotUrl ? (
                  <Image
                    src={violation.screenshotUrl}
                    alt="Match evidence"
                    fill
                    draggable={false}
                    className="object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Icons.Image className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">Image not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIViolationDetailsModal;
