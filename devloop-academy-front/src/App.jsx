import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importamos nuestros componentes y páginas
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';

export default function App() {
  return (
    <Router>
      {/* Nuestro nuevo componente Navbar */}
      <Navbar />

      {/* Contenedor principal para las páginas */}
      <main className="container mx-auto px-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:id" element={<Lesson />} />
        </Routes>
      </main>
    </Router>
  );
}