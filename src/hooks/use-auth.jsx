import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser, getToken, logout as authLogout } from "@/services/mock-api";

const AuthContext = createContext(null);
const USER_KEY = "lorekeeper_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setToken] = useState(getToken());

  // Keep auth state in sync when storage changes (e.g. logout in another tab).
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

  /**
   * Local-only profile update. There is no user endpoint yet, so the change is
   * written to storage and to context in one step — no reload required.
   */
  function updateProfile(values) {
    setUser((current) => {
      if (!current) return current;

      const next = { ...current, ...values };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }

  function logout() {
    authLogout();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: Boolean(token), loginSuccess, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
