"use client";

import type React from "react";

import { SIDEBAR_ITEMS, WEBSITE_DETAILS } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../../utils/icons";
import { LogoutButton } from "./LogoutButton";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, isCollapsed, onClose }: SidebarProps) {
  const pathname = usePathname();

  //   const user = useAppSelector((state) => state.auth.user);
  const user = {
    role: "ADMIN",
  };

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      LayoutDashboard: <Icons.LayoutDashboard className="w-5 h-5" />, // dashboard
      CalendarCheck: <Icons.CalendarCheck className="w-5 h-5" />, // Season Management
      Users: <Icons.Users className="w-5 h-5" />, // Team Management
      LuUserCog: <Icons.LuUserCog className="w-5 h-5" />, // Player Management
      CiStreamOn: <Icons.CiStreamOn className="w-5 h-5" />, // Streaming Approval

      Trophy: <Icons.Trophy className="w-5.5 h-5.5" />, // Season Standings
      MonitorPlay: <Icons.MonitorPlay className="w-5 h-5" />, // Live Matches
      Calendar: <Icons.Calendar className="w-5 h-5" />, // Scheduled Matches
      GoListOrdered: <Icons.GoListOrdered className="w-5 h-5" />, // Waitlist Control
      LuDollarSign: <Icons.LuDollarSign className="w-5 h-5" />, // Financial Center

      RiAdvertisementLine: <Icons.RiAdvertisementLine className="w-5 h-5" />, // Sponsor/ Ad control
      RiFlag2Line: <Icons.RiFlag2Line className="w-5 h-5" />, // Flag Management
      MdOutlineSubscriptions: (
        <Icons.MdOutlineSubscriptions className="w-5 h-5" />
      ), // Subscription plan
      Settings: <Icons.Settings className="w-5 h-5" />, // System Settings
    };
    return iconMap[iconName];
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-sm lg:hidden z-30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-background  border-r   transition-all duration-300 z-40 lg:relative lg:z-0 ${
          isOpen ? "w-64" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b ">
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "lg:justify-center lg:w-full" : ""
              }`}
            >
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 min-w-0"
              >
                {/* LOGO */}
                <Image
                  src={WEBSITE_DETAILS.SITE_LOGO}
                  alt="GOFL"
                  width={70}
                  height={70}
                  draggable={false}
                  priority
                  className="shrink-0"
                />

                {/* TEXT */}
                {!isCollapsed && (
                  <div className="hidden lg:flex flex-col justify-center leading-none">
                    <span className="text-sm font-semibold text-foreground tracking-wide">
                      {WEBSITE_DETAILS.SITE_DASHBOARD_TITLE}
                    </span>
                    <span className="text-[0.73rem] font-medium text-muted-foreground mt-0.5">
                      {WEBSITE_DETAILS.SITE_DASHBOARD_SUBTITLE}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
            {visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-destructive text-foreground"
                      : "text-foreground/90 hover:bg-destructive/30 "
                  } ${isCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  {getIcon(item.icon)}
                  {!isCollapsed && (
                    <span className=" text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            {/* <LogoutButton isCollapsed={isCollapsed} /> */}
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </aside>
    </>
  );
}
