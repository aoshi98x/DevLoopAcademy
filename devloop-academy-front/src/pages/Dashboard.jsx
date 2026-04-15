import { useAuth } from '../contexts/AuthContext'; // 1. Importar el hook
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, profile } = useAuth(); // 2. ¡Traer los datos al instante!
  const navigate = useNavigate();

  // Redirigir si no hay usuario (ahora es instantáneo)
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);
  
  if (!profile) return null; // Prevenir render antes de redirección

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 px-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Mi Panel</h1>
          <p className="text-gray-400 mt-1">Bienvenido de nuevo a DevLoop.</p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => navigate('/login'))}
          className="text-sm bg-gray-800 hover:bg-red-900/40 text-gray-400 hover:text-red-400 px-4 py-2 rounded-lg transition-all border border-gray-700"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tarjeta de Perfil Dinámica */}
        <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-800 p-6 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-900 border-4 border-gray-800 shadow-md mb-4 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-20 h-20 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>

          <h2 className="text-xl font-bold text-white">{profile?.full_name || 'Estudiante'}</h2>
          <span className="text-sm font-medium text-blue-400 bg-blue-900/20 border border-blue-900/30 px-3 py-1 rounded-full mt-2">
            {profile?.headline || 'Aprendiz en DevLoop'}
          </span>
          
          <p className="text-gray-400 text-sm leading-relaxed mt-6">
            {profile?.description || 'Aún no has añadido una descripción a tu perfil profesional.'}
          </p>

          <a 
            href={profile?.linkedin_url || '#'} 
            target="_blank" 
            className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
          >
            Perfil Profesional
          </a>
        </div>

        {/* Columna de Progreso */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 p-8">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold text-white">Estado de Cuenta</h3>
               {profile?.is_active ? (
                 <span className="text-green-400 bg-green-900/20 px-3 py-1 rounded-full text-xs font-bold border border-green-900/30">ACTIVO</span>
               ) : (
                 <span className="text-yellow-400 bg-yellow-900/20 px-3 py-1 rounded-full text-xs font-bold border border-yellow-900/30">PENDIENTE DE PAGO</span>
               )}
            </div>
            <p className="text-gray-400 text-sm">
              {profile?.is_active 
                ? 'Tienes acceso total a todos los cursos de la academia.' 
                : 'Tu cuenta está en modo limitado. Adquiere una suscripción para desbloquear el contenido.'}
            </p>
          </div>
          
          {/* Aquí irían los cursos que el usuario tiene iniciados */}
        </div>
      </div>
    </div>
  );
}