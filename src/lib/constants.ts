export const SIDEBAR_ITEMS = [
  // ===== ADMIN =====
  {
    id: "admin-dashboard",
    label: "Admin Overview",
    href: "/dashboard/admin",
    icon: "LayoutDashboard",
    roles: ["ADMIN", "SUPER_ADMIN", "STAFF"],
  },
  {
    id: "admin-listings",
    label: "Listing Verification",
    href: "/dashboard/admin?tab=listings",
    icon: "FileCheck2",
    roles: ["ADMIN", "SUPER_ADMIN", "STAFF"],
  },
  {
    id: "admin-owners",
    label: "Owner NID Verification",
    href: "/dashboard/admin?tab=owners",
    icon: "UserCheck2",
    roles: ["ADMIN", "SUPER_ADMIN", "STAFF"],
  },
  {
    id: "admin-scams",
    label: "Scam Reports & Search Suppression",
    href: "/dashboard/admin?tab=scams",
    icon: "ShieldAlert",
    roles: ["ADMIN", "SUPER_ADMIN", "STAFF"],
  },
  {
    id: "admin-logs",
    label: "Moderation Audit Trail",
    href: "/dashboard/admin?tab=logs",
    icon: "History",
    roles: ["ADMIN", "SUPER_ADMIN", "STAFF"],
  },
  // ===== STUDENT / TENANT =====
  {
    id: "student-dashboard",
    label: "Student Portal",
    href: "/dashboard/student",
    icon: "LayoutDashboard",
    roles: ["STUDENT", "CUSTOMER"],
  },
  {
    id: "roommate-matching",
    label: "Roommate Matching",
    href: "/roommates",
    icon: "Users",
    roles: ["STUDENT", "CUSTOMER"],
  },
  {
    id: "student-expenses",
    label: "Shared Expenses & Mess",
    href: "/dashboard/student/expenses",
    icon: "LuDollarSign",
    roles: ["STUDENT", "CUSTOMER"],
  },
  {
    id: "student-maintenance",
    label: "Maintenance & Alerts",
    href: "/dashboard/student/maintenance",
    icon: "CalendarCheck",
    roles: ["STUDENT", "CUSTOMER"],
  },
  // ===== PROPERTY OWNER =====
  {
    id: "owner-dashboard",
    label: "My Properties",
    href: "/dashboard/owner",
    icon: "LayoutDashboard",
    roles: ["OWNER"],
  },
  {
    id: "owner-visits",
    label: "Visit Requests",
    href: "/dashboard/owner/visits",
    icon: "CalendarCheck",
    roles: ["OWNER"],
  },
  {
    id: "owner-maintenance",
    label: "Maintenance & Repairs",
    href: "/dashboard/owner/maintenance",
    icon: "Settings",
    roles: ["OWNER"],
  },
  {
    id: "owner-verification",
    label: "Host NID Verification",
    href: "/dashboard/owner/verification",
    icon: "UserCheck2",
    roles: ["OWNER"],
  },
];

// website details like name, url, logo , etc
// SmartRent BD is a student-focused rental housing and roommate-matching platform.
export const WEBSITE_DETAILS = {
  SITE_NAME: "SmartRent BD",
  SITE_ONLY_NAME: "SmartRent BD",
  SITE_DESCRIPTION: "Find Your Place. Feel at Home.",
  SITE_DESC: "Student Rental Housing & Roommate Matching",
  SITE_DASHBOARD_TITLE: "SmartRent BD Portal",
  SITE_DASHBOARD_SUBTITLE: "Student Rental Housing & Roommate Matching",
  SITE_LOGO: "/smartrent-bd.png",
  AVATAR1: "/placeholder/avatar1.jpg",
  AVATAR2: "/placeholder/avatar2.jpg",
};

export const paginationLimit = 25;
