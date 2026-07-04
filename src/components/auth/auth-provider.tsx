"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { hasAllowedEmailConfig, isEmailAllowed } from "@/lib/auth/allowed-emails";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user && (!hasAllowedEmailConfig() || !isEmailAllowed(data.user.email))) {
        toast.error("This email is not allowed to access this system.");
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      if (nextUser && (!hasAllowedEmailConfig() || !isEmailAllowed(nextUser.email))) {
        toast.error("This email is not allowed to access this system.");
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(nextUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
