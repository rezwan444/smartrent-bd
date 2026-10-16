"use client";
import { WEBSITE_DETAILS } from "@/lib/constants";
import { logout } from "@/redux/features/user/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { IRole } from "@/types/global";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

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

  const handleLogout = () => {
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
            href={"/dashboard/admin"}
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-300 hover:cursor-pointer"
            aria-label="User menu"
          >
            {user?.profilePictureUrl ? (
              <Image
                width={200}
                height={200}
                src={user?.profilePictureUrl || WEBSITE_DETAILS.AVATAR2}
                alt="profile"
                draggable={false}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <Image
                width={200}
                height={200}
                src={WEBSITE_DETAILS.AVATAR2}
                alt="profile"
                draggable={false}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}

            {/* <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {`${user?.firstName ?? "N/A"} ${user?.lastName ?? ""}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role ?? "N/A"}
              </p>
            </div> */}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-primary  border text-foreground rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b  ">
                <p className="text-sm font-medium ">
                  {`${user?.firstName ?? "Mr. "} ${user?.lastName ?? "Demo"}`}
                </p>
                <p className="text-xs text-gray-500 ">{user?.email}</p>
              </div>

              <div className="p-2 space-y-1">
                {user?.role === IRole.SUPER_ADMIN ? (
                  <button
                    onClick={() => {
                      router.push("/dashboard/admin/system-settings");
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted-foreground dark:hover:bg-slate-800 transition-colors hover:cursor-pointer"
                  >
                    <Icons.Settings className="w-4 h-4" />
                    Settings
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      router.push("/dashboard/admin");
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm  hover:bg-foreground/10  transition-colors hover:cursor-pointer"
                  >
                    <Icons.LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                )}
                {/* <button
                  onClick={() => {
                    router.push("/dashboard/admin/settings");
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors hover:cursor-pointer"
                >
                  <Icons.CiSettings className="w-5 h-5 text-sm font-medium" />
                  Settings
                </button> */}
              </div>

              <div className="p-2 border-t ">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600  hover:bg-destructive/20  transition-colors hover:cursor-pointer"
                >
                  <Icons.LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
