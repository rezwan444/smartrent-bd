import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  let userRole = cookieStore.get("userRole")?.value?.toUpperCase();

  if (!token) {
    redirect("/login");
  }

  if (!userRole && token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4 !== 0) base64 += "=";
        const payload = JSON.parse(atob(base64));
        userRole = payload.role?.toUpperCase();
      }
    } catch {
      // ignore
    }
  }

  if (userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "STAFF") {
    redirect("/dashboard/admin");
  } else if (userRole === "OWNER") {
    redirect("/dashboard/owner");
  } else {
    redirect("/dashboard/student");
  }
}
