export interface User {
  id: string;
  name: string;
  email: string;
  role: "STAFF" | "CUSTOMER";
  avatar?: string;
}

export const DEMO_USERS: Record<string, User & { password: string }> = {
  staff: {
    id: "1",
    name: "Staff User",
    email: "staff@example.com",
    role: "STAFF",
    password: "staff123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=staff",
  },
  customer: {
    id: "2",
    name: "Customer User",
    email: "customer@example.com",
    role: "CUSTOMER",
    password: "customer123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
  },
};

export function validateCredentials(
  email: string,
  password: string
): User | null {
  const user = Object.values(DEMO_USERS).find(
    (u) => u.email === email && u.password === password
  );
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
}

export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole.toLowerCase());
}
