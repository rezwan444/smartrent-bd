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
import { Button } from "@/components/ui/button";
import { IAllStatusEnum, ITeam } from "@/types/global";
import { Icons } from "@/utils/icons";

interface Props {
  team: ITeam;
  //   onSuspend: (id: string) => void;
  suspendingId?: string | null;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const SuspendModal = ({ team, onDelete, suspendingId }: Props) => {
  const isSuspending = suspendingId === team.id;
  const isSuspended = team.status === IAllStatusEnum.SUSPENDED;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          disabled={isSuspending}
          variant="secondary"
          className="h-11 w-full bg-card text-sm text-foreground hover:cursor-pointer hover:bg-card-foreground disabled:cursor-not-allowed disabled:opacity-60"
          title={
            isSuspended
              ? `Activate ${team.mascot}`
              : `Suspend ${team.mascot}`
          }
        >
          {isSuspending ? (
            "Processing..."
          ) : isSuspended ? (
            <>
              <Icons.MdBlock className="h-4 w-4 mr-1.5 text-emerald-500" />
              Activate
            </>
          ) : (
            <>
              <Icons.MdBlock className="h-4 w-4 mr-1.5" />
              Suspend
            </>
          )}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className={`rounded-none border ${isSuspended ? "border-t-emerald-500" : "border-t-red-500"}`}>
        <AlertDialogHeader className="flex flex-col items-center text-center gap-4">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center ${isSuspended ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
            <Icons.MdBlock className={`h-8 w-8 ${isSuspended ? "text-emerald-500" : "text-destructive"}`} />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-center sm:text-center">
            Are you sure you want to {isSuspended ? "activate" : "suspend"} this team?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-center sm:text-center">
            This action will {isSuspended ? "activate" : "suspend"}{" "}
            <span className={`font-medium ${isSuspended ? "text-emerald-500" : "text-destructive"}`}>{team.mascot}</span>. You can change
            the status later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex w-full gap-3 mt-4 flex-col md:flex-row">
          <AlertDialogAction
            disabled={isSuspending}
            title={isSuspended ? `Activate ${team.mascot}` : `Suspend ${team.mascot}`}
            onClick={() => onDelete(team.id)}
            className={`w-full md:flex-1 text-white disabled:cursor-not-allowed disabled:opacity-60 ${isSuspended ? "bg-emerald-600 hover:bg-emerald-700" : "bg-destructive hover:bg-destructive/90"}`}
          >
            {isSuspending ? "Processing..." : isSuspended ? "Activate" : "Suspend"}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full md:flex-1 mt-0 border hover:bg-primary-dark text-foreground!">
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SuspendModal;
