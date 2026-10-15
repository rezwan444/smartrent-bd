import { Button } from "@/components/ui/button";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch } from "@/redux/hook";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Make sure 'sonner' is installed
import { Icons } from "../../utils/icons";

export function LogoutButton({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // handle logout
  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
    router.refresh();
    toast.success("Logout successful!");
  };

  return (
    <div className="">
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 hover:cursor-pointer hover:bg-destructive/10 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        {isCollapsed ? (
          <Icons.LogOut className="w-4 h-4" />
        ) : (
          <>
            <Icons.LogOut className="w-4 h-4" />
            Logout
          </>
        )}
      </Button>
    </div>
  );
}
