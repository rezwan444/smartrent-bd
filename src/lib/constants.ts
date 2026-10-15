export const SIDEBAR_ITEMS = [
  // ===== ADMIN  =====
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard/admin",
    icon: "LayoutDashboard",
    roles: ["ADMIN"],
  },
  {
    id: "season-management",
    label: "Season Management",
    href: "/dashboard/admin/season-management",
    icon: "CalendarCheck",
    roles: ["ADMIN"],
  },
  {
    id: "team-management",
    label: "Team Management",
    href: "/dashboard/admin/team-management",
    icon: "Users",
    roles: ["ADMIN"],
  },
  {
    id: "player-management",
    label: "Player Management",
    href: "/dashboard/admin/player-management",
    icon: "LuUserCog",
    roles: ["ADMIN"],
  },
  //   {
  //     id: "streaming-approval",
  //     label: "Streaming Approval",
  //     href: "/dashboard/admin/streaming-approval",
  //     icon: "CiStreamOn",
  //     roles: ["ADMIN"],
  //   },
  {
    id: "season-standings",
    label: "Season Standings",
    href: "/dashboard/admin/season-standings",
    icon: "Trophy",
    roles: ["ADMIN"],
  },
  {
    id: "live-matches",
    label: "Live Matches",
    href: "/dashboard/admin/live-matches",
    icon: "MonitorPlay",
    roles: ["ADMIN"],
  },
  {
    id: "scheduled-matches",
    label: "Scheduled Matches",
    href: "/dashboard/admin/scheduled-matches",
    icon: "Calendar",
    roles: ["ADMIN"],
  },
  {
    id: "waitlist-control",
    label: "Waitlist Control",
    href: "/dashboard/admin/waitlist-control",
    icon: "GoListOrdered",
    roles: ["ADMIN"],
  },

  {
    id: "financial-center",
    label: "Financial Center",
    href: "/dashboard/admin/financial-center",
    icon: "LuDollarSign",
    roles: ["ADMIN"],
  },
  {
    id: "sponsor-ad-control",
    label: "Sponsor/ Ad control",
    href: "/dashboard/admin/sponsor-ad-control",
    icon: "RiAdvertisementLine",
    roles: ["ADMIN"],
  },
  {
    id: "ai-violation-report",
    label: "AI Violation Report",
    href: "/dashboard/admin/ai-violation-report",
    icon: "RiFlag2Line",
    roles: ["ADMIN"],
  },
  {
    id: "subscription-plan",
    label: "Subscription plan",
    href: "/dashboard/admin/subscription-plan",
    icon: "MdOutlineSubscriptions",
    roles: ["ADMIN"],
  },
  {
    id: "system-settings",
    label: "System Settings",
    href: "/dashboard/admin/system-settings",
    icon: "Settings",
    roles: ["ADMIN"],
  },
];

// website details like name, url, logo , etc
// THIS IS A GAMING PLATFORM INCLUDING STREAMING FEATURES, PLAYER, SPONSOR, WAITLIST, REPORT, ETC.
export const WEBSITE_DETAILS = {
  SITE_NAME: "GOFL - Gaming Platform",
  SITE_ONLY_NAME: "GOFL",
  SITE_DESCRIPTION: "GAMERS ONLINE FOOTBALL LEAGUE",
  SITE_DESC: "Gaming Platform",
  SITE_DASHBOARD_TITLE: "GOFL Admin Portal",
  SITE_DASHBOARD_SUBTITLE: "GAMERS ONLINE FOOTBALL LEAGUE",
  SITE_LOGO: "/cleveljackson-logo-large.png",
  // SITE_FAVICON: "/cleveljackson-favicon.png",
  AVATAR1: "/placeholder/avatar1.jpg",
  AVATAR2: "/placeholder/avatar2.jpg",
};

export const paginationLimit = 25;
