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
import { Icons } from "@/utils/icons";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { AiViolationStatus } from "@/types/global";
import { useUpdateAiViolationStatusMutation } from "@/redux/api/ai-violation/aiViolationApi";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  violationId: string | null;
}

const CompleteViolationModal = ({ open, onOpenChange, violationId }: Props) => {
  const [adminNote, setAdminNote] = useState("");
  const [updateStatus, { isLoading }] = useUpdateAiViolationStatusMutation();

  const handleConfirm = async () => {
    if (!violationId) return;

    try {
      const res = await updateStatus({
        id: violationId,
        status: AiViolationStatus.COMPLETED,
        adminNote: adminNote.trim() !== "" ? adminNote : undefined,
      }).unwrap();

      if ((res as { success?: boolean })?.success) {
        toast.success("Violation marked as completed", {
          description: "The AI Violation has been successfully verified and completed.",
        });
        setAdminNote("");
        onOpenChange(false);
      }
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to update violation status");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-xl border border-white/10 bg-black/90 backdrop-blur text-white border-t-green-500">
        <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center border bg-green-500/10 border-green-500/30">
            <Icons.PiCheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-center sm:text-center">
            Complete AI Violation
          </AlertDialogTitle>
          <AlertDialogDescription className="hidden text-center sm:text-center">
            Are you sure you want to mark this AI Violation as completed?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p className="text-sm text-muted-foreground text-center sm:text-center mt-2 mb-2">
          Are you sure you want to mark this AI Violation as completed? You can optionally add an admin note below.
        </p>

        <div className="w-full mb-4">
          <Textarea
            placeholder="Add an admin note (optional)..."
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full bg-white/5 border-white/10 resize-none h-24 text-sm"
          />
        </div>

        <AlertDialogFooter className="p-0">
          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
            <AlertDialogAction
              className="w-full h-10 rounded-lg text-white bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Completing..." : "Complete"}
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-full h-10 rounded-lg border border-white/30 text-white! bg-transparent hover:bg-white/10 m-0 mt-0"
              onClick={() => {
                setAdminNote("");
                onOpenChange(false);
              }}
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

export default CompleteViolationModal;
