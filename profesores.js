/**
 * "Palabras de sus Maestros" · portal Gen 70 LSyH
 *
 * Grilla con los videos en los que los profesores le dejan un mensaje a la
 * generación. Los videos viven en YouTube (no listados) y la lista se arma a
 * mano en `public/maestros.json`: no hay formulario, ni base de datos, ni nada
 * que moderar. Para agregar o quitar un profesor se edita ese archivo, se
 * reconstruye y se publica.
 *
 * Mientras no haya ningún video activo, la sección y su enlace del menú quedan
 * ocultos: el portal se ve igual que antes hasta que se publique el primero.
 *
 * El iframe de YouTube solo se crea cuando alguien le da play. Hasta entonces la
 * tarjeta muestra la carátula del video, así que la página no carga nada de
 * YouTube (ni cookies ni scripts) por el solo hecho de abrirla.
 */

/** Desde cuántos videos vale la pena agrupar por área en vez de una sola grilla. */
const MINIMO_PARA_AGRUPAR = 10;

function escapar(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ordenarPorNombre(a, b) {
  return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
}

/**
 * Agrupa por área solo si hace falta: con pocos videos una sola grilla se ve
 * mejor, y agrupar cuando casi toda área tiene un único profesor deja una
 * pila de títulos sueltos en vez de grupos.
 */
function valeAgrupar(videos) {
  if (videos.length < MINIMO_PARA_AGRUPAR) return false;
  const areas = new Set(videos.map(v => String(v.area || '').trim().toLowerCase()).filter(Boolean));
  return areas.size > 1 && videos.length / areas.size >= 2;
}

export function initProfesores() {
  const seccion = document.getElementById('profesores');
  const lista   = document.getElementById('profes-lista');
  if (!seccion || !lista) return;

  const navItem = document.getElementById('nav-profes');

  fetch('./maestros.json', { cache: 'no-store' })
    .then(r => (r.ok ? r.json() : Promise.reject(new Error('maestros.json: ' + r.status))))
    .then(datos => {
      const videos = (Array.isArray(datos) ? datos : [])
        .filter(v => v && v.youtube && v.activo !== false)
        .sort(ordenarPorNombre);
      if (!videos.length) return;

      lista.innerHTML = valeAgrupar(videos) ? renderAgrupado(videos) : renderGrilla(videos);
      activarPlay(lista);

      seccion.hidden = false;
      if (navItem) navItem.hidden = false;
    })
    .catch(err => {
      // Sin videos la sección simplemente no existe para el visitante.
      console.error('Palabras de sus Maestros:', err);
    });
}

function renderGrilla(videos) {
  return `<div class="profes-grid">${videos.map(renderTarjeta).join('')}</div>`;
}

function renderAgrupado(videos) {
  const grupos = new Map();
  videos.forEach(v => {
    const area = String(v.area || '').trim() || 'Otras áreas';
    if (!grupos.has(area)) grupos.set(area, []);
    grupos.get(area).push(v);
  });
  return [...grupos.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'es', { sensitivity: 'base' }))
    .map(([area, items]) => `
      <section class="profes-grupo">
        <h3 class="profes-grupo-titulo">${escapar(area)}</h3>
        <div class="profes-grid">${items.map(renderTarjeta).join('')}</div>
      </section>`)
    .join('');
}

function renderTarjeta(v) {
  const id       = escapar(v.youtube);
  const nombre   = escapar(v.nombre || '');
  const area     = escapar(v.area || '');
  const vertical = v.formato === 'vertical' ? ' profe-card--vertical' : '';

  // maxresdefault no existe en todos los videos; hqdefault sí, y el recorte lo
  // resuelve el CSS con object-fit.
  return `
    <article class="profe-card${vertical}">
      <div class="profe-card-media">
        <button type="button" class="profe-card-play" data-youtube="${id}"
                aria-label="Reproducir el mensaje de ${nombre}">
          <img class="profe-card-poster" loading="lazy" alt=""
               src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg"
               onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'">
          <span class="profe-card-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </span>
        </button>
      </div>
      <div class="profe-card-pie">
        <p class="profe-card-nombre">${nombre}</p>
        ${area ? `<p class="profe-card-area">${area}</p>` : ''}
      </div>
    </article>`;
}

/** Al dar play, la carátula se reemplaza por el iframe ya reproduciendo. */
function activarPlay(lista) {
  lista.addEventListener('click', e => {
    const boton = e.target.closest('.profe-card-play');
    if (!boton) return;

    const id = boton.dataset.youtube;
    if (!id) return;

    const media = boton.closest('.profe-card-media');
    const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
      + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';

    media.innerHTML = `<iframe class="profe-card-iframe" src="${src}" title="Mensaje a la Generación 70"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  });
}
