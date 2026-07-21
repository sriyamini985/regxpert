import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import React from 'react';

// Use React.ReactElement instead of JSX.Element
interface PrivateRouteProps {
  children: React.ReactElement;
  role: string;
}

const PrivateRoute = ({ children, role }: PrivateRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to the appropriate login page based on the intended role
    if (role === "admin") return <Navigate to="/admin-login" replace />;
    if (role === "client") return <Navigate to="/client-login" replace />;
    // If it's a regular user, you might want to redirect to a general login or conference page
    return <Navigate to="/" replace />; 
  }

  if (user.role !== role) {
    // If user is logged in but doesn't have the required role, redirect them to the correct login route to re-authenticate
    if (role === "admin") return <Navigate to="/admin-login" replace />;
    if (role === "client") return <Navigate to="/client-login" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;