import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/" />; // Or unauthorized page
  
  return <>{children}</>;
}