import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState('all'); // 'all', 'free', 'paid'
  const [selectedTag, setSelectedTag] = useState('Todas');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error) {
        console.error("Error cargando cursos:", error);
      } else {
        setCourses(data || []);
        setFilteredCourses(data || []);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  // Lógica de filtrado en tiempo real
  useEffect(() => {
    let result = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = filterPrice === 'all' 
        ? true 
        : filterPrice === 'free' ? course.is_free : !course.is_free;
      const matchesTag = selectedTag === 'Todas' || (course.tags && course.tags.includes(selectedTag));

      return matchesSearch && matchesPrice && matchesTag;
    });

    setFilteredCourses(result);
  }, [searchTerm, filterPrice, selectedTag, courses]);

  // Obtener etiquetas únicas para el selector
  const allTags = ['Todas', ...new Set(courses.flatMap(c => c.tags || []))];

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
      <section className="text-center space-y-6 bg-black/80 rounded-3xl p-12 shadow-sm border border-gray-800 mx-4">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">
          Crea sin límites en <span className="text-blue-600">DevLoop Academy</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
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

      {/* SECCIÓN DE BUSCADOR Y FILTROS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4 items-center">
          {/* Input de Búsqueda */}
          <div className="relative w-full flex-1">
            <input 
              type="text" 
              placeholder="¿Qué quieres aprender hoy?"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro Precio */}
          <select 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
          >
            <option value="all">Todos los cursos</option>
            <option value="free">Cursos Gratuitos</option>
            <option value="paid">Cursos Premium</option>
          </select>

          {/* Filtro Etiquetas */}
          <select 
            className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Grid de Cursos Dinámicos */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl font-medium">No se encontraron cursos con esos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="group bg-black/60 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-2xl relative"
              >
                {/* Badge de Gratis/Pago */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    course.is_free 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {course.is_free ? 'Gratis' : 'Premium'}
                  </span>
                </div>

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
                  {/* Etiquetas del curso */}
                  <div className="flex flex-wrap gap-2">
                    {course.tags && course.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter bg-gray-900 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>

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
                      {course.tags?.[0] || 'Online'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}