"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteAiViolationMutation } from "@/redux/api/ai-violation/aiViolationApi";
import { Icons } from "@/utils/icons";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  violationId: string | null;
}

const DeleteViolationModal = ({ open, onOpenChange, violationId }: Props) => {
  const [deleteViolation, { isLoading }] = useDeleteAiViolationMutation();

  const handleConfirm = async () => {
    if (!violationId) return;

    try {
      const res = await deleteViolation(violationId).unwrap();

      if ((res as { success?: boolean })?.success) {
        toast.success("Violation deleted successfully", {
          description: "The AI Violation has been permanently removed.",
        });
        onOpenChange(false);
      }
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to delete violation");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl border border-white/10 bg-black/90 backdrop-blur text-white border-t-red-500">
        <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center border bg-red-500/10 border-red-500/30">
            <Icons.RiDeleteBinLine className="h-8 w-8 text-red-500" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-center sm:text-center">
            Delete AI Violation
          </AlertDialogTitle>
          <AlertDialogDescription className="hidden text-center sm:text-center">
            Are you sure you want to delete this AI Violation?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p className="text-sm text-muted-foreground text-center sm:text-center mt-2 mb-4">
          Are you sure you want to delete this AI Violation? This action cannot
          be undone and will permanently remove the record from the servers.
        </p>

        <AlertDialogFooter className="p-0">
          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
            <AlertDialogAction
              className="w-full h-10 rounded-lg text-white bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-full h-10 rounded-lg border border-white/30 text-white! bg-transparent hover:bg-white/10 m-0 mt-0"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteViolationModal;
