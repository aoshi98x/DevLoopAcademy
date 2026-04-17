import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar o limpiar el perfil
  const loadUserAndProfile = async (currentUser) => {
    try {
      setUser(currentUser);
      
      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error("Error cargando perfil:", error.message);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Error inesperado en AuthContext:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserAndProfile(session?.user || null);
    });

    // 2. Escuchar cambios de estado (Login, Logout, Token Refreshed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Si el evento es SIGN_OUT, limpiamos todo inmediatamente
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else {
        loadUserAndProfile(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Exponemos una función para recargar el perfil manualmente si fuera necesario
  const refreshProfile = () => loadUserAndProfile(user);

  return (
    <AuthContext.Provider value={{ 
        user, 
        profile, 
        refreshProfile,
        isActive: profile?.is_active || false,
        isAdmin: profile?.role === 'admin' 
    }}>
        {/* Usamos un div simple si no tienes el componente LoadingSpinner creado */}
        {!loading ? children : (
          <div className="min-h-screen bg-black flex items-center justify-center text-blue-500 font-bold">
            Cargando DevLoopAcademy...
          </div>
        )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};