import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, setAuthToken } from './api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'sirus.auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.token) setAuthToken(saved.token);
      return saved;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  // Validate the stored token on load.
  useEffect(() => {
    let active = true;
    (async () => {
      if (auth?.token) {
        try {
          const { data } = await api.get('/auth/me');
          if (active) persist({ token: auth.token, user: data.user });
        } catch {
          if (active) persist(null);
        }
      }
      if (active) setReady(true);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((next) => {
    setAuth(next);
    setAuthToken(next?.token);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/auth/login', { email, password });
      persist({ token: data.token, user: data.user });
      return data.user;
    },
    [persist]
  );

  const signup = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/signup', payload);
      persist({ token: data.token, user: data.user });
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => persist(null), [persist]);

  return (
    <AuthContext.Provider value={{ user: auth?.user || null, token: auth?.token || null, ready, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
