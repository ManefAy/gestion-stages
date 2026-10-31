// useAuth.js — read the logged-in user from any component
// Usage: const { user, login, logout } = useAuth();
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  // Clear error message if we forgot to wrap the app in <AuthProvider>
  if (ctx === null) {
    throw new Error(
      "useAuth() doit être utilisé à l'intérieur de <AuthProvider>.",
    );
  }
  return ctx;
}
