import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Envolvemos todo en useEffect
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')

      console.log("Respuesta de Supabase:", data, "Error:", error);

      if (error) {
        console.error("Error cargando cursos:", error);
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    // 2. ¡MUY IMPORTANTE! Llamamos a la función para que se ejecute
    fetchCourses();
  }, []); // 3. El array vacío [] le dice a React: "Ejecuta esto SOLO UNA VEZ al abrir la página"

  // 4. (Opcional pero recomendado) Mostramos un estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-16 py-8">
      
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 bg-black/80 rounded-3xl p-12 shadow-sm border border-gray-100">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Crea sin límites en <span className="text-blue-600">DevLoop Academy</span>
        </h1>
        <p className="text-xl text-gray-50 max-auto mx-auto">
          Sube de nivel con cursos prácticos y domina las herramientas que impulsan la industria creativa y del desarrollo interactivo.
        </p>
        <div className="pt-4">
          <Link 
            to="/dashboard" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Comenzar a aprender
          </Link>
        </div>
      </section>

      {/* Grid de Cursos Dinámicos */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="group bg-black/60 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-2xl"
            >
              {/* Imagen del Curso */}
              <div className="aspect-video w-full overflow-hidden bg-gray-900">
                <img 
                  src={course.image_url || 'https://via.placeholder.com/400x225'} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Contenido de la Tarjeta */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {course.description}
                </p>
                
                <div className="pt-4 flex items-center justify-between">
                   <Link to={`/course/${course.id}`}
                    className="text-blue-400 font-semibold text-sm hover:text-blue-300 flex items-center gap-2"
                  >
                    Ver temario
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded">
                    Online
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}