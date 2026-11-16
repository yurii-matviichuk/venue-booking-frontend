import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

// Without `role`, any logged-in user may see the page. With it, only that role may.
export default function RequireAuth({
  children,
  role,
}: {
  children: ReactNode;
  role?: User['role'];
}) {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  if (!initialized) return <div className="p-8">Loading...</div>;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
