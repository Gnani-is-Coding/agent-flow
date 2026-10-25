import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/store/authStore";
import { Spinner } from "./Spinner";
import { useApi } from "@/hooks/useApi";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const clear = useAuth((s) => s.clear);
  const { error, isSuccess, request } = useApi("/auth/me", "get");

  useEffect(() => {
    if (hydrated && user) void request();
  }, [hydrated, user, request]);

  // clearing the user lets _app redirect to /login
  useEffect(() => {
    if (error) clear();
  }, [error, clear]);

  if (!hydrated || !user || !isSuccess) return <Spinner />;
  return <>{children}</>;
}
