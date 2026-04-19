import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert("Contraseña actualizada con éxito. Ahora puedes iniciar sesión.");
      navigate('/login');
    } catch (error) {
      alert("Error al actualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-black/80 backdrop-blur-md p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">
          Nueva Contraseña
        </h2>
        <p className="text-gray-400 text-sm text-center mb-8">
          Ingresa tu nueva clave de acceso para DevLoop Academy.
        </p>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Nueva Contraseña</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Confirmar Contraseña</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all mt-4 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}