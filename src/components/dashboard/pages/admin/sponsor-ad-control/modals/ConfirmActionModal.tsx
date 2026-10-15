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

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmText: string;
  onConfirm: () => void;
  variant?: "danger" | "success";
}

const ConfirmActionModal = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  onConfirm,
  variant = "danger",
}: Props) => {
  const isSuccess = variant === "success";
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`max-w-sm rounded-none border border-white/10 bg-black/90 backdrop-blur text-white ${isSuccess ? "border-t-green-500" : "border-t-red-500"}`}>
        <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center border ${isSuccess ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
            {isSuccess ? (
              <Icons.PiCheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <Icons.PiWarningCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-center sm:text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="hidden text-center sm:text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <p className="text-sm text-muted-foreground text-center sm:text-center mt-2 mb-4">
          {description}
        </p>

        <AlertDialogFooter className="p-0">
          <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-3">
            <AlertDialogAction
              className={`w-full h-10 rounded-lg text-white ${isSuccess ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmText}
            </AlertDialogAction>
            <AlertDialogCancel
              className="w-full h-10 rounded-lg border border-white/30 text-white! bg-transparent hover:bg-white/10 m-0 mt-0"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmActionModal;
