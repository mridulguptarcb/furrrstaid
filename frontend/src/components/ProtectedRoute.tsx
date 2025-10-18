import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('token') !== null;

  useEffect(() => {
    // Check if token exists but is expired or invalid
    // This is a simple implementation - in a real app, you might want to validate the token
    if (isAuthenticated) {
      // You could add token validation logic here
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;