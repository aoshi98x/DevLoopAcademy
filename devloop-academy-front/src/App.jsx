import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos nuestros componentes y páginas
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute'; // <-- 1. IMPORTANTE: Importar el guardia
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import EditProfile from './pages/EditProfile';
import CourseSyllabus from './pages/CourseSyllabus';
import CourseMenu from './pages/CourseMenu';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <Router>
      {/* El Navbar está fuera de Routes para que se vea en todas las páginas */}
      <Navbar />

      {/* Contenedor principal. 
        Nota: He quitado 'container mx-auto' de aquí porque algunas 
        páginas (como el Syllabus o la Lesson) se ven mejor con su propio ancho.
      */}
      <main className="min-h-[calc(100-64px)]"> 
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rutas de Estudiante (Privadas por lógica interna de cada página) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/course/:id" element={<CourseSyllabus />} />
          <Route path="/course/:id/menu" element={<CourseMenu />} />
          <Route path="/lesson/:id" element={<Lesson />} />

          {/* Rutas de Administrador (Protegidas por el componente AdminRoute) */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute> 
                <AdminPanel /> 
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
    </Router>
  );
}