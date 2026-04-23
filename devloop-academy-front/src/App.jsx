import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CurrencyProvider } from './contexts/CurrencyContext';
import { useSettings } from './hooks/useSettings';
// Importamos nuestros componentes y páginas
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';
import FloatingButton from './components/FloatingButton';
import ScrollToTop from './components/ScrollToTop';
import ParticleBackground from './components/ParticleBackground';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import EditProfile from './pages/EditProfile';
import CourseSyllabus from './pages/CourseSyllabus';
import CourseMenu from './pages/CourseMenu';
import AdminPanel from './pages/AdminPanel';
import TeacherPanel from './pages/TeacherPanel';
import Mentors from './pages/Mentors';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';

// 1. Creamos un componente interno que gestione el contenido
// Este componente SÍ puede usar useLocation porque estará envuelto por el Router
function AppContent() {
  const location = useLocation();
  const { getPaymentKeys } = useSettings();
  const keys = getPaymentKeys();
  return (
    <>
      <CurrencyProvider>
        {/* Configuración de PayPal */}
        <PayPalScriptProvider options={{ "client-id": keys.paypal, currency: "USD" }}>
          {/* Se usa el ScrollToTop para marcar arriba la navegación al visitar */}
          <ScrollToTop />
          {/* El Navbar se mantiene global */}
          <Navbar />
          {/* El fondo de partículas también se mantiene global */}
          <ParticleBackground />
          {/* Lógica del botón flotante corregida */}
          {location.pathname === '/' && <FloatingButton />}

          <main className="min-h-[calc(100vh-64px)]">
            <Routes>
              {/* Rutas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Rutas de Estudiante */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/course/:id" element={<CourseSyllabus />} />
              <Route path="/course/:id/menu" element={<CourseMenu />} />
              <Route path="/lesson/:id" element={<Lesson />} />
              {/* Rutas de Profesor */}
              <Route path="/teacher" element={<TeacherPanel />} />
              {/* Rutas de sistema de compras */}
              <Route path="/checkout" element={<Checkout />} />
              {/* Rutas de Administrador */}
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
        </PayPalScriptProvider>
      </CurrencyProvider>
    </>
  );
}

// 2. El componente principal App solo define el Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}