import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Llenar el formulario con los datos actuales
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (profile) {
      setFullName(profile.full_name || '');
      setHeadline(profile.headline || '');
      setDescription(profile.description || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setAvatarUrl(profile.avatar_url || '');
    }
  }, [user, profile, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          headline: headline,
          description: description,
          linkedin_url: linkedinUrl,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id); // ¡Crucial! Solo actualiza la fila de este usuario

      if (error) throw error;
      
      alert('¡Perfil actualizado con éxito!');
      // Forzamos la recarga para que el AuthContext lea los datos nuevos
      window.location.href = '#/dashboard';
      window.location.reload();
      
    } catch (error) {
      alert("Error al guardar: " + error.message);
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-gray-800 p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Editar Perfil</h1>
        <p className="text-gray-400 mb-8">Actualiza tu información profesional para que la comunidad te conozca mejor.</p>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Nombre Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Profesión / Titular</label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Technical Artist | Desarrollador Unity"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">URL de tu Foto (Avatar)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://ejemplo.com/mi-foto.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">URL de LinkedIn o Portfolio</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/tu-perfil"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">Sobre ti</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Cuéntanos sobre tus proyectos, herramientas favoritas (Blender, Unity, etc.) o qué estás aprendiendo..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}