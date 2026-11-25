import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, getToken, logout as authLogout } from "@/services/mock-api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setToken] = useState(getToken());

  // Sinkronkan state auth kalau storage berubah (misal logout di tab lain).
  useEffect(() => {
    function syncFromStorage() {
      setToken(getToken());
      setUser(getCurrentUser());
    }
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  function loginSuccess({ token: newToken, user: newUser }) {
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    authLogout();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: Boolean(token), loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
}
