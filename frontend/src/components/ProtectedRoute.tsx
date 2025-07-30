import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // In a real app, you would check authentication here
  const isAuthenticated = true; // This would be a state or context value

  if (!isAuthenticated) {
    // In a real app, you would redirect to login
    return <div>Please log in to access this page</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
