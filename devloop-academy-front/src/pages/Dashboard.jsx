import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeCourses, setActiveCourses] = useState([]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) return;
      
      // 1. Traemos todo el progreso del usuario
      const { data: progress } = await supabase
        .from('user_progress')
        .select('course_id, last_lesson_id')
        .eq('user_id', user.id);

      if (progress && progress.length > 0) {
        const uniqueCourseIds = [...new Set(progress.map(p => p.course_id))];
        
        // 2. Traemos la info de los cursos
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .in('id', uniqueCourseIds);

        // 3. Traemos TODAS las lecciones de esos cursos para saber el total
        const { data: allLessons } = await supabase
          .from('lessons')
          .select('course_id')
          .in('course_id', uniqueCourseIds);

        // 4. Calculamos el porcentaje para cada curso
        const coursesWithProgress = courses.map(course => {
          // Cuántas lecciones en total tiene este curso
          const totalLessons = allLessons.filter(l => l.course_id === course.id).length;
          // Cuántas lecciones ha completado el usuario de este curso
          const completedLessons = progress.filter(p => p.course_id === course.id).length;
          
          // Calculamos el % (evitando dividir por cero)
          const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

          return {
            ...course,
            progressPercentage: percentage,
            completedCount: completedLessons,
            totalCount: totalLessons
          };
        });
          
        setActiveCourses(coursesWithProgress);
      }
    };

    fetchMyCourses();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 px-4">
      
      {/* Header del Dashboard */}
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
        
        {/* === COLUMNA IZQUIERDA: TARJETA DE PERFIL === */}
        <div className="bg-black/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-800 p-6 flex flex-col items-center text-center">
          
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-900 border-4 border-gray-800 shadow-md mb-4 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-20 h-20 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>

          {/* Info del usuario */}
          <h2 className="text-xl font-bold text-white">{profile?.full_name || 'Estudiante'}</h2>
          <span className="text-sm font-medium text-blue-400 bg-blue-900/20 border border-blue-900/30 px-3 py-1 rounded-full mt-2">
            {profile?.headline || 'Aprendiz en DevLoop'}
          </span>
          <p className="text-gray-400 text-sm leading-relaxed mt-6">
            {profile?.description || 'Aún no has añadido una descripción a tu perfil profesional.'}
          </p>

          {/* Botones de Acción (Integrados y organizados) */}
          <div className="mt-6 w-full flex flex-col gap-3">
            
            {/* 1. Botón de LinkedIn (Solo se muestra si hay URL) */}
            {profile?.linkedin_url && (
              <a 
                href={profile.linkedin_url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
              >
                Perfil Profesional
              </a>
            )}

            {/* 2. Botón de Editar Perfil */}
            <button 
              onClick={() => navigate('/edit-profile')}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors border border-gray-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar Perfil
            </button>
          </div>
        </div>

        {/* === COLUMNA DERECHA: PROGRESO Y ESTADO === */}
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
          
          {/* Cursos en Progreso */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Mis Cursos Activos</h3>
            
            {activeCourses.length === 0 ? (
              <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 text-center">
                <p className="text-gray-500">Aún no has empezado ningún curso.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="mt-4 text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  Explorar la academia &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCourses.map(course => (
                  <div key={course.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors group cursor-pointer" onClick={() => navigate(`/course/${course.id}/menu`)}>
                    <div className="h-24 overflow-hidden relative">
                      <img src={course.image_url || 'https://via.placeholder.com/400x200'} alt={course.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-bold text-sm mb-3 line-clamp-1">{course.title}</h4>
                      
                      {/* BARRA DE PROGRESO */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-gray-400">
                            {course.completedCount} de {course.totalCount} lecciones
                          </span>
                          <span className="text-blue-400">{course.progressPercentage}%</span>
                        </div>
                        {/* Fondo de la barra */}
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          {/* Relleno de la barra dinámico */}
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${course.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="text-gray-300 hover:text-blue-400 text-xs font-medium flex items-center justify-between transition-colors">
                        Continuar aprendiendo
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}