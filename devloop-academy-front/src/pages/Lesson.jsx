import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Lesson() {
  // useParams() captura el ID de la lección desde la URL (ej. /lesson/multiplayer-unity)
  const { id } = useParams();

  // Simulamos el contenido Markdown que vendría de tu base de datos o archivo local
  const markdownContent = `
# Creación de Lobbies y Temporizadores
Bienvenido a esta lección. Hoy aprenderemos a estructurar la lógica antes de que los jugadores entren a la partida.

## El problema del emparejamiento
Cuando los jugadores se conectan, no queremos lanzarlos directamente al juego. Necesitamos una sala de espera o *Lobby*. Si el contador llega a cero y la partida no se llena, debemos darle al jugador la opción de cancelar.

### Requisitos del sistema
* Un estado de jugador (Buscando, En Lobby, Listo).
* Un contador de **30 segundos** sincronizado.
* Un botón de "Salir del emparejamiento" que se habilite dinámicamente.

---
> **Nota del instructor:** Asegúrate de que el contador se ejecute en el Servidor (Host) y solo envíe actualizaciones visuales a los Clientes para evitar trampas.
  `;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      
      {/* Botón para volver atrás */}
      <div className="mb-8">
        <Link to="/" className="text-blue-300 font-semibold hover:text-blue-800 transition-colors">
          &larr; Volver al inicio
        </Link>
      </div>

      <div className="bg-black/80 rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        {/* Etiqueta decorativa con el ID de la URL */}
        <span className="text-sm font-mono bg-gray-100 text-gray-600 px-3 py-1 rounded-md mb-6 inline-block">
          Módulo: {id}
        </span>

        {/* Aquí ocurre la magia. 
          La clase "prose" es la que aplica los estilos profesionales de lectura. 
          "prose-blue" hace que los enlaces y acentos combinen con nuestra marca.
        */}
        <div className="prose prose-blue prose-lg max-w-none text-gray-50">
          <ReactMarkdown>
            {markdownContent}
          </ReactMarkdown>
        </div>
      </div>
      
    </div>
  );
}