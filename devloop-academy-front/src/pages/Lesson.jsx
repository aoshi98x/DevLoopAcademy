import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';

export default function Lesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
        }, [user, navigate]);

        // Ya no necesitas el estado 'loading' ni la petición a Supabase en este archivo.
        
        if (!profile) return null; // Prevenir render antes de redirección
      }
      setIsActive(activeStatus);

      // 2. Traer info de la lección desde Supabase
      // Si no es activo, forzamos la carga de la lección marcada como 'is_preview'
      const lessonQuery = activeStatus ? id : 'preview-general';
      
      const { data: lesson, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonQuery)
        .single();

      if (error || !lesson) {
        console.error("Lección no encontrada en DB");
      } else {
        setLessonData(lesson);
      }

      // 3. Cargar el archivo Markdown correspondiente
      try {
        const fileToFetch = activeStatus ? id : 'preview-general';
        const response = await fetch(`${import.meta.env.BASE_URL}lessons/${fileToFetch}.md`);
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setContent("# Error\nNo se pudo cargar el texto de la lección.");
      } finally {
        setLoading(false);
      }
    };

    fetchFullLesson();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

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
            {lessonData?.title}
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
          {/* Sección de Suscripción / Registro */}
          {!isActive && (
            <div className="mt-16 p-8 md:p-12 border border-blue-900/30 bg-blue-900/5 rounded-2xl text-center shadow-2xl relative overflow-hidden">
              {/* Decoración sutil de fondo */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
              
              <div className="max-w-md mx-auto space-y-6">
                <h4 className="text-white font-bold text-2xl tracking-tight">
                  ¿Listo para empezar tu carrera?
                </h4>
                
                <p className="text-gray-400 text-base leading-relaxed">
                  Crea una cuenta para realizar un seguimiento de tu progreso, acceder a los archivos de proyecto y desbloquear todas las lecciones técnicas.
                </p>

                {/* El botón con separación clara */}
                <div className="pt-4">
                  <button 
                        onClick={() => navigate('/login')}
                        className="group relative inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-900/40"
                      >
                        <span>Registrarme para aprender</span>
                        <svg 
                          className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
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