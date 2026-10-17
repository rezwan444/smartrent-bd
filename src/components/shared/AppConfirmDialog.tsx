"use client";

import React from "react";
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
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default";
  onConfirm: () => void;
}

export function AppConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
}: AppConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertTriangle className="size-5 text-destructive shrink-0" />;
      case "warning":
        return <AlertCircle className="size-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="size-5 text-primary shrink-0" />;
    }
  };

  const getBadgeBg = () => {
    switch (variant) {
      case "destructive":
        return "bg-destructive/10 border-destructive/20";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  const getActionBtnClass = () => {
    switch (variant) {
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[92vw] sm:max-w-md p-5 sm:p-6 bg-card border border-border rounded-xs shadow-2xl">
        <AlertDialogHeader className="gap-3">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-xs border shrink-0 mt-0.5", getBadgeBg())}>
              {getIcon()}
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-end gap-2.5">
          <AlertDialogCancel className="text-xs sm:text-sm rounded-xs border-border/80 hover:bg-secondary/70 h-9 px-4">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              "text-xs sm:text-sm rounded-xs font-semibold h-9 px-4 cursor-pointer shadow-xs",
              getActionBtnClass()
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
