import { Link } from 'react-router-dom';

export default function Dashboard() {
  // Simulamos los datos del usuario autenticado
  const student = {
    name: "Alex",
    // Si avatarUrl es null o vacío, mostraremos el avatar por defecto
    avatarUrl: null, 
    headline: "Desarrollador de juegos y Artista 3D",
    description: "Especializado en el desarrollo de experiencias multijugador usando Unity y Netcode. Apasionado por la creación de personajes originales y la animación utilizando software 3D open-source como Blender.",
    linkedin: "https://linkedin.com",
    globalProgress: 65, // Porcentaje de progreso global
    currentLesson: {
      courseId: "multiplayer-unity",
      courseName: "Desarrollo Multijugador con Unity",
      title: "Creación de Lobbies y Temporizadores",
      moduleProgress: 80 // Porcentaje de este curso en particular
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      
      {/* Título de la página */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Panel</h1>
        <p className="text-gray-600 mt-1">Gestiona tu perfil y continúa tu aprendizaje.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: Perfil del Estudiante (Ocupa 1/3 del espacio) */}
        <div className="bg-black rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center lg:col-span-1">
          
          {/* Lógica del Avatar: Si hay URL la muestra, si no, muestra el SVG por defecto */}
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md mb-4 flex items-center justify-center">
            {student.avatarUrl ? (
              <img src={student.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              // SVG de Avatar por defecto (Silueta)
              <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
          
          {/* Le agregamos mb-8 a este span para que "empuje" el texto de abajo */}
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 mb-6">
            {student.headline}
          </span>
          
          {/* Le quitamos el mt al párrafo para que solo respete el empuje del span */}
          <p className="text-gray-400 text-sm leading-relaxed">
            {student.description}
          </p>

          {/* Botón de LinkedIn */}
          <a 
            href={student.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white py-2.5 px-4 rounded-lg font-medium transition-colors shadow-sm"
          >
            {/* Ícono de LinkedIn en SVG */}
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Perfil Profesional
          </a>
        </div>

        {/* COLUMNA DERECHA: Progreso y Lecciones (Ocupa 2/3 del espacio) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tarjeta de Progreso Global */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 or p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Progreso de la Academia</h3>
            
            <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
              <span>Nivel: Intermedio</span>
              <span>{student.globalProgress}% Completado</span>
            </div>
            {/* Barra de progreso global */}
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${student.globalProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Tarjeta de Lección en Curso */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-md border border-gray-700 p-6 md:p-8 text-white relative overflow-hidden">
            {/* Decoración visual de fondo */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>

            <span className="text-blue-400 text-sm font-bold tracking-wider uppercase mb-2 block">
              Continuar aprendiendo
            </span>
            <h3 className="text-2xl font-bold mb-1">{student.currentLesson.courseName}</h3>
            <p className="text-gray-300 mb-6">
              Módulo actual: <span className="font-medium text-white">{student.currentLesson.title}</span>
            </p>

            {/* Barra de progreso de la lección */}
            <div className="mb-6">
              <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
                <span>Progreso del módulo</span>
                <span>{student.currentLesson.moduleProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-full rounded-full" 
                  style={{ width: `${student.currentLesson.moduleProgress}%` }}
                ></div>
              </div>
            </div>

            <Link 
              to={`/lesson/${student.currentLesson.courseId}`}
              className="inline-block bg-blue-500 hover:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
            >
              Reanudar lección &rarr;
            </Link>
          </div>

        </div>
      </div>
      
    </div>
  );
}