import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setAuthToken, type AuthUser } from "../lib/api/client";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistSession(token: string, user: AuthUser) {
  await setAuthToken(token);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { default: AsyncStorage } = await import(
          "@react-native-async-storage/async-storage"
        );
        const saved = await AsyncStorage.getItem("@catcal/auth-token");
        if (!saved || !mounted) return;
        setToken(saved);
        const { profile } = await api.me();
        if (mounted) {
          setUser({
            id: profile.id,
            fullName: profile.fullName,
            email: profile.email,
            activeCatId: profile.activeCatId,
            createdAt: profile.createdAt,
          });
        }
      } catch {
        await setAuthToken(null);
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email.trim(), password);
    await persistSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const result = await api.register(fullName.trim(), email.trim(), password);
      await persistSession(result.token, result.user);
      setToken(result.token);
      setUser(result.user);
    },
    []
  );

  const refreshUser = useCallback(async () => {
    const { profile } = await api.me();
    setUser({
      id: profile.id,
      fullName: profile.fullName,
      email: profile.email,
      activeCatId: profile.activeCatId,
      createdAt: profile.createdAt,
    });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Clear local session even if server logout fails.
    }
    await setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      signIn,
      signUp,
      signOut,
      refreshUser,
    }),
    [user, token, isLoading, signIn, signUp, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
