import { Link } from 'react-router-dom';

const MENTORS = [
  {
    id: 1,
    name: "Fabio Venegas",
    role: "Digital Artist & Co-founder",
    description: "Especialista en flujos de trabajo 3D con herramientas de vanguardia.",
    tags: ["Blender", "Unity", "Modelado", "Riggin", "Animación", "Texturizado"],
    image: "src/assets/images/mentor1.jpg" // Aquí irá tu foto
  },
  {
    id: 2,
    name: "Miguel Hernandez",
    role: "Desarrollador de Videojuegos & Co-Founder",
    description: "Especialista en desarrollo y Gestión de proyectos de videojuegos.",
    tags: ["Unity", "Unreal Engine", "Godot", "C#", "C++", "Gestión de Proyectos"],
    image: "src/assets/images/mentor2.jpg" // Aquí irá tu foto
  },
  // Puedes añadir más mentores aquí siguiendo el mismo formato
];

export default function Mentors() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    {/* Añadimos flex, flex-col e items-center para forzar el centro en el eje */}
    <div className="flex flex-col items-center justify-center text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Conoce a tus Mentores</h1>
      
      {/* Añadimos !text-center para sobrescribir cualquier otra regla CSS */}
      <p className="text-gray-400 max-w-2xl mx-auto text-lg !text-center">
        Expertos apasionados por la tecnología y el arte digital, listos para guiarte en tu camino profesional.
      </p>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        {MENTORS.map((mentor) => (
          <div key={mentor.id} className="group bg-black/60 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
            {/* Foto del Mentor */}
            <div className="aspect-square w-full overflow-hidden relative">
              <img 
                src={mentor.image} 
                alt={mentor.name} 
                className="w-auto h-auto object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            </div>

            {/* Info */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-white mb-2">{mentor.name}</h2>
              <p className="text-blue-400 font-medium text-sm mb-6">{mentor.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {mentor.description}
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                ......
              </p>

              {/* Etiquetas */}
              <div className="flex flex-wrap gap-2">
                {mentor.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
        </div>
        ))}
      </div>
    </div>
  );
}