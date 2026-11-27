// ─── El Leo de cada sueño ─────────────────────────────────────────────────────
//
// Además del Leo de siempre, puede haber una versión suya por tipo de sueño: Leo
// con bata y estetoscopio para los médicos, con balón para los futbolistas, con
// casco de obra y una casita en las manos para los dos que quieren construírsela
// a su mamá y a su abuelita.
//
// **No hay ninguna lista que mantener a mano.** Para agregar un Leo se deja el
// archivo en `assets/leos/` con el nombre del grupo (`assets/leos/pulso.webp`) y
// se reconstruye: Vite arma el mapa solo con lo que encuentre. Los grupos son los
// mismos de `simbolos.js`, y están listados con su descripción en
// `herramientas/leos-por-sueno.md`.
//
// Esto se hizo así a propósito. El número de canciones de la playlist está escrito
// a mano en el HTML y se quedó viejo durante días sin que nadie se diera cuenta;
// con 41 archivos posibles, una lista a mano se iba a desactualizar seguro.
//
// Mientras un grupo no tenga su Leo, el portal se comporta como antes: la tarjeta
// usa el Leo de siempre y la presentación muestra el símbolo de línea. Por eso se
// pueden ir agregando de a uno, sin tocar código.

import { nombreSimbolo } from './simbolos.js';

// Vite resuelve esto al construir y deja solo las URLs (con su hash), no las
// imágenes: lo que pesa se descarga nada más cuando alguien abre esa tarjeta.
const ARCHIVOS = import.meta.glob('./assets/leos/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** { pulso: '/assets/pulso-a1b2c3.webp', ... } */
export const LEOS = {};
for (const [ruta, url] of Object.entries(ARCHIVOS)) {
  const archivo = ruta.split('/').pop();
  const nombre = archivo.replace(/\.[^.]+$/, '');
  // Si alguien deja el mismo Leo en .webp y en .png, gana el .webp por liviano.
  if (!LEOS[nombre] || /\.webp$/i.test(archivo)) LEOS[nombre] = url;
}

/** La URL del Leo que le toca a este estudiante, o null si ese grupo no tiene. */
export function urlLeo(student) {
  return LEOS[nombreSimbolo(student)] || null;
}

/** Cuántos Leos hay hoy. Sirve para no prometer en el README lo que no existe. */
export function cuantosLeos() {
  return Object.keys(LEOS).length;
}

// Las diapositivas pasan cada 5 segundos y los estudiantes son 201, así que la
// misma imagen se pide muchas veces. Se guarda la promesa, no la imagen: así dos
// diapositivas seguidas del mismo grupo comparten una sola descarga.
const cache = new Map();

/**
 * Carga el Leo de este estudiante para dibujarlo en el canvas de la tarjeta.
 * Devuelve null si ese grupo todavía no tiene Leo o si la imagen no cargó, y en
 * los dos casos quien llama se queda con el Leo de siempre.
 */
export function cargarLeo(student) {
  const url = urlLeo(student);
  if (!url) return Promise.resolve(null);
  if (cache.has(url)) return cache.get(url);

  const promesa = new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
  cache.set(url, promesa);
  return promesa;
}
