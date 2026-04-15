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

          {/* Botón Móvil */}
          <div className="md:hidden flex items-center gap-4">
             {/* ... (tu botón hamburguesa actual) ... */}
          </div>
        </div>
      </div>
    </nav>
  );
}