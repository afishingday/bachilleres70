import { Link, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Layout({ children }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate('/login');
  }

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm transition-colors leading-snug ${
      isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <Link to="/" className="font-bold text-lg text-white hover:text-gray-100">Gen 70 · Admin</Link>
          <p className="text-xs text-gray-500 mt-1">Gestión del portal público</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5" aria-label="Principal">
          <NavLink to="/" end className={linkClass}>
            Inicio — resumen
          </NavLink>
          <NavLink to="/estudiantes" className={linkClass}>
            Estudiantes
          </NavLink>
          <NavLink to="/pendientes" className={linkClass}>
            Revisión de contenido
          </NavLink>
          <NavLink to="/solicitudes-borrado" className={linkClass}>
            Solicitudes Ley 1581
          </NavLink>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <a
            href="/#inicio"
            target="_blank"
            rel="noreferrer"
            className="block text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-800 mb-2"
          >
            Ver portal público ↗
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
    </div>
  );
}
