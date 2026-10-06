import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "../types";

type AuthValue = {
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const STORAGE_KEY = "jobtracker_user";
const AuthContext = createContext<AuthValue | null>(null);

function loadSavedUser(): User | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  // Reading the saved user here means a page refresh does not log the person out.
  const [currentUser, setCurrentUser] = useState<User | null>(loadSavedUser);

  const login = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}