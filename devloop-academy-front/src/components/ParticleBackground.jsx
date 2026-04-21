import { useEffect, useState } from 'react';

// Ahora el componente recibe propiedades. maxSize controla qué tan grandes pueden llegar a ser.
export default function ParticleBackground({ maxSize = 4, particleCount = 50 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generamos las partículas
    const particleArray = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      // Usamos la propiedad maxSize para determinar el límite de tamaño
      size: Math.random() * maxSize + 1, 
      left: Math.random() * 100, 
      top: Math.random() * 100, 
      
      // Tiempos para el movimiento flotante (Lento: 10s a 25s)
      floatDuration: Math.random() * 15 + 10, 
      floatDelay: Math.random() * 5, 
      
      // Tiempos para el parpadeo de luz (Rápido: 2s a 6s)
      twinkleDuration: Math.random() * 4 + 2,
      twinkleDelay: Math.random() * 5,
    }));
    
    setParticles(particleArray);
  }, [maxSize, particleCount]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-black">
      
      {/* Luces abstractas de fondo (Orbes grandes) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[150px] animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute top-[40%] right-[-5%] w-[30%] h-[30%] rounded-full bg-cyan-900/10 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }}></div>

      {/* Partículas individuales */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-400"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            // Combinamos las animaciones con CSS inline para que cada una tenga su propio ease-in-out
            animation: `
              float ${p.floatDuration}s infinite ease-in-out ${p.floatDelay}s,
              twinkle ${p.twinkleDuration}s infinite ease-in-out ${p.twinkleDelay}s
            `
          }}
        />
      ))}
    </div>
  );
}