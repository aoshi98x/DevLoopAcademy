import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Esto hace que la ventana suba instantáneamente a las coordenadas 0,0 cada vez que cambia la URL
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // No dibuja nada en la pantalla
}