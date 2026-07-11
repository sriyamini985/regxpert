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
    if (role === "admin") return <Navigate to="/admin-login" />;
    if (role === "client") return <Navigate to="/client-login" />;
    // If it's a regular user, you might want to redirect to a general login or conference page
    return <Navigate to="/" />; 
  }

  if (user.role !== role) {
    return <Navigate to="/not-found" />;
  }

  return children;
};

export default PrivateRoute;