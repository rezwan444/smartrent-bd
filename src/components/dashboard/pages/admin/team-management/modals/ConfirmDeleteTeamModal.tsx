import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ITeam } from "@/types/global";
import { Trash2 } from "lucide-react";
import { useState, MouseEvent } from "react";

interface Props {
  team: ITeam;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDelete: (id: string) => any;
}

const ConfirmDeleteTeamModal = ({ team, onDelete }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      await onDelete(team.id);
      setIsOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isDeleting}
          className="p-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors hover:cursor-pointer"
          title={`Delete ${team.mascot}`}
        >
          {isDeleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-none border border-t-red-500 max-w-sm">
        <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center bg-destructive/10">
            <Trash2 className="h-8 w-8 text-destructive" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-center sm:text-center">
            Are you sure you want to delete this team?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-center sm:text-center">
            This action will permanently delete{" "}
            <span className="font-medium text-destructive">{team.mascot}</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex w-full gap-3 mt-4 flex-col md:flex-row">
          <AlertDialogAction
            disabled={isDeleting}
            title={`Delete ${team.mascot}`}
            onClick={handleDelete}
            className="w-full md:flex-1 text-white disabled:cursor-not-allowed disabled:opacity-60 bg-destructive hover:bg-destructive/90 hover:cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
          <AlertDialogCancel disabled={isDeleting} className="w-full md:flex-1 mt-0 border hover:bg-primary-dark text-foreground! hover:cursor-pointer">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteTeamModal;
