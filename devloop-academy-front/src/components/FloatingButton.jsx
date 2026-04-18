import { Link } from 'react-router-dom';

export default function FloatingButton() {
  return (
    <Link 
      to="/mentors" 
      className="fixed bottom-6 left-6 z-[60] flex items-center justify-center bg-green-600/45 hover:bg-green-500 text-white p-4 rounded-full shadow-2xl shadow-green-900/40 transition-all hover:scale-110 active:scale-95 group"
    >
      {/* Icono de Birrete Académico */}
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
      
      {/* Texto expansible (solo se ve en desktop al pasar el mouse) */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-bold text-sm">
        Nuestro Equipo
      </span>
    </Link>
  );
}