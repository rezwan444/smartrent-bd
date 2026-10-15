"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteWaitlistMutation } from "@/redux/api/waitlist/waitlistApi";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waitlistId: string | null;
}

const DeleteWaitlistModal = ({ open, onOpenChange, waitlistId }: Props) => {
  const [deleteWaitlist, { isLoading }] = useDeleteWaitlistMutation();

  const handleDelete = async () => {
    if (!waitlistId) return;

    try {
      await deleteWaitlist(waitlistId).unwrap();
      toast.success("Waitlist entry deleted successfully");
      onOpenChange(false);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete waitlist entry");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-white/10">
        <DialogHeader>
          <DialogTitle>Delete Waitlist Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete this waitlist entry? This action
            cannot be undone.
          </p>

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
              onClick={handleDelete}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWaitlistModal;
