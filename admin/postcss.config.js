import path from 'node:path';
import { fileURLToPath } from 'node:url';

const adminDir = path.dirname(fileURLToPath(import.meta.url));

/** Ruta explícita: cwd suele ser la raíz del repo al usar vite --config admin/… y Tailwind no encontraba esta config. */
const tailwindConfigPath = path.join(adminDir, 'tailwind.config.js');

export default {
  plugins: {
    tailwindcss: { config: tailwindConfigPath },
    autoprefixer: {},
  },
};
