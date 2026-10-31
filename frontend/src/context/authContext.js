// authContext.js — the "channel" through which the logged-in user is shared
import { createContext } from "react";

// null = default value if a component reads it outside of <AuthProvider>
export const AuthContext = createContext(null);
