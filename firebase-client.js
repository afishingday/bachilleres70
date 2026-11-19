import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export { app };

/*
 * Medición de uso. Analytics tarda en quedar listo (isSupported es asíncrono) y
 * los primeros eventos pueden ocurrir antes, así que se guardan en una cola con
 * tope: si Analytics nunca carga (bloqueador, modo incógnito, sin consentimiento
 * del navegador), la cola no crece sin control y simplemente se descarta.
 *
 * Nada de lo que se mide identifica a un visitante ni nombra a un estudiante:
 * se registra qué secciones se alcanzan, cuántas tarjetas se abren y de qué
 * salón, cuántas se comparten y cuántos le dan play a un video. Ver README.
 */
const MAX_EN_COLA = 30;
let analytics = null;
let cola = [];

isSupported()
  .then((ok) => {
    if (!ok) { cola = []; return; }
    analytics = getAnalytics(app);
    cola.forEach(([nombre, parametros]) => logEvent(analytics, nombre, parametros));
    cola = [];
  })
  .catch(() => { cola = []; });

/** Registra un evento. Medir nunca debe romperle la página a nadie. */
export function medir(nombre, parametros = {}) {
  try {
    if (analytics) logEvent(analytics, nombre, parametros);
    else if (cola.length < MAX_EN_COLA) cola.push([nombre, parametros]);
  } catch {
    /* si Analytics falla, el portal sigue igual */
  }
}
