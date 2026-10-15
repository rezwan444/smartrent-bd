"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { useState } from "react";
import AdminInfo from "./admin-info/AdminInfo";
import AdminManagement from "./admin-management/AdminManagement";
import SuspendedUsers from "./suspended-users/SuspendedUsers";

type TTabs = "admin-info" | "suspended-users" | "admin-management";

const tabs: TTabs[] = ["admin-info", "suspended-users", "admin-management"];

const SystemSettings = () => {
  const [tab, setTab] = useState<TTabs>("admin-info");

  return (
    <div className="space-y-6">
      {/* ================= TABS ================= */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-8"
      >
        {tabs.map((item) => {
          const isActive = tab === item;

          return (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
              }}
              key={item}
              className="w-full md:w-fit"
            >
              <Button
                onClick={() => setTab(item)}
                className={cn(
                  // base
                  "w-full md:w-fit px-10 py-7 text-lg font-medium shadow-none transition-colors",
                  "bg-primary text-foreground border hover:bg-primary/80 hover:cursor-pointer",

                  // active
                  isActive && "bg-card text-foreground hover:bg-card/80",
                )}
              >
                {item === "admin-info"
                  ? "Admin Info"
                  : item === "suspended-users"
                    ? "Suspended Users"
                    : "Admin Management"}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================= CONTENT ================= */}
      <div>
        {tab === "admin-info" && <AdminInfo />}
        {tab === "suspended-users" && <SuspendedUsers />}
        {tab === "admin-management" && <AdminManagement />}
      </div>
    </div>
  );
};

export default SystemSettings;
