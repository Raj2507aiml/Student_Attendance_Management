
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/Student_Attendance_Management/',
  optimizeDeps: {
    exclude: ['face-api.js'],
  },
})
