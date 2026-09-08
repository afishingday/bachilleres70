/**
 * Arranca Vite del portal (5173) y Vite del admin (5174).
 * El portal hace proxy de /admin → 127.0.0.1:5174 (ver vite.config.js raíz).
 * Uso: desde la raíz del repo → npm run dev
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

if (!fs.existsSync(viteBin)) {
  console.error('No se encuentra Vite. Ejecuta: npm install');
  process.exit(1);
}

const node = process.execPath;

const children = [];

function runAdmin() {
  const p = spawn(node, [viteBin, '--config', 'admin/vite.config.js'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  children.push(p);
  p.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[admin] proceso terminó con código ${code}`);
      shutdown(code);
    }
  });
  return p;
}

function runPortal() {
  const p = spawn(node, [viteBin], {
    cwd: root,
    stdio: 'inherit',
    env: process.env,
  });
  children.push(p);
  p.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`[portal] proceso terminó con código ${code}`);
    shutdown(code ?? 1);
  });
  return p;
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    try {
      c.kill('SIGTERM');
    } catch (_) {
      /* noop */
    }
  }
  setTimeout(() => process.exit(code), 200).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log(`
  Portal → http://127.0.0.1:5173
  Admin  → http://127.0.0.1:5173/admin/   (proxy al puerto 5174)
           o directo http://127.0.0.1:5174/admin/
`);

runAdmin();

// Dar tiempo al admin a ocupar el 5174 antes de que arranque el portal
setTimeout(() => runPortal(), 800);
