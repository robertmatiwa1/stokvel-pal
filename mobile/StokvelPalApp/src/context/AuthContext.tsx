import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { login as apiLogin, register as apiRegister } from "../api/endpoints";
import { getToken, saveToken, clearToken } from "../api/tokenStore";

type AuthContextValue = {
  token: string | null;
  isReady: boolean;
  signIn: (phone: string, pin: string) => Promise<void>;
  signUp: (phone: string, pin: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setTokenUnsafe: (token: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await getToken();
        setToken(stored);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const signIn = async (phone: string, pin: string) => {
    const res = await apiLogin(phone, pin);
    await saveToken(res.token);
    setToken(res.token);
  };

  const signUp = async (phone: string, pin: string, username: string) => {
    const res = await apiRegister(phone, pin, username);
    await saveToken(res.token);
    setToken(res.token);
  };

  const signOut = async () => {
    await clearToken();
    setToken(null);
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      token,
      isReady,
      signIn,
      signUp,
      signOut,
      setTokenUnsafe: setToken,
    };
  }, [token, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
