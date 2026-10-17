import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get("userRole")?.value;

  if (userRole === "STUDENT") {
    redirect("/dashboard/student");
  } else if (userRole === "OWNER") {
    redirect("/dashboard/owner");
  } else {
    redirect("/dashboard/admin");
  }
}
