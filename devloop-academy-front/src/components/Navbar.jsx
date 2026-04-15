import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg mb-8">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Nombre de la academia */}
        <Link to="/" className="text-xl font-bold tracking-wider hover:text-blue-400 transition-colors">
          DevLoop Academy
        </Link>
        
        {/* Enlaces de navegación */}
        <ul className="flex space-x-6 font-medium">
          <li>
            <Link to="/" className="hover:text-blue-400 transition-colors">Inicio</Link>
          </li>
          <li>
            <Link to="/login" className="hover:text-blue-400 transition-colors">Acceso</Link>
          </li>
          <li>
            <Link to="/dashboard" className="hover:text-blue-400 transition-colors">Panel</Link>
          </li>
          <li>
            <Link to="/lesson/1" className="hover:text-blue-400 transition-colors">Lección</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}