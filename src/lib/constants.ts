export const SIDEBAR_ITEMS = [
  // ===== ADMIN =====
  {
    id: "admin-dashboard",
    label: "Admin Overview",
    href: "/dashboard/admin",
    icon: "LayoutDashboard",
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
    roles: ["STUDENT", "CUSTOMER", "ADMIN"],
  },
  // ===== PROPERTY OWNER =====
  {
    id: "owner-dashboard",
    label: "Owner Portal",
    href: "/dashboard/owner",
    icon: "LayoutDashboard",
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
