"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IWaitlist } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import dayjs from "dayjs";
import Image from "next/image";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waitlist: IWaitlist | null;
}

const WaitlistDetailsModal = ({ open, onOpenChange, waitlist }: Props) => {
  if (!waitlist) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-white/10">
        <DialogHeader>
          <DialogTitle>Waitlist Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* USER */}
          <div className="flex items-center gap-3">
            <Image
              src={waitlist.user.profileImage ?? "/team.png"}
              alt={`${waitlist.user.firstName} ${waitlist.user.lastName}`}
              width={48}
              height={48}
              className="rounded-full bg-white/10 object-cover"
            />
            <div>
              <p className="font-semibold text-foreground">
                {waitlist.user.firstName} {waitlist.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {waitlist.user.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {waitlist.user.phone}
              </p>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            <div>
              <p className="text-muted-foreground">Position / ID</p>
              <p className="font-medium font-mono text-xs">{waitlist.id}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Applied Date</p>
              <p className="font-medium">
                {dayjs(waitlist.createdAt).format("DD MMM, YYYY hh:mm A")}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Preferred Tier</p>
              <p className="font-medium capitalize">
                {waitlist.preferredTier.toLowerCase()}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Preferred Region</p>
              <p className="font-medium capitalize">
                {waitlist.preferredRegion.toLowerCase()}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-muted-foreground mb-1">Status</p>
              <Badge variant="outline">
                {formatStatusText(waitlist.status as string)}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistDetailsModal;
