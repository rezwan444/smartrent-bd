"use client";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { IRole } from "@/types/global";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Icons } from "../../utils/icons";
interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export function Header({
  onMenuClick,
  sidebarOpen,
  isCollapsed,
  onCollapseToggle,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const activeRole =
    (user?.role as string) ||
    (pathname.includes("/student")
      ? "STUDENT"
      : pathname.includes("/owner")
      ? "OWNER"
      : "ADMIN");

  const dashboardHomeHref =
    activeRole === "STUDENT" ||
    activeRole === "CUSTOMER" ||
    pathname.includes("/student")
      ? "/dashboard/student"
      : activeRole === "OWNER" || pathname.includes("/owner")
      ? "/dashboard/owner"
      : "/dashboard/admin";

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    // logout();
    dispatch(logout());
    router.replace("/login");
    router.refresh();
    toast.success("Logout successful!");
    // router.push("/login");
  };

  return (
    <header className="h-16 bg-background border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="lg:hidden rounded-md px-2">
          <Link
            href={dashboardHomeHref}
            className="rounded-lg text-blue-600 flex items-center justify-center font-bold"
          >
            <Image
              src={WEBSITE_DETAILS.SITE_LOGO}
              alt="SmartRent BD"
              width={70}
              height={70}
              draggable={false}
              priority
              className="shrink-0"
            />
          </Link>
        </div>
        <button
          onClick={onMenuClick}
          className="lg:hidden text-foreground/70 p-2 rounded-r-lg bg-background rounded-md transition-all hover:cursor-pointer transform duration-300"
          aria-label="Toggle menu"
        >
          {/* <Icons.Menu className="w-5 h-5" /> */}
          {sidebarOpen ? (
            <Icons.TbLayoutSidebarLeftCollapseFilled />
          ) : (
            <Icons.TbLayoutSidebarRightCollapseFilled />
          )}
        </button>

        <button
          onClick={onCollapseToggle}
          className="hidden lg:flex -ml-7 text-foreground/70 p-2 rounded-r-lg transition-colors bg-background hover:cursor-pointer"
          aria-label="Toggle sidebar collapse"
        >
          {/* <Icons.Menu className="w-5 h-5" /> */}
          {isCollapsed ? (
            <Icons.TbLayoutSidebarRightCollapseFilled />
          ) : (
            <Icons.TbLayoutSidebarLeftCollapseFilled />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification & Message Icon Section */}
        <div className="flex items-center gap-x-2">
          {/* MESSAGE */}
          <div className="relative hidden">
            <div
              className="
        flex items-center justify-center
        h-9 w-9 sm:h-10 sm:w-10
        rounded-full bg-muted
        cursor-pointer
      "
            >
              <Icons.Mail className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
            </div>

            {/* Badge */}
            {/* <span
              className="
        absolute -top-1 -right-1
        flex min-h-4.5 min-w-4.5
        items-center justify-center
        rounded-full bg-red-600
        px-1 text-[10px] font-semibold text-white
      "
            >
              12
            </span> */}
          </div>

          {/* NOTIFICATION */}
          <div className="relative hidden">
            <div
              className="
        flex items-center justify-center
        h-9 w-9 md:h-10 md:w-10
        rounded-full bg-muted
        cursor-pointer
      "
            >
              <Icons.MdOutlineNotificationsNone className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
            </div>

            {/* Badge */}
            <span
              className="
        absolute -top-1 -right-1
        flex min-h-4.5 min-w-4.5
        items-center justify-center
        rounded-full bg-red-600
        px-1 text-[10px] font-semibold text-white
      "
            >
              12
            </span>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 hover:bg-muted/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            aria-label="User menu"
            aria-expanded={showDropdown}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-border shadow-2xs shrink-0 bg-muted flex items-center justify-center">
              {user?.profilePictureUrl ? (
                <Image
                  width={64}
                  height={64}
                  src={user.profilePictureUrl}
                  alt="profile"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-primary">
                  {user?.firstName?.[0] || "U"}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Account"}
              </p>
              <p className="text-[10px] text-muted-foreground capitalize truncate">
                {String(user?.role || activeRole).toLowerCase()}
              </p>
            </div>
            <Icons.ChevronDownIcon
              className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-card text-card-foreground border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-border bg-muted/30">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Demo User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {user?.email || "user@smartrentbd.com"}
                </p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-primary/10 text-primary border border-primary/20">
                    {user?.role || activeRole}
                  </span>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    router.push(dashboardHomeHref);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Icons.LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  Dashboard Overview
                </button>

                {user?.role === IRole.SUPER_ADMIN && (
                  <button
                    onClick={() => {
                      router.push("/dashboard/admin/system-settings");
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Icons.Settings className="w-4 h-4 text-muted-foreground" />
                    System Settings
                  </button>
                )}
              </div>

              <div className="p-1.5 border-t border-border">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <Icons.LogOut className="w-4 h-4 text-destructive" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
