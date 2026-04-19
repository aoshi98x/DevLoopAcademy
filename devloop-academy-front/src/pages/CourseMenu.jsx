import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function CourseMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState(null);
  
  // NUEVO: Reloj interno para calcular los 30 minutos en tiempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Actualizar la hora cada minuto (60000 ms) para desbloquear botones automáticamente
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user || !profile?.is_active) {
      navigate(`/course/${id}`);
      return;
    }

    const fetchCourseData = async () => {
      setLoading(true);

      const { data: courseData } = await supabase
        .from('courses')
        .select('title, description')
        .eq('id', id)
        .single();
        
      if (courseData) setCourse(courseData);

      // Traer lecciones (Asegúrate de que la BD ahora tenga 'meeting_time')
      const { data: lessonsData, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true }); 

      if (error) {
        console.error("Error cargando lecciones:", error);
      } else if (lessonsData) {
        const lessonsWithContent = await Promise.all(lessonsData.map(async (lesson) => {
          let content = "*Sin descripción detallada.*";
          if (lesson.markdown_url) {
            try {
              const response = await fetch(lesson.markdown_url);
              if (response.ok) content = await response.text();
            } catch (err) {
              console.error("Error cargando markdown para", lesson.id);
            }
          }
          return { ...lesson, content };
        }));
        setLessons(lessonsWithContent);
      }
      
      setLoading(false);
    };

    fetchCourseData();
  }, [id, user, profile, navigate]);

  const toggleLesson = (lessonId) => {
    setExpandedLesson(prev => prev === lessonId ? null : lessonId);
  };

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
            {lessons.map((lesson, index) => {
              const isExpanded = expandedLesson === lesson.id;

              return (
                <div 
                  key={lesson.id} 
                  className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                >
                  {/* Cabecera del Acordeón */}
                  <button 
                    onClick={() => toggleLesson(lesson.id)}
                    className="w-full group flex items-center justify-between p-4 hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-900/30 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors">
                        {index + 1}
                      </div>
                      
                      <div>
                        <h4 className="text-gray-200 font-medium group-hover:text-white transition-colors">
                          {lesson.title}
                        </h4>
                        {lesson.meeting_url && (
                          <span className="text-xs text-green-400 font-medium mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Sesión en vivo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-gray-600 group-hover:text-blue-400 transition-colors">
                      <svg 
                        className={`w-6 h-6 transform transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-400' : ''}`} 
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Contenido Expandible */}
                  {isExpanded && (
                    <div className="p-6 border-t border-gray-800 bg-gray-900/30">
                      
                      {/* LÓGICA DE BLOQUEO DE REUNIÓN */}
                      {lesson.meeting_url && (
                        <div className="mb-6 pb-6 border-b border-gray-800">
                          {(() => {
                            const hasTime = !!lesson.meeting_time;
                            const meetingDate = hasTime ? new Date(lesson.meeting_time) : null;
                            
                            let isMeetingActive = true;
                            let isMeetingEnded = false;
                            let formattedTime = "";

                            if (meetingDate) {
                              // Tiempos clave en milisegundos
                              const thirtyMinsBefore = new Date(meetingDate.getTime() - (30 * 60 * 1000));
                              const fourHoursAfter = new Date(meetingDate.getTime() + (4 * 60 * 60 * 1000));
                              
                              // Evaluamos en qué etapa estamos
                              isMeetingEnded = currentTime >= fourHoursAfter;
                              isMeetingActive = currentTime >= thirtyMinsBefore && !isMeetingEnded;
                              
                              if (!isMeetingActive && !isMeetingEnded) {
                                formattedTime = meetingDate.toLocaleString('es-ES', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              }
                            }

                            return (
                              <div className="flex flex-col items-center gap-2">
                                {isMeetingEnded ? (
                                  // ESTADO 3: LA CLASE YA TERMINÓ (Pasaron 4 horas)
                                  <>
                                    <div className="w-fit inline-flex items-center gap-2 bg-gray-900/50 text-gray-600 font-bold py-3 px-6 rounded-xl border border-gray-800 cursor-not-allowed">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Sesión Finalizada
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1 text-center">
                                      La sesión en vivo ha concluido. Puedes ver la grabación abajo.
                                    </p>
                                  </>
                                ) : isMeetingActive ? (
                                  // ESTADO 2: LA CLASE ESTÁ ACTIVA
                                  <>
                                    <a 
                                      href={lesson.meeting_url} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="w-fit inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:scale-105"
                                    >
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                      Unirse a la Sesión
                                    </a>
                                    <p className="text-gray-500 text-xs mt-1 text-center">
                                      Serás redirigido a la plataforma de la reunión (Zoom, Meet, Teams).
                                    </p>
                                  </>
                                ) : (
                                  // ESTADO 1: ESPERANDO A QUE EMPIECE
                                  <>
                                    <div className="w-fit inline-flex items-center gap-2 bg-gray-800/50 text-gray-500 font-bold py-3 px-6 rounded-xl border border-gray-700 cursor-not-allowed">
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                      Sala en Espera
                                    </div>
                                    {hasTime ? (
                                      <p className="text-orange-400/80 text-xs font-medium mt-1 text-center">
                                        El botón se habilitará 30 minutos antes. <br className="sm:hidden" />
                                        Programada para: <span className="capitalize font-bold text-orange-400">{formattedTime}</span>.
                                      </p>
                                    ) : (
                                      <p className="text-gray-500 text-xs mt-1 text-center">
                                        Serás redirigido a la plataforma de la reunión.
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Markdown de la lección */}
                      <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-left text-white prose-p:text-gray-300 prose-headings:text-blue-400 prose-a:text-blue-400 hover:prose-a:text-blue-300">
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
                          {lesson.content}
                        </ReactMarkdown>
                      </div>

                      {/* Enlace al panel de video / Grabación */}
                      <div className="mt-6 flex justify-end">
                        {(() => {
                          const hasTime = !!lesson.meeting_time;
                          const meetingDate = hasTime ? new Date(lesson.meeting_time) : null;
                          
                          // Por defecto está disponible (para cursos pre-grabados sin horario)
                          let isRecordingAvailable = true; 

                          if (hasTime) {
                            // Sumamos 4 horas en milisegundos (4 * 60 min * 60 seg * 1000 ms)
                            const fourHoursAfter = new Date(meetingDate.getTime() + (4 * 60 * 60 * 1000));
                            isRecordingAvailable = currentTime >= fourHoursAfter;
                          }

                          return isRecordingAvailable ? (
                            <Link 
                              to={`/lesson/${lesson.id}`}
                              className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-gray-700"
                            >
                              Ver grabación / Salón virtual
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </Link>
                          ) : (
                            <div 
                              className="flex items-center gap-2 text-sm bg-gray-900/50 text-gray-600 font-medium py-2 px-4 rounded-lg border border-gray-800 cursor-not-allowed"
                              title="La grabación estará disponible 4 horas después de iniciada la sesión."
                            >
                              Grabación en proceso...
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}