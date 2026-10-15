"use client";

import { motion } from "framer-motion";
import PasswordForm from "./PasswordForm";
import PlatformContactForm from "./PlatformContactForm";
import ProfileForm from "./ProfileForm";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const AdminInfo = () => {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10">
      {/* ================= PROFILE ================= */}
      <motion.div variants={itemVariants} className="bg-primary border  rounded-xl p-5">
        <ProfileForm />
      </motion.div>

      {/* ================= PLATFORM CONTACT ================= */}
      <motion.div variants={itemVariants} className="bg-primary border  rounded-xl p-5">
        <PlatformContactForm />
      </motion.div>

      {/* ================= PASSWORD ================= */}
      <motion.div variants={itemVariants} className="bg-primary border  rounded-xl p-5">
        <PasswordForm />
      </motion.div>
    </motion.div>
  );
};

export default AdminInfo;
