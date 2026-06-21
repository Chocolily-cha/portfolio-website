import { Navigate, Outlet } from 'react-router-dom';
import { checkAdminAccess } from '../utils/urlUtils';

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = '/' }: ProtectedRouteProps) => {
  const hasAccess = checkAdminAccess();
  
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
