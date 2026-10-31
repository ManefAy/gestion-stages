// AuthProvider.jsx — holds the logged-in user and shares it with the whole app
import { useState } from "react";
import { AuthContext } from "./authContext";

const CLE = "devtec-user"; // key used in localStorage

// Read the saved user (or null). try/catch: localStorage can be blocked
// (private browsing, strict settings) — the app must still work.
function lireUtilisateur() {
  try {
    const texte = localStorage.getItem(CLE);
    return texte ? JSON.parse(texte) : null; // text → object
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  // Lazy initial value: read localStorage only ONCE, at the first render
  const [user, setUser] = useState(lireUtilisateur);

  // Called by the Login page after the password check
  function login(compte) {
    // Store only what the interface needs — NEVER the password
    const u = {
      id: compte.id,
      login: compte.login,
      nom: compte.nom,
      role: compte.role,
    };
    setUser(u);
    try {
      localStorage.setItem(CLE, JSON.stringify(u)); // object → text
    } catch {
      // not saved: the user will just have to log in again after a reload
    }
  }

  function logout() {
    setUser(null);
    try {
      localStorage.removeItem(CLE);
    } catch {
      // nothing to do
    }
  }

  // Everything inside <AuthProvider> can now read { user, login, logout }
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
