"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Eye, Play } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { IStreamingApproval } from "../data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IStreamingApproval | null;
}

const StreamingPreviewModal = ({ open, onOpenChange, data }: Props) => {
  if (!data) return null;

  const handleApprove = () => {
    toast.success("Streaming approved", {
      description: `${data.gamertag} has been approved`,
    });
    onOpenChange(false);
  };

  const handleReject = () => {
    toast.error("Streaming rejected", {
      description: `${data.gamertag} has been rejected`,
    });
    onOpenChange(false);
  };

  const handleOpenDetails = () => {
    onOpenChange(false);
    toast.info("Streaming details", {
      description: `${data.gamertag} details`,
    });
    // router.push(`/admin/streaming/${data.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-primary border max-h-[90dvh] overflow-y-auto">
        <DialogTitle className="p-3">Streaming Preview</DialogTitle>
        <div className="">
          {/* ================= VIDEO PREVIEW ================= */}
          <div className="relative w-full h-105 bg-primary">
            <Image
              src="/violation.png"
              alt="Streaming Preview"
              fill
              className="object-cover"
              priority
            />

            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Match info */}
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-semibold text-sm">
                NY Guardians VS Commanders (Division Match)
              </p>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="bg-red-600 px-2 py-0.5 rounded">Live</span>
                <span>605K viewers</span>
              </div>
            </div>
          </div>

          {/* ================= DETAILS ================= */}
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              {/* Player */}
              <div>
                <p className="font-semibold text-white">{data.name}</p>
                <p className="text-xs text-muted-foreground">
                  {data.gamertag} • {data.console}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleOpenDetails}
                  className="hover:cursor-pointer bg-primary-dark hover:bg-primary-foreground  hover:text-foreground"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Full Details
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="hover:cursor-pointer"
                >
                  Reject
                </Button>

                <Button onClick={handleApprove}>Approve</Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreamingPreviewModal;
