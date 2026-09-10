import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/auth.service';
import { tokenStorage } from '../services/api';
import type { User } from '../types/models';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = tokenStorage.get();
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const me = await authService.me();
        if (!cancelled) setUser(me);
      } catch {
        // Token inválido/expirado — limpa e segue como anônimo
        tokenStorage.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await authService.login({ email, password });
    tokenStorage.set(token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user, token } = await authService.register({ name, email, password });
      tokenStorage.set(token);
      setUser(user);
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}