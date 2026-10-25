import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "ADMIN" | "OPERATOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,
      setUser: (user) => set({ user }),
      clear: () => set({ user: null }),
    }),
    {
      name: "auth",
      partialize: ({ user }) => ({ user }),
      // rehydrated in _app after mount, so server and first client render match
      skipHydration: true, // persist doesnt load until we call rehydrate().
      onRehydrateStorage: () => () => useAuth.setState({ hydrated: true }),
    },
  ),
);
