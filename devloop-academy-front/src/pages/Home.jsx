import { Link } from 'react-router-dom';

export default function Home() {
  // Añadimos imágenes de demostración a nuestros datos
  const courses = [
    {
      id: "multiplayer-unity",
      title: "Desarrollo Multijugador con Unity",
      description: "Aprende a implementar Netcode, crear lobbies con temporizadores y sincronizar estados en tiempo real.",
      level: "Avanzado",
      image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "animacion-2d",
      title: "Animación Cuadro por Cuadro",
      description: "Domina el movimiento de personajes, expresiones y poses dinámicas para darle vida a tus creaciones.",
      level: "Intermedio",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "ilustracion-libre",
      title: "Ilustración con Software Libre",
      description: "Crea arte digital increíble utilizando las mejores herramientas open-source como Krita, Inkscape y Gimp.",
      level: "Principiante",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80"
    }
  ];

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

      {/* 2. Sección de Cursos Destacados */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Rutas de Aprendizaje
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map(course => (
            // Agregamos overflow-hidden y quitamos p-6 de este contenedor
            <div 
              key={course.id} 
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
            >
              {/* Espacio para la imagen */}
              <div className="h-48 w-full bg-gray-200">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Contenedor del texto (Aquí movemos el p-6) */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                    {course.level}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{course.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  {course.description}
                </p>
                
                {/* Enlace con mt-auto para alinearse al fondo, o mt-8 si preferiste margen fijo */}
                <Link 
                  to={`/lesson/${course.id}`} 
                  className="text-blue-600 font-semibold hover:text-blue-800 transition-colors mt-auto inline-flex items-center pt-4"
                >
                  Ver temario <span className="ml-2">&rarr;</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

    </div>
  );
}