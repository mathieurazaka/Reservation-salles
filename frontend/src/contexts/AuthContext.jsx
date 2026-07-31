import { createContext, useEffect, useState, useCallback } from "react";
import { pb } from "../services/pocketbase";

export const AuthContext = createContext(null);

/**
 * Fournit l'utilisateur connecté (pb.authStore) à toute l'application
 * et se resynchronise automatiquement quand le SDK PocketBase change
 * d'état (connexion, déconnexion, refresh de token, autre onglet...).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.record);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // pb.authStore.onChange écoute tout changement d'état d'authentification
    const unsubscribe = pb.authStore.onChange((token, record) => {
      setUser(record);
    }, true);
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // Appel natif du SDK PocketBase : authentification par mot de passe
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);
      setUser(authData.record);
      return authData.record;
    } catch (err) {
      setError(err?.message || "Identifiants incorrects.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    pb.authStore.clear();
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role || null, // "teacher" | "association" | "logistics" | "admin"
    isAuthenticated: pb.authStore.isValid,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
