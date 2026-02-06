import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("lifelens_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("lifelens_user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (nextUser, nextToken) => {
    localStorage.setItem("lifelens_token", nextToken);
    localStorage.setItem("lifelens_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("lifelens_token");
    localStorage.removeItem("lifelens_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

