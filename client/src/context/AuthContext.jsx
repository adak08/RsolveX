import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// ─── Safe JSON parse ──────────────────────────────────────────────────────────
// localStorage can contain the literal string "undefined" if someone did
// localStorage.setItem('key', undefined) — JSON.parse("undefined") throws.
// This helper returns null for any invalid value instead of crashing.
const safeParseJSON = (str) => {
  if (!str || str === 'undefined' || str === 'null') return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

// ─── Socket helpers (dynamic import so socket errors never crash AuthContext) ─
const getSocketSvc = () =>
  import('../services/socketService')
    .then((m) => m.default)
    .catch(() => null);

const initSocket = async (token, userId) => {
  const svc = await getSocketSvc();
  if (!svc) return;
  try {
    svc.init(token);
    if (userId) svc.join(userId);
  } catch (e) {
    console.warn('Socket init failed:', e.message);
  }
};

const disconnectSocket = async () => {
  const svc = await getSocketSvc();
  if (!svc) return;
  try { svc.disconnect(); } catch {}
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    userRole: '',
    userName: '',
    userData: null,
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    // Read raw values
    const adminToken = localStorage.getItem('adminToken');
    const staffToken = localStorage.getItem('staffToken');
    const userToken  = localStorage.getItem('accessToken');

    // Parse safely — never throws even if value is "undefined" or corrupt
    const adminData = safeParseJSON(localStorage.getItem('adminData'));
    const staffData = safeParseJSON(localStorage.getItem('staffData'));
    const userData  = safeParseJSON(localStorage.getItem('user'));

    if (adminToken && adminData) {
      setAuthStatus({
        isAuthenticated: true,
        userRole:  'admin',
        userName:  adminData.name || 'Admin',
        userData:  adminData,
      });
      initSocket(adminToken, adminData._id);

    } else if (staffToken && staffData) {
      setAuthStatus({
        isAuthenticated: true,
        userRole:  'staff',
        userName:  staffData.name || 'Staff',
        userData:  staffData,
      });
      initSocket(staffToken, staffData._id);

    } else if (userToken && userData) {
      setAuthStatus({
        isAuthenticated: true,
        userRole:  'user',
        userName:  userData.name || 'User',
        userData:  userData,
      });
      initSocket(userToken, userData._id);

    } else {
      // Nothing valid in storage — clear any stale/corrupt keys
      if (adminToken && !adminData)  localStorage.removeItem('adminData');
      if (staffToken && !staffData)  localStorage.removeItem('staffData');
      if (userToken  && !userData)   localStorage.removeItem('user');

      setAuthStatus({
        isAuthenticated: false,
        userRole:  '',
        userName:  '',
        userData:  null,
      });
      disconnectSocket();
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('userLogin',  checkAuth);
    window.addEventListener('userLogout', checkAuth);
    return () => {
      window.removeEventListener('userLogin',  checkAuth);
      window.removeEventListener('userLogout', checkAuth);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffData');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    disconnectSocket();
    setAuthStatus({ isAuthenticated: false, userRole: '', userName: '', userData: null });
    window.location.href = '/';
  };

  const getToken = () => {
    if (authStatus.userRole === 'admin') return localStorage.getItem('adminToken');
    if (authStatus.userRole === 'staff') return localStorage.getItem('staffToken');
    return localStorage.getItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ authStatus, loading, checkAuth, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};

export default AuthContext;