import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Escuchar cambios en la autenticación (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg mb-8 sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold tracking-wider hover:text-blue-400">
            DevLoop Academy
          </Link>

          {/* Menú Desktop */}
          <ul className="hidden md:flex items-center space-x-8 font-medium">
            <li><Link to="/" className="hover:text-blue-400 transition-colors">Inicio</Link></li>
            {user ? (
              <>
                <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Panel</Link></li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-900/20 text-red-400 border border-red-900/30 px-4 py-1.5 rounded-lg hover:bg-red-900/40 transition-all text-sm"
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li><Link to="/login" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Acceso</Link></li>
            )}
          </ul>

          {/* Botón Hamburguesa Móvil */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Menú Móvil */}
        {isOpen && (
          <ul className="md:hidden bg-gray-800 border-t border-gray-700 py-4 space-y-4">
            <li className="px-4"><Link to="/" className="hover:text-blue-400 transition-colors block" onClick={() => setIsOpen(false)}>Inicio</Link></li>
            {user ? (
              <>
                <li className="px-4"><Link to="/dashboard" className="hover:text-blue-400 transition-colors block" onClick={() => setIsOpen(false)}>Panel</Link></li>
                <li className="px-4">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left bg-red-900/20 text-red-400 border border-red-900/30 px-4 py-2 rounded-lg hover:bg-red-900/40 transition-all text-sm"
                  >
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="px-4"><Link to="/login" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors block text-center" onClick={() => setIsOpen(false)}>Acceso</Link></li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}