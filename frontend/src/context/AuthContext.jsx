import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getTokens, setTokens } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getTokens()));

  useEffect(() => {
    let active = true;
    if (!getTokens()) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me/")
      .then((res) => active && setUser(res.data))
      .catch(() => active && setTokens(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login/", { email, password });
    setTokens({ access: res.data.access, refresh: res.data.refresh });
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const res = await api.post("/auth/signup/", payload);
    setTokens({ access: res.data.access, refresh: res.data.refresh });
    setUser(res.data.user || null);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}