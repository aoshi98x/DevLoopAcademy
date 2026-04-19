import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // NUEVO: Estado para detectar error de login y manejar recuperación
  const [authError, setAuthError] = useState(false);

  // Nuevos campos de perfil
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(false); // Resetear error al intentar de nuevo

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: `${firstName} ${lastName}`,
              headline: headline,
              description: description,
            }
          }
        });
        if (error) throw error;
        alert('¡Cuenta creada! Revisa si recibiste un correo o intenta iniciar sesión.');
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Si el error es de credenciales, activamos la opción de recuperar
          if (error.message.includes("Invalid login credentials") || error.status === 400) {
            setAuthError(true);
          }
          throw error;
        }
        navigate('/dashboard');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIONALIDAD: Enviar solicitud de restablecimiento
  const handleResetPassword = async () => {
    if (!email) {
      alert("Por favor, ingresa tu correo electrónico primero.");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`, 
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Se ha enviado un enlace de recuperación a tu correo.");
      setAuthError(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-gray-800 w-full max-w-lg shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          {isRegistering ? 'Crear Perfil' : 'DevLoop Academy'}
        </h2>
        
        <form onSubmit={handleAuth} className="space-y-4 mt-8">
          {isRegistering && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Nombre *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Apellido *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apellido"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Profesión / Headline *</label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Desarrollador Unity 3D"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Descripción (Opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Cuéntanos un poco sobre ti..."
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* NUEVA SECCIÓN: RESTABLECER CONTRASEÑA (Solo aparece si falló el login) */}
            {!isRegistering && authError && (
              <div className="mt-2 text-right">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors underline bg-transparent border-none p-0 cursor-pointer"
                >
                  ¿Olvidaste tu contraseña? Restablecer aquí
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isRegistering ? 'Crear Cuenta Profesional' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegistering(!isRegistering);
            setAuthError(false); // Ocultar error si cambia de modo
          }}
          className="w-full text-blue-400 hover:text-blue-300 text-sm mt-6 transition-colors"
        >
          {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
        </button>
      </div>
    </div>
  );
}