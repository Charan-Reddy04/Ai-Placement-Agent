import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campuspilot_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [studentProfile, setStudentProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campuspilot_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('campuspilot_token');
      if (storedToken) {
        try {
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            setStudentProfile(data.profile || null);
            setToken(storedToken);
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid token:', err.message);
          setUser(null);
          setStudentProfile(null);
          setToken(null);
          localStorage.removeItem('campuspilot_token');
          localStorage.removeItem('campuspilot_user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setStudentProfile(data.profile || null);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Register student handler
  const register = async (studentData) => {
    setIsLoading(true);
    try {
      const data = await authService.register(studentData);
      setUser(data.user);
      setStudentProfile(data.profile || null);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Bootstrap master admin handler
  const bootstrapAdmin = async (adminData) => {
    setIsLoading(true);
    try {
      const data = await authService.bootstrapAdmin(adminData);
      setUser(data.user);
      setStudentProfile(null);
      setToken(data.token);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setStudentProfile(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentProfile,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isLoading,
        login,
        register,
        bootstrapAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

