import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  // 1. Not logged in -> Redirect to auth and save return url
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. Role validation (if roles are passed)
  if (allowedRoles.length > 0 && profile) {
    // If the DB hasn't synced the role yet, default to 'customer'
    const userRole = profile.role || 'customer';
    
    if (!allowedRoles.includes(userRole)) {
      // Unauthorized for this specific route -> Send to their dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
