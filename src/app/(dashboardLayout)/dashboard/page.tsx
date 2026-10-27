import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const userRole = cookieStore.get("userRole")?.value?.toUpperCase();

  if (!token) {
    redirect("/login");
  }

  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "STAFF") {
    redirect("/dashboard/admin");
  } else if (userRole === "OWNER") {
    redirect("/dashboard/owner");
  } else {
    redirect("/dashboard/student");
  }
}
