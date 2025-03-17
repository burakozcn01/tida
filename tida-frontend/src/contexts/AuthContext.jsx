import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../api/api';

export const AuthContext = createContext(null);

const TOKEN_REFRESH_INTERVAL = 29; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(null);

  const startRefreshTimer = useCallback(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    
    const timer = setInterval(async () => {
      try {
        if (localStorage.getItem('access_token')) {
          await API.auth.refreshToken();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        handleLogout();
      }
    }, TOKEN_REFRESH_INTERVAL * 60 * 1000);
    
    setRefreshTimer(timer);
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const handleLogout = useCallback(() => {
    API.auth.logout();
    setUser(null);
    
    if (refreshTimer) {
      clearInterval(refreshTimer);
      setRefreshTimer(null);
    }
    
    toast.info('You have been logged out successfully');
  }, [refreshTimer]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      if (localStorage.getItem('access_token')) {
        const userData = await API.auth.getCurrentUser();
        setUser(userData);
        setAuthError(null);
        
        startRefreshTimer();
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
      
      return null;
    }
  }, [startRefreshTimer]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchCurrentUser();
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      await API.auth.login(username, password);
      const userData = await fetchCurrentUser();
      
      if (userData) {
        toast.success(`Welcome back, ${userData.username || 'user'}!`);
      }
      
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    
    try {
      await API.auth.register(userData);
      
      if (userData.username && userData.password) {
        return login(userData.username, userData.password);
      }
      
      return true;
    } catch (error) {
      const errorData = error.response?.data || {};
      let errorMessage = 'Registration failed.';
      
      if (typeof errorData === 'object') {
        const errorList = [];
        
        for (const [field, messages] of Object.entries(errorData)) {
          if (Array.isArray(messages)) {
            errorList.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            errorList.push(`${field}: ${messages}`);
          }
        }
        
        if (errorList.length > 0) {
          errorMessage = errorList.join('\n');
        }
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const isAuthenticated = !!user && !!localStorage.getItem('access_token');

  const contextValue = {
    user,
    loading,
    error: authError,
    login,
    register,
    logout: handleLogout,
    updateUser,
    isAuthenticated,
    refreshUser: fetchCurrentUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;