import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importamos tu contexto global
import { supabase } from '../lib/supabaseClient';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // AÑADIDO: Extraemos 'profile' para poder validar si es 'teacher'
  const { user, profile, isAdmin } = useAuth(); 
  const navigate = useNavigate();

  // Constante para saber si tiene acceso al panel de docente
  const isTeacher = profile?.role === 'teacher';

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
          <Link to="/" className="text-l font-semibold tracking-tighter hover:text-blue-400 flex items-center gap-0">
            <img 
              src="https://yrqewcxcaoqxvmjzpmth.supabase.co/storage/v1/object/public/images/Logo%20DevLoop.png" 
              alt="DevLoop Academy Logo" 
              className="h-8 w-auto object-contain transition-transform hover:scale-105"
            />Academy
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
                      className="text-black/80 bg-cyan-200/60 border border-blue-900 px-5 py-1 rounded-md text-xs font-bold hover:bg-blue-900/10 hover:text-white/80 transition-all uppercase tracking-wider"
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}

                {/* NUEVO: BOTÓN PARA DOCENTES Y ADMINS */}
                {(isTeacher || isAdmin) && (
                  <li>
                    <Link 
                      to="/teacher" 
                      className="flex items-center gap-1.5 text-purple-400 bg-purple-900/10 border border-purple-900/30 px-3 py-1 rounded-md text-xs font-bold hover:bg-purple-900/40 transition-all uppercase tracking-wider"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Docente
                    </Link>
                  </li>
                )}

                <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Mi Panel</Link></li>
                
                <li>
                  <button 
                    onClick={handleLogout}
                    className="text-red-400 bg-red-900/20 border border-red-900/30 px-3 py-1 rounded-md text-xs font-bold hover:bg-red-900/40 transition-all uppercase tracking-wider"
                  >
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/login" className="text-green-400 bg-green-900/20 border border-green-900/30 px-3 py-1 rounded-md text-xs font-bold hover:bg-green-900/40 transition-all uppercase tracking-wider">
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
                        className="p-3 text-cyan-300 bg-cyan-900/20 rounded-lg block font-bold" 
                        onClick={() => setIsOpen(false)}
                      >
                        🛡️ Panel de Administración
                      </Link>
                    </li>
                  )}
                  
                  {/* NUEVO: ENLACE MÓVIL PARA DOCENTES */}
                  {(isTeacher || isAdmin) && (
                    <li>
                      <Link 
                        to="/teacher" 
                        className="p-3 text-purple-400 bg-purple-900/10 rounded-lg block font-bold" 
                        onClick={() => setIsOpen(false)}
                      >
                        🎓 Panel de Docente
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