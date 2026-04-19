import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function CourseSyllabus() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // CORRECCIÓN 1: Extraer 'user' además de 'profile'
  const { profile, user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const isActive = profile?.is_active || false;
  
  // NUEVOS ESTADOS PARA INSCRIPCIONES
  const [enrollments, setEnrollments] = useState([]);
  const [userSchedule, setUserSchedule] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);

      const { data: courseData, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !courseData) {
        console.error("Curso no encontrado");
        setLoading(false);
        return;
      }
      
      setCourse(courseData);
      
      // --- NUEVO: Traer inscripciones para calcular cupos ---
      const { data: enrolls } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', id);
      
      setEnrollments(enrolls || []);

      // Si el usuario está logueado, revisar si ya eligió horario
      if (user && enrolls) {
        const myEnrollment = enrolls.find(e => e.user_id === user.id);
        if (myEnrollment) setUserSchedule(myEnrollment.schedule_text);
      }
      // ------------------------------------------------------

      // 2. Traer el Markdown del temario (Dependiendo del tipo de curso)
      try {
        // CORRECCIÓN 2: Usar 'isActive' en lugar de '!activeStatus'
        const targetSyllabusUrl = (courseData.is_synchronous && courseData.sync_syllabus_url && !isActive) 
          ? courseData.sync_syllabus_url 
          : courseData.syllabus_url;

        if (!targetSyllabusUrl) throw new Error("Sin temario configurado");
        
        const response = await fetch(targetSyllabusUrl);
        if (!response.ok) throw new Error("Error en descarga");
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setContent("# Temario en construcción\nPronto publicaremos los detalles de este curso.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchSyllabus();
  }, [id, user, isActive]);


  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

  const handleEnrollSchedule = async (scheduleObj) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isActive) {
      alert("Debes tener una suscripción activa para apartar cupo.");
      return;
    }

    setEnrolling(true);
    try {
      const { error } = await supabase.from('course_enrollments').insert([{
        user_id: user.id,
        course_id: course.id,
        schedule_text: scheduleObj.text
      }]);

      if (error) throw error;

      // Actualizar la vista al instante
      setUserSchedule(scheduleObj.text);
      setEnrollments([...enrollments, { user_id: user.id, schedule_text: scheduleObj.text }]);
      alert("¡Cupo reservado con éxito!");
      
    } catch (error) {
      alert("Error al reservar cupo: " + error.message);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Cabecera del Curso (Banner) */}
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mb-8">
        
        {/* CORRECCIÓN 1: min-h en móviles, aspect ratio en pantallas grandes */}
        <div className="min-h-[320px] sm:min-h-[380px] md:aspect-[21/9] w-full bg-gray-900 relative">
          <img 
            src={course?.image_url || 'https://via.placeholder.com/800x400'} 
            alt={course?.title}
            className="w-full h-full object-cover opacity-40 absolute inset-0"
          />
          
          {/* CORRECCIÓN 2: Ajuste de padding responsivo (p-5 en móvil) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col justify-end p-5 sm:p-8 md:p-12">
            
            {/* Etiquetas de Modalidad (Con margen inferior añadido) */}
            <div className="flex gap-3 mb-3 sm:mb-4">
              {course?.is_synchronous ? (
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 w-fit">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                  Clases en Vivo
                </span>
              ) : (
                <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 w-fit">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  A tu ritmo
                </span>
              )}
            </div>

            {/* CORRECCIÓN 3: Fuentes dinámicas (text-2xl en móvil, subiendo hasta text-5xl) */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
              {course?.title}
            </h1>
            
            {/* CORRECCIÓN 4: line-clamp-2 en móvil para que no empuje el contenido, se expande en escritorio */}
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
              {course?.description}
            </p>
          </div>
    </div>
        
      {/* SECCIÓN DE HORARIOS (Sincrónicos y con Cupos) */}
      {course?.is_synchronous && course?.schedules && course.schedules.length > 0 && (
        <div className="mb-8 bg-gray-900/50 border border-blue-900/30 rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Horarios y Cupos
          </h3>
          
          {!userSchedule ? (
            <p className="text-gray-400 text-sm mb-6">Elige el grupo que mejor se adapte a ti. Los cupos son limitados.</p>
          ) : (
            <p className="text-green-400 font-bold text-sm mb-6 bg-green-900/20 p-3 rounded-lg border border-green-900/30 inline-block">
              ✓ Ya tienes tu cupo asegurado en este curso.
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.schedules.map((schedule, index) => {
              // Calculamos cupos dinámicamente
              const enrolledCount = enrollments.filter(e => e.schedule_text === schedule.text).length;
              const availableSpots = schedule.capacity - enrolledCount;
              const isFull = availableSpots <= 0;
              const isMySchedule = userSchedule === schedule.text;

              return (
                <button 
                  key={index}
                  disabled={isFull || userSchedule || enrolling}
                  onClick={() => handleEnrollSchedule(schedule)}
                  className={`text-left rounded-xl p-4 flex items-start gap-4 transition-all duration-300 border
                    ${isMySchedule 
                      ? 'bg-green-900/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' // Tu horario elegido
                      : isFull 
                        ? 'bg-black/40 border-gray-800 opacity-60 cursor-not-allowed' // Lleno
                        : userSchedule 
                          ? 'bg-black/60 border-gray-800 opacity-50 cursor-not-allowed' // Si ya elegiste otro
                          : 'bg-black/60 border-gray-700 hover:border-blue-500 hover:bg-gray-800 cursor-pointer' // Disponible
                    }
                  `}
                >
                  <div className={`p-3 rounded-lg font-bold ${isMySchedule ? 'bg-green-600 text-white' : 'bg-blue-900/30 text-blue-400'}`}>
                    G{index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm sm:text-base leading-snug">{schedule.text}</h4>
                    
                    {/* Indicador de cupos */}
                    <div className="mt-2 text-xs font-bold uppercase tracking-wider">
                      {isMySchedule ? (
                        <span className="text-green-400">Tu horario seleccionado</span>
                      ) : isFull ? (
                        <span className="text-red-500">Cupos Agotados</span>
                      ) : (
                        <span className={availableSpots <= 3 ? "text-orange-400" : "text-blue-400"}>
                          {availableSpots} cupos disponibles
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
        <div className="bg-gray-900/50 border-t border-gray-800 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm sm:text-base">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium text-left">Temario completo disponible</span>
          </div>
          
          {isActive ? (
            <button 
              onClick={() => navigate(`/course/${id}/menu`)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-900/40"
            >
              Ir al salón de clases
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white text-black font-bold py-3 px-6 sm:px-8 rounded-xl transition-all hover:scale-105"
            >
              Inscribirme ahora
            </button>
          )}
        </div>
      </div>
          
      <div className="grid grid-cols-1 gap-8">
        {/* VIDEO DE INTRODUCCIÓN */}
        {course?.video_id && (
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex flex-row items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest text-left">Introducción al curso</span>
            </div>
            
            <div className="aspect-video w-full bg-gray-900">
              <iframe 
                src={`https://www.youtube.com/embed/${course.video_id}`} 
                className="w-full h-full"
                allowFullScreen
                title="Course Introduction"
              ></iframe>
            </div>
          </div>
        )}
        
        {/* CONTENIDO DEL TEMARIO (MARKDOWN) */}
        <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 p-6 sm:p-8 md:p-12 shadow-2xl text-left">
          <div className="w-full overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}