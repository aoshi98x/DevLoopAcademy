import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Pon aquí el nombre exacto de tu repositorio entre barras
  base: '/DevLoopAcademy/', 
})