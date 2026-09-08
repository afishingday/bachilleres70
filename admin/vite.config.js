import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Carpeta admin/ (vite.config.js está aquí). Sin esto, al lanzar vite desde la raíz el root es cwd y sirve index.html del portal. */
const adminRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: adminRoot,
  plugins: [react()],
  // Mismo base en dev y prod: el panel debe abrirse en /admin/ (coincide con Hosting y enlaces públicos).
  base: '/admin/',
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(adminRoot, '../dist/admin'),
    emptyOutDir: false,
  },
});
