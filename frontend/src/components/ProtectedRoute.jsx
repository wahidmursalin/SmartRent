import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

// Usage: <ProtectedRoute allowedRoles={["landlord"]}><LandlordDashboard /></ProtectedRoute>
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading text="Checking authentication..." />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role -> send to their own dashboard
    const redirectPath = user.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
