import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Creamos el contexto
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener los datos solo una vez
    const loadUserAndProfile = async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    // 1. Revisar si ya hay una sesión al cargar la página por primera vez
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserAndProfile(session?.user || null);
    });

    // 2. Escuchar si el usuario inicia o cierra sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserAndProfile(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isActive: profile?.is_active || false }}>
      {/* Solo mostramos la app cuando ya sabemos quién es el usuario */}
      {!loading ? children : (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar este contexto fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};