import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importamos tu contexto global
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin } = useAuth(); // Obtenemos el usuario y el rol admin del contexto
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="text-xl font-bold tracking-tighter hover:text-blue-400 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-sm">DL</div>
            DevLoop Academy
          </Link>

          {/* Menú Desktop */}
          <ul className="hidden md:flex items-center space-x-6 font-medium">
            <li><Link to="/" className="hover:text-blue-400 transition-colors">Inicio</Link></li>
            
            {user ? (
              <>
                {/* BOTÓN SOLO PARA ADMINS */}
                {isAdmin && (
                  <li>
                    <Link 
                      to="/admin" 
                      className="text-red-400 bg-red-900/20 border border-red-900/30 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-900/40 transition-all uppercase tracking-wider"
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}

                <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Mi Panel</Link></li>
                
                <li>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 text-sm">
                  Acceso
                </Link>
              </li>
            )}
          </ul>

          {/* Botón Hamburguesa Móvil */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Menú Móvil */}
        {isOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 pb-4 pt-2 animate-in fade-in slide-in-from-top-2">
            <ul className="flex flex-col space-y-3 px-2">
              <li>
                <Link to="/" className="p-3 hover:bg-gray-800 rounded-lg block" onClick={() => setIsOpen(false)}>Inicio</Link>
              </li>
              
              {user ? (
                <>
                  {isAdmin && (
                    <li>
                      <Link 
                        to="/admin" 
                        className="p-3 text-red-400 bg-red-900/10 rounded-lg block font-bold" 
                        onClick={() => setIsOpen(false)}
                      >
                        🛡️ Panel de Administración
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/dashboard" className="p-3 hover:bg-gray-800 rounded-lg block" onClick={() => setIsOpen(false)}>Mi Panel</Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left p-3 text-red-500 hover:bg-red-900/10 rounded-lg font-medium"
                    >
                      Cerrar Sesión
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="m-2 bg-blue-600 p-3 rounded-lg block text-center font-bold" onClick={() => setIsOpen(false)}>Acceso</Link>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}