import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function CourseSyllabus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const isActive = profile?.is_active || false;

  useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);

      // 1. Traer la info del curso
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

      // 2. Traer el Markdown del temario
      try {
        if (!courseData.syllabus_url) throw new Error("Sin temario configurado");
        const response = await fetch(courseData.syllabus_url);
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
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
    </div>
  );

 return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Cabecera del Curso (Banner) */}
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl mb-8">
        <div className="aspect-[21/9] w-full bg-gray-900 relative">
          <img 
            src={course?.image_url || 'https://via.placeholder.com/800x400'} 
            alt={course?.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {course?.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              {course?.description}
            </p>
          </div>
        </div>

        {/* Barra de Acción Rápida */}
        <div className="bg-gray-900/50 border-t border-gray-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium">Temario completo disponible</span>
          </div>
          
          {isActive ? (
            <button 
              onClick={() => navigate(`/course/${id}/menu`)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-900/40"
            >
              Ir al salón de clases
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white text-black font-bold py-3 px-8 rounded-xl transition-all hover:scale-105"
            >
              Inscribirme ahora
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* VIDEO DE INTRODUCCIÓN (Si existe) */}
        {course?.video_id && (
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Introducción al curso</span>
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
        <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 p-8 md:p-12 shadow-2xl">
          <div className="prose prose-invert prose-lg max-w-none 
            prose-headings:text-blue-400 
            prose-strong:text-purple-400
            prose-a:text-blue-400 hover:prose-a:text-blue-300
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
  );
}