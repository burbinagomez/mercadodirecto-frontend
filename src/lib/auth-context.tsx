"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import type { User, UserRole } from "@/lib/types";

type Role = UserRole | null;

interface AuthState {
  role: Role;
  email: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState>({
  role: null,
  email: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const me: User = await getMe();
      setRole(me.role);
      setEmail(me.email);
    } catch {
      setRole(null);
      setEmail(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return <Ctx.Provider value={{ role, email, loading, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
