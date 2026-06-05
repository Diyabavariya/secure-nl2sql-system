import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import { loginUser, registerUser, getMe } from '../api/authApi';
import { getRoleCatalog } from '../api/queryApi';
import {
  DEFAULT_ROLE,
  PAGE_ACCESS,
  getDefaultRole,
  getRoleBadgeClass,
  getRoleDefinition,
  getRoleLabel,
  getRoleOptions,
  normalizeRole,
  canAccess,
  canExecuteQuery,
} from '../config/rbac';

const TOKEN_KEY = 'qs_token';
const USER_KEY  = 'qs_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [roleCatalog, setRoleCatalog] = useState([]);
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleError,   setRoleError]   = useState('');

  const [authState, setAuthState] = useState(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user  = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      if (token && user?.email && user?.role) {
        return { user, role: user.role, token, isAuthenticated: true };
      }
    } catch {
      // Ignore corrupted storage
    }
    return { user: null, role: DEFAULT_ROLE, token: null, isAuthenticated: false };
  });

  useEffect(() => {
    let isActive = true;

    async function loadRoleCatalog() {
      try {
        const data = await getRoleCatalog();
        if (!isActive) return;
        const roles = Array.isArray(data?.roles) ? data.roles : [];
        setRoleCatalog(roles);
        setRoleError('');
        const fallbackRole = getDefaultRole(roles);
        setAuthState((current) => ({
          ...current,
          role: current.role ? normalizeRole(current.role) || fallbackRole : fallbackRole,
        }));
      } catch (error) {
        if (!isActive) return;
        setRoleError(error?.message || 'Unable to load backend role catalog.');
        setRoleCatalog([]);
      } finally {
        if (isActive) setRoleLoading(false);
      }
    }

    if (authState.token) {
      getMe(authState.token).catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState({ user: null, role: DEFAULT_ROLE, token: null, isAuthenticated: false });
      });
    }

    loadRoleCatalog();
    return () => { isActive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeRoleCatalog = useMemo(
    () =>
      roleCatalog.length > 0
        ? roleCatalog
        : getRoleOptions().map((entry) => ({
            role: entry.value,
            label: entry.label,
            description: entry.description,
            pages: PAGE_ACCESS[entry.value] ?? ['dashboard', 'history'],
            canExecuteQuery: entry.value !== 'viewer',
            badgeClass: getRoleBadgeClass(entry.value),
          })),
    [roleCatalog],
  );

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    try {
      const data = await loginUser(email, password);
      const { access_token, user } = data;

      localStorage.setItem(TOKEN_KEY, access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setAuthState({
        user,
        role: normalizeRole(user.role) || user.role,
        token: access_token,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (email, password, role) => {
    if (!email || !password || !role) {
      return { success: false, error: 'Email, password, and role are required.' };
    }
    try {
      const data = await registerUser(email, password, role);
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({ user: null, role: getDefaultRole(roleCatalog), token: null, isAuthenticated: false });
  }, [roleCatalog]);

  const roleDefinition = useMemo(
    () => getRoleDefinition(authState.role, activeRoleCatalog),
    [authState.role, activeRoleCatalog],
  );

  const contextValue = useMemo(
    () => ({
      user:                 authState.user,
      role:                 authState.role,
      token:                authState.token,
      roleLabel:            roleDefinition?.label      ?? getRoleLabel(authState.role),
      roleBadgeClass:       roleDefinition?.badgeClass ?? getRoleBadgeClass(authState.role),
      isAuthenticated:      authState.isAuthenticated,
      isRoleCatalogLoading: roleLoading,
      roleCatalogError:     roleError,
      roleOptions:          getRoleOptions(activeRoleCatalog),
      hasRole:      (expectedRole) => normalizeRole(authState.role) === normalizeRole(expectedRole),
      canAccess:    (pageKey)      => canAccess(authState.role, pageKey),
      canExecuteQuery: ()          => canExecuteQuery(authState.role),
      login,
      register,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      authState.user,
      authState.role,
      authState.token,
      authState.isAuthenticated,
      roleDefinition,
      roleLoading,
      roleError,
      activeRoleCatalog,
      login,
      register,
      logout,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth() must be used inside <AuthProvider>. Check App.jsx.');
  return context;
}
