"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateWaitlistStatusMutation } from "@/redux/api/waitlist/waitlistApi";
import { IWaitlistStatusEnum } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waitlistId: string | null;
  statusToUpdate: IWaitlistStatusEnum | null;
}

const UpdateStatusModal = ({
  open,
  onOpenChange,
  waitlistId,
  statusToUpdate,
}: Props) => {
  const [adminNotes, setAdminNotes] = useState("");
  const [updateStatus, { isLoading }] = useUpdateWaitlistStatusMutation();

  const handleSubmit = async () => {
    if (!waitlistId || !statusToUpdate) return;

    try {
      await updateStatus({
        id: waitlistId,
        status: statusToUpdate,
        adminNotes: adminNotes.trim() || undefined,
      }).unwrap();

      toast.success(
        `Waitlist status updated to ${statusToUpdate.toLowerCase()}`,
      );
      onOpenChange(false);
      setAdminNotes("");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update waitlist status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-white/10">
        <DialogHeader>
          <DialogTitle>Update Waitlist Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Are you sure you want to mark this waitlist entry as{" "}
              <span className="font-semibold text-foreground">
                {formatStatusText(statusToUpdate)}
              </span>
              ?
            </p>
            <Textarea
              placeholder="Admin Notes (Optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="resize-none min-h-25"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-card hover:bg-background hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-destructive text-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusModal;
