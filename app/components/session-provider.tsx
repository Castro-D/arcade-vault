"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  appendScore,
  clearUser,
  readUser,
  writeUser,
  type SavedScore,
  type SessionUser,
} from "@/app/lib/session";

type SessionContextValue = {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Starts as guest so server and first client render match; the stored user loads after mount.
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage only exists on the client; deferring avoids a hydration mismatch
    setUser(readUser());
  }, []);

  const login = useCallback((u: SessionUser) => {
    setUser(u);
    writeUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearUser();
  }, []);

  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => {
    appendScore(entry);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, saveScore }),
    [user, login, logout, saveScore],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
