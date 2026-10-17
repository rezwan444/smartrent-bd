import { Metadata } from "next";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

export const metadata: Metadata = {
  title: "Shared Expense & Mess Account Manager | SmartRent BD",
  description:
    "Manage flat rent, utilities, mess ledger, dynamic meal rates, and roommate balances with explainable settlement optimization.",
};

export default function StudentExpensesPage() {
  return <ExpensesClient />;
}
