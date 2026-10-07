import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

// 🎯 Named Export
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  // 1. Token அல்லது User விவரங்கள் இல்லை என்றால் Login பக்கத்திற்குத் திருப்பிவிடும்
  if (!token || !userStr) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Control (RBAC) சரிபார்ப்பு
  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(userStr);
      const userRole = (user.role || '').toLowerCase();
      const hasPermission = allowedRoles.some(role => role.toLowerCase() === userRole);

      if (!hasPermission) {
        // அனுமதி இல்லாத பயனர்களை Dashboard-க்குத் திருப்பிவிடும்
        return <Navigate to="/dashboard" replace />;
      }
    } catch (e) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

// 🎯 Default Export (இரண்டு விதமான Import முறைகளுக்கும் வேலை செய்யும்)
export default ProtectedRoute;