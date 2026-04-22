import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
// 1. Importamos el contexto de moneda
import { useCurrency } from '../contexts/CurrencyContext';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');
  const [selectedTag, setSelectedTag] = useState('Todas');

  const navigate = useNavigate();
  // 2. Extraemos la función para formatear precios y la moneda actual
  const { formatPrice, currency } = useCurrency();

  // 3. ACTUALIZADO: Precios base ahora están en COP (Pesos Colombianos)
  const plans = [
    {
      id: 'monthly',
      name: 'Mensual',
      price: 60000, 
      duration: 'por mes',
      description: 'Ideal para probar la plataforma y rutas cortas.',
      recommended: false,
    },
    {
      id: 'quarterly',
      name: 'Trimestral',
      price: 140000,
      duration: 'por 3 meses',
      description: 'Ahorra un 22% y domina tu primera habilidad.',
      recommended: false,
    },
    {
      id: 'semiannual',
      name: 'Semestral',
      price: 260000,
      duration: 'por 6 meses',
      description: 'Construye tu portafolio con calma y soporte.',
      recommended: true,
    },
    {
      id: 'annual',
      name: 'Anual',
      price: 440000,
      duration: 'por 12 meses',
      description: 'Para verdaderos creadores comprometidos.',
      recommended: false,
    }
  ];

  const handleSelectPlan = (plan) => {
    const checkoutData = {
      type: 'subscription',
      id: plan.id,
      name: `Plan ${plan.name}`,
      price: plan.price // Pasamos el valor numérico crudo en COP al checkout
    };
    localStorage.setItem('devloop_checkout', JSON.stringify(checkoutData));
    navigate('/checkout');
  };

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
      <section className="flex flex-col items-center text-center space-y-6 bg-black/80 rounded-3xl p-12 shadow-sm border border-gray-800 mx-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight max-w-4xl">
              Crea sin límites en <span className="text-blue-600">DevLoop Academy</span>
            </h1>
            
            {/* Eliminamos w-full y !text-center para dejar que flexbox y mx-auto hagan su trabajo limpio */}
            <p className="text-xl text-gray-400 max-w-2xl mx-auto text-center leading-relaxed">
              Sube de nivel con cursos prácticos y domina las herramientas que impulsan la industria creativa y del desarrollo interactivo.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/login"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
              >
                Comenzar a aprender
              </Link>
            </div>
      </section>

      {/* SECCIÓN DE BUSCADOR Y FILTROS */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full flex-1">
            <input
              type="text"
              placeholder="¿Qué quieres aprender hoy?"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-5 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
          >
            <option value="all">Todos los cursos</option>
            <option value="free">Cursos Gratuitos</option>
            <option value="paid">Cursos Premium</option>
          </select>

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
                className="group bg-black/60 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-2xl relative flex flex-col"
              >
                <div className="absolute top-4 right-4 z-10">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                    course.is_free
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}>
                    {course.is_free ? 'Gratis' : 'Premium'}
                  </span>
                </div>

                <div className="aspect-video w-full overflow-hidden bg-gray-900 shrink-0">
                  <img
                    src={course.image_url || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col">
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
                  <p className="text-gray-400 text-sm line-clamp-2 flex-1">
                    {course.description}
                  </p>
                 
                  <div className="pt-4 flex items-center justify-between border-t border-gray-800/50 mt-auto">
                     <Link to={`/course/${course.id}`}
                      className="text-blue-400 font-semibold text-sm hover:text-blue-300 flex items-center gap-2"
                    >
                      Ver detalles y precios
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECCIÓN: PLANES DE SUSCRIPCIÓN EN EL HOME */}
      <section id="planes" className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-800">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            Acceso Total Formación Premium
          </h2>
          <p className="text-lg text-gray-400">
            Sin cobros automáticos. Paga la suscripción que prefieras y desbloquea todo el catálogo de cursos a tu ritmo durante ese tiempo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-black/60 backdrop-blur-md rounded-3xl border p-6 flex flex-col h-full transition-all duration-300 hover:shadow-xl
                ${plan.recommended 
                  ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] lg:-translate-y-4' 
                  : 'border-gray-800 hover:border-gray-600'
                }
              `}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full">
                  Más Popular
                </div>
              )}
              
              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-400 text-xs mb-4 min-h-[32px]">{plan.description}</p>
              
              <div className="mb-6 pb-6 border-b border-gray-800">
                {/* 4. ACTUALIZADO: Usamos formatPrice para mostrar el dinero */}
                <span className="text-3xl font-extrabold text-white tracking-tight">{formatPrice(plan.price)}</span>
                <span className="text-gray-500 text-xs ml-1 uppercase tracking-wider">{plan.duration}</span>
              </div>

              <button 
                onClick={() => handleSelectPlan(plan)} 
                className={`w-full py-3 px-4 rounded-xl font-bold transition-colors uppercase tracking-wider text-xs text-center mt-auto block
                  ${plan.recommended 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/40' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }
                `}
              >
                Elegir {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}