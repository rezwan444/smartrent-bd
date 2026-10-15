"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IFinancialRecentActivity } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { format } from "date-fns";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: IFinancialRecentActivity | null;
}

const ActivityDetailsModal = ({ open, onOpenChange, activity }: Props) => {
  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle>Activity Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* USER */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={activity.user.profilePictureUrl || undefined}
                alt={activity.user.name}
                draggable={false}
                className="object-cover"
              />
              <AvatarFallback className="text-sm bg-white/10 text-white">
                {activity.user.name
                  ? activity.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">
                {activity.user.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.user.email}
              </p>
            </div>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(activity.date), "MMM dd, yyyy")}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Tier</p>
              <p className="font-medium">{formatStatusText(activity.tier)}</p>
            </div>

            <div>
              <p className="text-muted-foreground">Team</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{activity.teamName}</span>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">
                $
                {activity.amount?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Status</p>
              <Badge variant="outline">
                {formatStatusText(activity.status)}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDetailsModal;
