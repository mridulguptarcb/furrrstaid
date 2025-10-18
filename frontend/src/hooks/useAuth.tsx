import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    token: null,
  });

  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (token) {
      setAuthState({
        isAuthenticated: true,
        userId,
        token,
      });
    }
  }, []);

  const login = (token: string, userId: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    
    setAuthState({
      isAuthenticated: true,
      userId,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    setAuthState({
      isAuthenticated: false,
      userId: null,
      token: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};

export default useAuth;