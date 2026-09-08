/**
 * Formulario de solicitud (corregir o retirar datos · Ley 1581), en el pie del portal.
 * Guarda en Firestore `solicitudes_borrado`; el panel de administración las lista en
 * "Solicitudes Ley 1581". Misma copia del SDK que el resto del portal (firebase-client.js).
 */
import { db } from './firebase-client.js';
import { collection, addDoc } from 'firebase/firestore';

const TIPOS = {
  retirar:  'Retirar mi nombre del portal',
  corregir: 'Corregir mi sueño o mi mensaje',
  otra:     'Otra solicitud',
};

export function initSolicitudes() {
  const overlay   = document.getElementById('solicitud-overlay');
  const form      = document.getElementById('form-solicitud');
  if (!overlay || !form) return;

  const cuerpo    = document.getElementById('solicitud-cuerpo');
  const exito     = document.getElementById('solicitud-exito');
  const feedback  = document.getElementById('solicitud-feedback');
  const enviarBtn = document.getElementById('solicitud-enviar');
  let ultimoFoco  = null;

  function abrir() {
    ultimoFoco = document.activeElement;
    form.reset();
    feedback.hidden = true;
    cuerpo.hidden = false;
    exito.hidden = true;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('sol-nombre')?.focus(), 60);
  }
  function cerrar() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (ultimoFoco && typeof ultimoFoco.focus === 'function') ultimoFoco.focus();
  }

  document.querySelectorAll('[data-abrir-solicitud]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); abrir(); }));
  document.getElementById('solicitud-cerrar')?.addEventListener('click', cerrar);
  document.getElementById('solicitud-listo')?.addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !overlay.hidden) cerrar(); });

  function mostrarError(msg) {
    feedback.textContent = msg;
    feedback.className = 'sol-feedback sol-feedback--error';
    feedback.hidden = false;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    feedback.hidden = true;

    const fd      = new FormData(form);
    const nombre  = String(fd.get('nombre_estudiante') || '').trim();
    const grupo   = String(fd.get('grupo') || '');
    const tipo    = String(fd.get('tipo') || '');
    const detalle = String(fd.get('detalle') || '').trim();
    const correo  = String(fd.get('contacto_correo') || '').trim();
    const trampa  = String(fd.get('sitio_web') || '');

    if (nombre.length < 3)  return mostrarError('Escribe el nombre completo del estudiante.');
    if (!grupo)             return mostrarError('Selecciona el grupo.');
    if (!TIPOS[tipo])       return mostrarError('Indica qué necesitas.');
    if (detalle.length < 10) return mostrarError('Cuéntanos un poco más de detalle (mínimo 10 caracteres).');
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return mostrarError('El correo no parece válido.');
    if (trampa) { cuerpo.hidden = true; exito.hidden = false; return; } // campo oculto: solo lo llenan los bots

    enviarBtn.disabled = true;
    const etiqueta = enviarBtn.textContent;
    enviarBtn.textContent = 'Enviando…';
    try {
      await addDoc(collection(db, 'solicitudes_borrado'), {
        nombre_estudiante: nombre.slice(0, 120),
        grupo,
        tipo,
        detalle: `[${TIPOS[tipo]}]\n${detalle}`.slice(0, 2000),
        contacto_correo: correo.slice(0, 200),
        fecha: new Date().toISOString(),
        estado: 'pendiente',
        origen: 'portal',
      });
      cuerpo.hidden = true;
      exito.hidden = false;
    } catch (err) {
      console.error('Solicitud:', err);
      mostrarError('No se pudo enviar la solicitud. Revisa tu conexión e intenta de nuevo.');
    } finally {
      enviarBtn.disabled = false;
      enviarBtn.textContent = etiqueta;
    }
  });
}
