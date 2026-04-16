import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth(); // Ya no necesitamos 'user' aquí para el bloqueo
  
  const [content, setContent] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchFullLesson = async () => {
      setLoading(true);

      // 1. Determinar si el usuario tiene acceso total
      const activeStatus = profile?.is_active || false;
      setIsActive(activeStatus);

      // 2. Traer info de la lección desde Supabase (Fila de la BD)
      const lessonQuery = activeStatus ? id : 'preview-general';
      // Revisar si ya está completada (solo si hay usuario y está activo)
      // Revisar si esta lección ya está en el progreso del usuario
      if (user && activeStatus) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', user.id)
          .eq('last_lesson_id', id) // <-- Asegúrate de usar tu nombre de columna correcto aquí
          .maybeSingle(); // Usamos maybeSingle para que no arroje error si no encuentra nada
        
        // Si encontró un registro, el botón aparecerá en verde automáticamente
        setIsCompleted(!!progress); 
      }
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonQuery)
        .single();

      if (error || !lesson) {
        console.error("Lección no encontrada en la base de datos.");
      } else {
        setLessonData(lesson);
      }

      // 3. Cargar el Markdown dinámico (Desde Supabase Storage)
      try {
        const urlToFetch = lesson?.markdown_url; 

        // Si la base de datos no tiene un link para esta lección, lanzamos error
        if (!urlToFetch) {
          throw new Error("No hay URL de contenido configurada.");
        }

        const response = await fetch(urlToFetch);
        
        // Si el Storage de Supabase responde con error o da un HTML en lugar de texto
        if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
          throw new Error("Archivo Markdown no encontrado en la nube.");
        }

        const text = await response.text();
        setContent(text);

      } catch (err) {
        console.log("Activando modo de emergencia:", err.message);
        
        // 4. CAÍDA DE EMERGENCIA: Cargar el not-found local
        try {
          const fallback = await fetch(`${import.meta.env.BASE_URL}lessons/not-found.md`);
          const fallbackText = await fallback.text();
          setContent(fallbackText);
        } catch {
          setContent("# 🚧 Error\nNo se encontró el contenido de la lección.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFullLesson();
  }, [id, profile]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  const toggleProgress = async () => {
    if (!user || !lessonData) return;
    setCompleting(true);

    try {
      if (isCompleted) {
        // Desmarcar
        await supabase.from('user_progress').delete()
          .eq('user_id', user.id).eq('lesson_id', id);
        setIsCompleted(false);
      } else {
        // Marcar como completada
        await supabase.from('user_progress').insert([{
          user_id: user.id,
          last_lesson_id: id,
          course_id: lessonData.course_id // Asegúrate de que tus lecciones tengan el course_id en la BD
        }]);
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error actualizando progreso", error);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        
        {/* VIDEO DINÁMICO DESDE SUPABASE */}
        <div className="aspect-video w-full bg-gray-900 border-b border-gray-800 relative">
          {lessonData?.video_id ? (
            <iframe 
              src={`https://www.youtube.com/embed/${lessonData.video_id}`} 
              className="w-full h-full"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Video no disponible
            </div>
          )}
          
          {!isActive && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg">
              Contenido de Muestra
            </div>
          )}
        </div>

        <div className="p-8 md:p-12">
          {/* Título dinámico */}
          <h1 className="text-3xl font-bold text-white mb-6">
            {lessonData?.title || 'Cargando...'}
          </h1>

          <div className="prose prose-invert prose-lg max-w-none 
            prose-headings:text-blue-400 prose-strong:text-purple-400
            [&_:not(pre)>code]:text-yellow-300 [&_:not(pre)>code]:bg-gray-800 [&_:not(pre)>code]:px-2 [&_:not(pre)>code]:py-1 [&_:not(pre)>code]:rounded-md
          ">
            <ReactMarkdown
               components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  return (
                    <code className={`${className || ''} !bg-gray-800 !text-yellow-300 !px-2 !py-1 !rounded-md`} {...rest}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
          {/* Botón de Progreso (Solo visible para activos) */}
          {isActive && (
            <div className="mt-12 pt-8 border-t border-gray-800 flex justify-end">
              <button
                onClick={toggleProgress}
                disabled={completing}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isCompleted 
                    ? 'bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600/30' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {completing ? 'Guardando...' : isCompleted ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lección Completada
                  </>
                ) : (
                  'Marcar como terminada'
                )}
              </button>
            </div>
          )}
          {/* Sección de Suscripción / Registro para visitantes */}
          {!isActive && (
            <div className="mt-16 p-8 md:p-12 border border-blue-900/30 bg-blue-900/5 rounded-2xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
              
              <div className="max-w-md mx-auto space-y-6">
                <h4 className="text-white font-bold text-2xl tracking-tight">
                  ¿Listo para empezar tu carrera?
                </h4>
                
                <p className="text-gray-400 text-base leading-relaxed">
                  Crea una cuenta para realizar un seguimiento de tu progreso, acceder a los archivos de proyecto y desbloquear todas las lecciones técnicas.
                </p>

                <div className="pt-4">
                  <button 
                    onClick={() => navigate('/login')}
                    className="group relative inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-900/40"
                  >
                    <span>Registrarme para aprender</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 uppercase tracking-widest pt-2">
                  Únete a más de 500 estudiantes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}