"use client";

import { useEffect } from "react";
import { useAppDispatch } from "./hook";
import { setUser } from "./features/user/authSlice";
import { IAllStatusEnum, IRole } from "@/types/global";
import type { ApiResponse, IUser } from "@/types/backend";

export function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (isMounted) {
            dispatch(setUser(null));
          }
          return;
        }

        const result = (await res.json()) as ApiResponse<{ user: IUser; isDemoUser: boolean }>;
        if (result.success && result.data?.user && isMounted) {
          const authUser = result.data.user;

          let roleEnum: IRole = IRole.STUDENT;
          const upperRole = String(authUser.role).toUpperCase();
          if (upperRole === "ADMIN" || upperRole === "SUPER_ADMIN" || upperRole === "STAFF") {
            roleEnum = IRole.ADMIN;
          } else if (upperRole === "OWNER") {
            roleEnum = IRole.OWNER;
          }

          const firstName = authUser.fullName?.split(" ")[0] || "User";
          const lastName = authUser.fullName?.split(" ").slice(1).join(" ") || "";

          dispatch(
            setUser({
              id: authUser._id,
              email: authUser.email,
              firstName,
              lastName,
              phone: authUser.phone || "",
              location: authUser.location || "Dhaka, Bangladesh",
              profilePictureUrl: authUser.avatar || null,
              role: roleEnum,
              status: IAllStatusEnum.ACTIVE,
              twoFactor: false,
              createdAt: String(authUser.createdAt || new Date().toISOString()),
              updatedAt: String(authUser.updatedAt || new Date().toISOString()),
            })
          );
        }
      } catch (err) {
        console.error("[AuthInitializer Error]:", err);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return null;
}
