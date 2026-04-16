import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function CourseMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seguridad: Si no hay usuario o no está activo, lo devolvemos a la portada
    if (!user || !profile?.is_active) {
      navigate(`/course/${id}`);
      return;
    }

    const fetchCourseData = async () => {
      setLoading(true);

      // 1. Info del curso para la cabecera
      const { data: courseData } = await supabase
        .from('courses')
        .select('title, description')
        .eq('id', id)
        .single();
        
      if (courseData) setCourse(courseData);

      // 2. Traer las lecciones vinculadas a este curso
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('id, title, is_preview')
        .eq('course_id', id)
        .order('order_index', { ascending: true }); // Ordenamos por el índice

      if (error) {
        console.error("Error cargando lecciones:", error);
      } else {
        setLessons(lessonsData || []);
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [id, user, profile, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Cabecera */}
      <div className="mb-10 border-b border-gray-800 pb-8">
        <Link 
          to={`/course/${id}`}
          className="text-blue-500 hover:text-blue-400 text-sm font-medium mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la portada del curso
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">{course?.title || 'Contenido del Curso'}</h1>
        <p className="text-gray-400">{course?.description}</p>
      </div>

      {/* Lista de Lecciones */}
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-widest text-sm">Lecciones disponibles</h3>
        
        {lessons.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Aún no hay lecciones publicadas en este curso.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Link 
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                className="group flex items-center justify-between bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 p-4 rounded-xl transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  {/* Círculo con el número */}
                  <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                    {index + 1}
                  </div>
                  
                  <h4 className="text-gray-200 font-medium group-hover:text-white transition-colors">
                    {lesson.title}
                  </h4>
                </div>

                {/* Ícono de Play */}
                <div className="text-gray-600 group-hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}