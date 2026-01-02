import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 80, // Docker maps 8080:80, but internally dev server can run on 80 or 5173
        // For local dev without docker:
        // port: 5173
    }
})
