import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.defaults.baseURL = "http://localhost:4000";
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (username, password) => {
    const { data } = await axios.post("http://localhost:4000/api/auth/login", {
      username,
      password,
    });
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (username, password) => {
    await axios.post("http://localhost:4000/api/auth/register", {
      username,
      password,
    });
    return login(username, password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
