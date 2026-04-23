import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [content, setContent] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false); // Cambiado de isActive a hasAccess
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchFullLesson = async () => {
      // 1. Esperar a que el perfil cargue antes de tomar decisiones
      if (user && !profile) return;

      setLoading(true);

      try {
        // 2. Traer la lección real primero para saber a qué curso pertenece
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('*, courses(is_free)') // Hacemos un join para saber si el curso es gratis
          .eq('id', id)
          .single();

        if (lessonError || !lesson) {
          throw new Error("Lección no encontrada.");
        }

        // 3. DETERMINAR ACCESO: Tiene acceso si el curso es gratis O si el perfil está activo
        const canAccess = lesson.courses?.is_free || profile?.is_active;
        setHasAccess(canAccess);

        // 4. Si no tiene acceso, intentamos cargar el preview, si tiene acceso, cargamos la lección
        const finalLessonData = canAccess ? lesson : null;

        // Si no tiene acceso, buscamos la lección de preview
        if (!canAccess) {
          const { data: preview } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', 'preview-general')
            .single();
          setLessonData(preview);
        } else {
          setLessonData(lesson);

          // 5. Cargar progreso solo si tiene acceso
          if (user) {
            const { data: progress } = await supabase
              .from('user_progress')
              .select('id')
              .eq('user_id', user.id)
              .eq('last_lesson_id', id)
              .maybeSingle();
            setIsCompleted(!!progress);
          }
        }

        // 6. Cargar el Markdown
        const urlToFetch = canAccess ? lesson.markdown_url : (lessonData?.markdown_url || null);

        if (urlToFetch) {
          const response = await fetch(urlToFetch);
          if (!response.ok) throw new Error("Error al descargar MD");
          const text = await response.text();
          setContent(text);
        }

      } catch (err) {
        console.log("Modo de emergencia:", err.message);
        setContent("# 🚧 Contenido no disponible\nNo tienes permisos para ver esta lección o el archivo no existe.");
      } finally {
        setLoading(false);
      }
    };

    fetchFullLesson();
  }, [id, profile, user]);

  const toggleProgress = async () => {
    if (!user || !lessonData) return;
    setCompleting(true);

    try {
      if (isCompleted) {
        await supabase.from('user_progress').delete()
          .eq('user_id', user.id).eq('last_lesson_id', id);
        setIsCompleted(false);
      } else {
        await supabase.from('user_progress').insert([{
          user_id: user.id,
          last_lesson_id: id,
          course_id: lessonData.course_id
        }]);
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error actualizando progreso", error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">

        {/* VIDEO DINÁMICO */}
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

          {!hasAccess && (
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest shadow-lg">
              Contenido de Muestra
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 md:p-12">
          {/* Título dinámico */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-left">
            {lessonData?.title || 'Cargando...'}
          </h1>

          {/* CONTENIDO MARKDOWN CORREGIDO */}
          <div className="w-full overflow-hidden text-left">
            <div className="prose prose-sm sm:prose lg:prose-lg prose-invert max-w-none 
              text-left items-start flex flex-col
              text-white
              prose-p:text-white prose-p:text-left prose-p:w-full
              prose-li:text-white prose-li:text-left
              prose-headings:text-blue-400 prose-headings:text-left prose-headings:w-full
              prose-strong:text-purple-400
              prose-a:text-blue-400 hover:prose-a:text-blue-300
              prose-ol:pl-5 prose-ul:pl-5
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
          </div>

          {/* Botón de Progreso */}
          {hasAccess && (
            <div className="mt-12 pt-8 border-t border-gray-800 flex justify-end">
              <button
                onClick={toggleProgress}
                disabled={completing}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isCompleted
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

          {/* Sección de Suscripción para visitantes */}
          {!hasAccess && (
            <div className="mt-16 p-6 sm:p-10 border border-blue-900/30 bg-blue-900/5 rounded-2xl text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

              <div className="max-w-md mx-auto space-y-6">
                <h4 className="text-white font-bold text-xl sm:text-2xl tracking-tight">
                  ¿Listo para empezar tu carrera?
                </h4>

                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  Crea una cuenta para realizar un seguimiento de tu progreso, acceder a los archivos de proyecto y desbloquear todas las lecciones técnicas.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full group relative inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-900/40"
                  >
                    <span>Registrarme para aprender</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}