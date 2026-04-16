import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { profile, isAdmin } = useAuth();

  // Si aún está cargando el perfil, no hagas nada
  if (!profile) return null; 

  // Si no es admin, mándalo al dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}