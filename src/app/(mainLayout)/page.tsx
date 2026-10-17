import type { Metadata } from "next";
import AdminHome from "@/components/dashboard/pages/admin/AdminHome/AdminHome";

export const metadata: Metadata = {
  title: "SmartRent BD — Student Rental Housing & Roommate Matching",
  description:
    "Find student rooms, family flats, bachelor messes, and hostels in Banasree, Mirpur, Uttara, Mohammadpur, Bashundhara, and across Bangladesh. Find your place, feel at home.",
};

export default function HomePage() {
  return <AdminHome />;
}
