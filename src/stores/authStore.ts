import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

// Define the shape of the store's state and actions
interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create(
  // The 'persist' middleware automatically saves the store's state
  // to localStorage, making it persistent across browser sessions.
  persist<AuthState>(
    (set) => ({
      // Initial state when the app loads
      user: null,
      token: null,

      // Action to update the state after a successful login
      setUser: (user, token) => set({ user, token }),

      // Action to clear the state on logout
      logout: () => set({ user: null, token: null }),
    }),
    {
      // This is the key that will be used in localStorage
      name: "auth-storage",
    }
  )
);
