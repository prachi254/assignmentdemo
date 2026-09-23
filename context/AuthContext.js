"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "@/lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const syncStoredUser = () => {
      const token = localStorage.getItem("pad_token");
      const rawUser = localStorage.getItem("pad_user");

      if (token && rawUser) {
        try {
          setUser(JSON.parse(rawUser));
          setStatus("authenticated");
        } catch {
          setStatus("guest");
        }
      } else {
        setStatus("guest");
      }

    };

    const syncTask = window.setTimeout(syncStoredUser, 0);
    return () => window.clearTimeout(syncTask);
  }, []);

  async function login(username, password) {
    const data = await loginRequest(username, password);
    const { token, ...userInfo } = data;

    localStorage.setItem("pad_token", token);
    localStorage.setItem("pad_user", JSON.stringify(userInfo));
    document.cookie = `pad_token=${token}; path=/; max-age=3600`;
    setUser(userInfo);
    setStatus("authenticated");
    return userInfo;
  }

  function logout() {
    localStorage.removeItem("pad_token");
    localStorage.removeItem("pad_user");
    document.cookie = "pad_token=; path=/; max-age=0";
    setUser(null);
    setStatus("guest");
  }

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
