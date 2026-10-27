import { IRole } from "../types/global.ts";

export interface User {
  id: string;
  name: string;
  email: string;
  role: IRole | "STAFF" | "CUSTOMER" | "ADMIN" | "STUDENT" | "OWNER";
  roleLabel: string;
  dashboardPath: string;
  phone?: string;
  location?: string;
  avatar?: string;
}

export interface DemoUser extends User {
  password: string;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  student: {
    id: "demo-student-01",
    name: "Rayhan Ahmed",
    email: "student@smartrentbd.com",
    role: IRole.STUDENT,
    roleLabel: "Student / Tenant",
    password: "student123",
    dashboardPath: "/dashboard/student",
    phone: "+880 1712-345678",
    location: "Dhanmondi, Dhaka",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student",
  },
  owner: {
    id: "demo-owner-01",
    name: "Kabir Hossain",
    email: "owner@smartrentbd.com",
    role: IRole.OWNER,
    roleLabel: "Property Owner",
    password: "owner123",
    dashboardPath: "/dashboard/owner",
    phone: "+880 1812-987654",
    location: "Mirpur 2, Dhaka",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=owner",
  },
  customer: {
    id: "demo-customer-02",
    name: "Customer User",
    email: "customer@example.com",
    role: IRole.STUDENT,
    roleLabel: "Student / Tenant",
    password: "customer123",
    dashboardPath: "/dashboard/student",
    phone: "+880 1700-112233",
    location: "Bogura, Bangladesh",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
  },
  admin: {
    id: "demo-admin-01",
    name: "Admin Moderator",
    email: "admin@smartrentbd.com",
    role: IRole.ADMIN,
    roleLabel: "Administrator",
    password: "admin123",
    dashboardPath: "/dashboard/admin",
    phone: "+880 1900-445566",
    location: "Dhaka Central",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  staff: {
    id: "demo-staff-02",
    name: "Staff User",
    email: "staff@example.com",
    role: IRole.ADMIN,
    roleLabel: "Administrator",
    password: "staff123",
    dashboardPath: "/dashboard/admin",
    phone: "+880 1900-445566",
    location: "Dhaka Central",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
  },
};

export function validateCredentials(
  email: string,
  password: string
): User | null {
  const normalizedEmail = email.trim().toLowerCase();
  const user = Object.values(DEMO_USERS).find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  const normalizedRole = userRole.toLowerCase();
  return requiredRoles.some((r) => r.toLowerCase() === normalizedRole);
}
