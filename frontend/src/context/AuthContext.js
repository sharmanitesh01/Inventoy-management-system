import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (savedUser && savedToken) setUser(JSON.parse(savedUser));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, jwt) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Role helpers
  const isPlatformOwner = user?.role === 'platform_owner';
  const isCompanyOwner  = user?.role === 'company_owner';
  const isCompanyAdmin  = user?.role === 'company_admin';
  const isManager       = user?.role === 'manager';
  const isStaff         = user?.role === 'staff';
  const isAdminUp       = ['platform_owner','company_owner','company_admin'].includes(user?.role);

  // Permission checker
  const can = (perm) => {
    if (!user) return false;
    if (user.permissions?.includes('*')) return true;
    if (user.permissions?.includes(perm)) return true;
    const ns = perm.split('.')[0];
    return user.permissions?.includes(`${ns}.*`);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      isPlatformOwner, isCompanyOwner, isCompanyAdmin, isManager, isStaff, isAdminUp,
      can,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
