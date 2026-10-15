"use client";

import AdminHome from "@/components/dashboard/pages/admin/AdminHome/AdminHome";

export default function DashboardPage() {
  const user = {
    id: "3",
    name: "Staff User",
    email: "staff@example.com",
    role: "ADMIN",

    password: "staff123",
    avatar:
      "https://images.ctfassets.net/xjcz23wx147q/iegram9XLv7h3GemB5vUR/0345811de2da23fafc79bd00b8e5f1c6/Max_Rehkopf_200x200.jpeg",
  };

  return (
    <div className=" ">
      <div className="flex flex-col md:flex-row md:space-x-4 lg:space-x-8">
        {user.role === "ADMIN" ? (
          <div className="flex-1">
            <AdminHome />
          </div>
        ) : null}
      </div>
    </div>
  );
}
