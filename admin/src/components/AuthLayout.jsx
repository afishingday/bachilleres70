import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

/**
 * Un solo nivel de layout con auth evita dos <Route element> sin path seguidos,
 * que en RR6 puede dejar rutas sin match y pantalla en blanco.
 */
export default function AuthLayout() {
  const { user } = useAuth();

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500">Cargando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
