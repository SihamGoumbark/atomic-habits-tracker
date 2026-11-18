import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuration de Vite avec React et Tailwind CSS
export default defineConfig({
  plugins: [react(), tailwindcss()],
})