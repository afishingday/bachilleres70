// main.js — Universo de los Sueños · Gen 70 LSyH

import { db, medir } from './firebase-client.js';
import { initSolicitudes } from './solicitudes.js';
import { initProfesores } from './profesores.js';
import { nombreSimbolo, simboloSVG, dibujarSimbolo } from './simbolos.js';
import { urlLeo, cargarLeo, leosBarajados } from './leos.js';
// El Leo de siempre, importado para que Vite le ponga su nombre con huella. Antes
// la tarjeta y el diálogo sacaban esta imagen del <img> del encabezado, pero ese
// <img> ahora va cambiando de Leo, así que ya no sirve como fuente del genérico.
import leoGenerico from './assets/mascota-lsyh.webp';
import {
  collection, onSnapshot, query, orderBy,
} from 'firebase/firestore';

// ─── Configuración de constelaciones ──────────────────────────────────────────
const CATEGORIES = {
  'Tecnología e Ingeniería':   { color: '#38bdf8', x: 25, y: 30 },
  'Salud y Medicina':          { color: '#34d399', x: 75, y: 25 },
  'Artes y Diseño':            { color: '#e879f9', x: 20, y: 72 },
  'Negocios y Emprendimiento': { color: '#facc15', x: 80, y: 72 },
  'Ciencias Sociales':         { color: '#fb923c', x: 50, y: 85 },
  'Ciencias Exactas':          { color: '#a78bfa', x: 50, y: 15 },
  'Deporte y Atletismo':       { color: '#f43f5e', x: 63, y: 50 },
  'Explorando su camino':      { color: '#cbd5e1', x: 37, y: 50 },
};

// Patrones para auto-categorizar sueños en texto libre
const CAT_PATTERNS = [
  [/^no s[eé]\b|no lo tengo claro|todav[ií]a|explorando|mejor persona|^ser (un )?profesional$|exitos|estabilidad|famos/i, 'Explorando su camino'],
  [/futbol|basket|nba|deport|atleti|peleador|automovilismo|arquero.profesional/i, 'Deporte y Atletismo'],
  [/ingen|sistem|softw|program|desarro|robot|intelig.artif|ciberseg|aeroesp|comput|tecnolog/i, 'Tecnología e Ingeniería'],
  [/medic|salud|enfermer|psicolog|neurocien|ciruj|farmac|biomed|veterin|odontolog/i, 'Salud y Medicina'],
  [/arte|diseñ|music|bail|cine|moda|animaci|fotograf|pintura|danza|teatro|literatur|arquitect/i, 'Artes y Diseño'],
  [/negoci|empresa|emprend|market|finanz|administr|comerci|venta|contadur|econom/i, 'Negocios y Emprendimiento'],
  [/derecho|ley|social|politi|periodis|sociolog|relacion|docenci|pedagog|educa/i, 'Ciencias Sociales'],
  [/matem|fisic|quimic|astronom|biolog|investig|cienci|estadist|geolog/i, 'Ciencias Exactas'],
];

// ─── Utilidades ───────────────────────────────────────────────────────────────
function escapar(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function normalize(text) {
  return (text || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function categorizarSueno(dream = '') {
  const d = normalize(dream);
  for (const [re, cat] of CAT_PATTERNS) if (re.test(d)) return cat;
  return 'Explorando su camino';
}

// Hash determinístico a partir de un string + semilla: evita que las estrellas
// salten de posición en cada re-render de Firestore.
function strHash(str, seed = 0) {
  let h = seed;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return (Math.abs(h) % 100000) / 100000; // 0..1
}

// Conteo por constelación (lo llena renderGalaxy): las constelaciones grandes ocupan más radio.
let CATEGORY_COUNTS = {};
function radioConstelacion(category) {
  const n = CATEGORY_COUNTS[category] || 8;
  return Math.min(20, 6 + 2.2 * Math.sqrt(n)); // 8 → 12, 21 → 16, 44 → 20
}

function posicionarEstrella(id, category) {
  const center = CATEGORIES[category] || Object.values(CATEGORIES)[0];
  const angle  = strHash(id, 1) * Math.PI * 2;
  const rMax   = radioConstelacion(category);
  const radius = 2 + Math.sqrt(strHash(id, 2)) * (rMax - 2);
  let x = center.x + Math.cos(angle) * radius;
  let y = center.y + Math.sin(angle) * radius;
  // Franja libre alrededor de la etiqueta de la constelación: que ninguna estrella tape el texto
  if (Math.abs(y - center.y) < 4.5 && Math.abs(x - center.x) < 13) {
    y = center.y + (y >= center.y ? 1 : -1) * (4.5 + strHash(id, 7) * 3);
  }
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
}

// ─── Estado de filtros ────────────────────────────────────────────────────────
let activeCategory  = null;
let activeGroup     = null;
let searchText      = '';
let currentStudents = []; // actualizado en renderGalaxy, leído por presentación y galería

// ─── Estado de galería ───────────────────────────────────────────────────────
let galeriaGroup  = null;
let galeriaSearch = '';

function applyFilters() {
  document.querySelectorAll('.estrella-wrap').forEach(wrap => {
    const catOk    = !activeCategory || wrap.dataset.cat === activeCategory;
    const groupOk  = !activeGroup    || wrap.dataset.grupo === activeGroup;
    const searchOk = !searchText
      || wrap.dataset.nombre.includes(searchText)
      || wrap.dataset.sueno.includes(searchText);
    wrap.classList.toggle('is-dimmed', !(catOk && groupOk && searchOk));
  });

  document.querySelectorAll('.mapa-nebula-blob, .mapa-cat-label').forEach(el => {
    el.classList.toggle('is-faded', !(!activeCategory || el.dataset.cat === activeCategory));
  });
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const tooltipEl  = document.getElementById('mapa-tooltip');
const mapaEl     = document.getElementById('universo-mapa');
const isTouch    = () => window.matchMedia('(pointer: coarse)').matches;

// Estudiante actualmente mostrado en el tooltip
let tooltipStudent = null;

// Delegación única: clic en el botón compartir dentro del tooltip
tooltipEl.addEventListener('click', e => {
  if (e.target.closest('.tooltip-share-btn')) {
    e.stopPropagation();
    if (tooltipStudent) askShareChoice(tooltipStudent);
  }
});

function showTooltip(student, xPct, yPct) {
  tooltipStudent = student;
  medir('abrir_estudiante', { origen: 'mapa', grupo: student.grupo || 'sin_grupo' });
  const cat   = CATEGORIES[student.category];
  const touch = isTouch();
  // El Leo del sueño de esta persona va dentro de la caja del sueño, en lugar de
  // la estrellita que era igual para todos (ver leos.js). Si el grupo no
  // tuviera archivo, vuelve la estrellita y no se nota.
  const leoDelSueno = urlLeo(student);

  // Las dos puntas van siempre en el HTML, cada una en su extremo; el CSS
  // muestra solo la que corresponde según dónde quedó la tarjeta. Se decide
  // más abajo, porque para eso hay que medir la tarjeta ya armada.
  tooltipEl.innerHTML =
    '<div class="tooltip-punta-arriba" aria-hidden="true"></div>' +
    `<div class="tooltip-card">
      <div class="tooltip-header">
        <span class="tooltip-cat" style="color:${cat.color};background:${cat.color}18;border-color:${cat.color}40">${escapar(student.category)}</span>
        <span class="tooltip-grupo">${escapar(student.grupo || '')}</span>
      </div>
      <h4 class="tooltip-name">${escapar(student.nombre || '')}</h4>
      <div class="tooltip-dream-box${leoDelSueno ? ' con-leo' : ''}">
        ${leoDelSueno
          ? `<img class="tooltip-leo" src="${leoDelSueno}" alt="" aria-hidden="true">`
          : `<svg class="tooltip-dream-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${cat.color}" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`}
        <span class="tooltip-dream-text">"${escapar(student.sueno || 'Sueño por revelar…')}"</span>
      </div>
      <button class="tooltip-share-btn" id="tooltip-share-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Compartir sueño
      </button>
    </div>` +
    '<div class="tooltip-punta-abajo" aria-hidden="true"></div>';

  tooltipEl.classList.remove('abre-arriba', 'abre-abajo');
  tooltipEl.hidden = false;

  if (touch) {
    // En mobile: CSS ancla el tooltip al fondo del mapa (bottom:0)
    tooltipEl.style.left      = '';
    tooltipEl.style.top       = '';
    tooltipEl.style.transform = '';
  } else {
    // En desktop: flotante cerca de la estrella, sin salirse del mapa ni de la
    // pantalla. Los dos márgenes se calculan midiendo la tarjeta ya armada, en
    // vez de los porcentajes fijos de antes (12–88 % y 38 %), que estaban
    // hechos a la medida de una tarjeta de ~250 px: con el Leo adentro llega a
    // 330 px de alto y el encabezado de varias quedaba fuera de la vista.
    const mapa = mapaEl.getBoundingClientRect();

    const mitad  = (tooltipEl.offsetWidth / 2 + 10) / mapa.width * 100;
    const x      = Math.max(mitad, Math.min(100 - mitad, xPct));
    tooltipEl.style.left = x + '%';

    const estrellaY = mapa.top + (yPct / 100) * mapa.height;
    const abajo     = estrellaY - tooltipEl.offsetHeight - 18 < 8;

    tooltipEl.classList.add(abajo ? 'abre-abajo' : 'abre-arriba');
    if (abajo) {
      tooltipEl.style.top       = (yPct + 4) + '%';
      tooltipEl.style.transform = 'translate(-50%, 0)';
    } else {
      tooltipEl.style.top       = yPct + '%';
      tooltipEl.style.transform = 'translate(-50%, calc(-100% - 0.75rem))';
    }
  }
}

function hideTooltip() { tooltipEl.hidden = true; }

// ─── Galaxia ──────────────────────────────────────────────────────────────────
function renderGalaxy(rawStudents) {
  const students = rawStudents
    .filter(s => s.activo !== false)
    .map(s => ({
      ...s,
      category: s.categoria || categorizarSueno(s.sueno),
    }));

  currentStudents = students;
  CATEGORY_COUNTS = {};
  students.forEach(s => { CATEGORY_COUNTS[s.category] = (CATEGORY_COUNTS[s.category] || 0) + 1; });

  const estrellas = document.getElementById('mapa-estrellas');
  const nebulaes  = document.getElementById('mapa-nebulaes');
  const labels    = document.getElementById('mapa-labels');
  const statsEl   = document.getElementById('stats-count');
  const loading   = document.getElementById('mapa-loading');

  estrellas.innerHTML = '';
  nebulaes.innerHTML  = '';
  labels.innerHTML    = '';

  // Nebulosas y etiquetas de categoría
  for (const [cat, info] of Object.entries(CATEGORIES)) {
    const blob = document.createElement('div');
    blob.className = 'mapa-nebula-blob';
    blob.style.cssText = `left:${info.x}%;top:${info.y}%;background:${info.color}`;
    blob.dataset.cat = cat;
    nebulaes.appendChild(blob);

    const lbl = document.createElement('div');
    lbl.className = 'mapa-cat-label';
    lbl.style.cssText = `left:${info.x}%;top:${info.y}%`;
    lbl.dataset.cat = cat;
    lbl.innerHTML = `<span class="mapa-cat-label-text" style="color:${info.color};text-shadow:0 0 8px ${info.color},0 0 20px ${info.color}60,0 2px 4px rgba(0,0,0,1)">${cat}</span>`;
    labels.appendChild(lbl);
  }

  // Estrellas
  students.forEach(student => {
    const id      = String(student.id || student.nombre || Math.random());
    // Clave para repartir y animar: el nombre da valores bien distribuidos; los ids ('70001'…) casi no varían.
    const claveHash = `${student.nombre || ''}|${id}`;
    const catInfo = CATEGORIES[student.category] || Object.values(CATEGORIES)[0];
    const { x, y } = posicionarEstrella(claveHash, student.category);
    const size    = 8 + strHash(claveHash, 5) * 6;       // 8–14 px
    const dur     = 4 + strHash(claveHash, 3) * 5;        // 4–9 s
    const delay   = strHash(claveHash, 4) * 6;            // 0–6 s
    const pDur    = 2 + strHash(claveHash, 6) * 2;        // 2–4 s

    const wrap = document.createElement('div');
    wrap.className = 'estrella-wrap';
    wrap.style.cssText = `left:${x}%;top:${y}%;--dur:${dur}s;--delay:${delay}s;--pulse-dur:${pDur}s`;
    wrap.dataset.cat    = student.category;
    wrap.dataset.grupo  = student.grupo || '';
    wrap.dataset.nombre = normalize(student.nombre || '');
    wrap.dataset.sueno  = normalize(student.sueno  || '');

    const star = document.createElement('div');
    star.className = 'estrella';
    star.style.cssText =
      `width:${size}px;height:${size}px;background:${catInfo.color};` +
      `box-shadow:0 0 ${size}px ${catInfo.color}70,0 0 ${size * 2}px ${catInfo.color}30`;
    star.innerHTML = '<div class="estrella-core"></div>';

    wrap.appendChild(star);
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', `${student.nombre} – ${student.sueno || 'Sin sueño'}`);

    // Foco: solo cuando viene del teclado. En táctil, mostrar al enfocar dejaba la tarjeta
    // bajo el dedo y el mismo toque la cerraba (97 de 164 estrellas no abrían en celular).
    wrap.addEventListener('focus', () => { if (wrap.matches(':focus-visible')) showTooltip(student, x, y); });
    wrap.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTooltip(student, x, y); }
      if (e.key === 'Escape') hideTooltip();
    });

    wrap.addEventListener('click', e => {
      e.stopPropagation();
      // Toggle: si ya está mostrando este estudiante, cierra
      if (!tooltipEl.hidden && tooltipEl.dataset.activeId === id) {
        hideTooltip();
        delete tooltipEl.dataset.activeId;
      } else {
        tooltipEl.dataset.activeId = id;
        showTooltip(student, x, y);
      }
    });

    estrellas.appendChild(wrap);
  });

  // Cerrar tooltip al hacer clic fuera — excluye la estrella (toggle propio) y el tooltip mismo
  mapaEl.addEventListener('click', e => {
    if (!e.target.closest('.estrella-wrap') && !e.target.closest('.mapa-tooltip')) {
      hideTooltip();
      delete tooltipEl.dataset.activeId;
    }
  });

  if (loading) loading.classList.add('is-hidden');
  if (statsEl) statsEl.textContent = students.length;


  // Hint adaptativo según dispositivo
  const hintEl = document.querySelector('.mapa-hint');
  if (hintEl) {
    hintEl.textContent = isTouch()
      ? 'Toca una estrella para ver el sueño'
      : 'Haz clic en una estrella para ver su sueño';
  }

  buildCategoryButtons(students);
  buildGroupButtons(students);
  applyFilters();
  renderGaleriaCards();
}

// ─── Botones de categoría ─────────────────────────────────────────────────────
function buildCategoryButtons(students) {
  const list = document.getElementById('categorias-list');
  if (!list) return;

  const counts = {};
  students.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });

  list.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'categoria-btn is-active';
  allBtn.dataset.cat = '';
  allBtn.innerHTML =
    '<span class="categoria-dot" style="background:rgba(255,255,255,0.28)"></span>' +
    'Ver todo <span class="cat-count">' + students.length + '</span>';
  allBtn.addEventListener('click', () => setCategory(null));
  list.appendChild(allBtn);

  for (const [cat, info] of Object.entries(CATEGORIES)) {
    const btn = document.createElement('button');
    btn.className = 'categoria-btn';
    btn.dataset.cat = cat;
    btn.innerHTML =
      `<span class="categoria-dot" style="background:${info.color}"></span>` +
      `${cat} <span class="cat-count">${counts[cat] || 0}</span>`;
    btn.addEventListener('click', () => setCategory(cat));
    list.appendChild(btn);
  }
}

function setCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.categoria-btn').forEach(btn => {
    btn.classList.toggle('is-active', (btn.dataset.cat || null) === cat);
  });
  applyFilters();
}

// ─── Botones de grupo ─────────────────────────────────────────────────────────
const GROUPS = ['11A', '11B', '11C', '11D', '11E', '11F'];

function buildGroupButtons(students) {
  const list = document.getElementById('grupos-list');
  if (!list) return;

  const counts = {};
  students.forEach(s => { if (s.grupo) counts[s.grupo] = (counts[s.grupo] || 0) + 1; });

  list.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'grupo-btn is-active';
  allBtn.dataset.grupo = '';
  allBtn.textContent = 'Todos';
  allBtn.addEventListener('click', () => setGroup(null));
  list.appendChild(allBtn);

  GROUPS.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'grupo-btn';
    btn.dataset.grupo = g;
    btn.textContent = g + (counts[g] ? ` (${counts[g]})` : '');
    btn.addEventListener('click', () => setGroup(g));
    list.appendChild(btn);
  });
}

function setGroup(g) {
  activeGroup = g;
  document.querySelectorAll('.grupo-btn').forEach(btn => {
    btn.classList.toggle('is-active', (btn.dataset.grupo || null) === g);
  });
  applyFilters();
}

// Escape cierra el tooltip; clic fuera del mapa también
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !tooltipEl.hidden) { hideTooltip(); delete tooltipEl.dataset.activeId; }
});
document.addEventListener('click', e => {
  if (!tooltipEl.hidden && !e.target.closest('#universo-mapa')) {
    hideTooltip(); delete tooltipEl.dataset.activeId;
  }
});

// ─── Búsqueda sincronizada entre nav y sidebar ────────────────────────────────
const navSearchEl  = document.getElementById('busqueda-global');
const mapaSearchEl = document.getElementById('mapa-search');

function handleSearch(value, source) {
  searchText = normalize(value.trim());
  applyFilters();
  if (navSearchEl  && source !== 'nav')   navSearchEl.value  = value;
  if (mapaSearchEl && source !== 'mapa')  mapaSearchEl.value = value;
}

let navSearchPrev = '';
if (navSearchEl) navSearchEl.addEventListener('input', () => {
  const v = navSearchEl.value;
  handleSearch(v, 'nav');
  // Al empezar a escribir desde otra sección, llevar la vista al universo para que se vea el filtro
  if (v.trim() && !navSearchPrev.trim()) {
    const uni = document.getElementById('universo');
    const r = uni?.getBoundingClientRect();
    if (r && (r.top > window.innerHeight * 0.5 || r.bottom < window.innerHeight * 0.5)) {
      uni.scrollIntoView({ behavior: 'smooth' });
    }
  }
  navSearchPrev = v;
});
if (mapaSearchEl) mapaSearchEl.addEventListener('input', () => handleSearch(mapaSearchEl.value, 'mapa'));

// ─── Nav: sombra al hacer scroll ──────────────────────────────────────────────
(function setupNavShadow() {
  const header = document.querySelector('.header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });
})();

// ─── Nav: active state via IntersectionObserver ───────────────────────────────
(function setupNavActive() {
  const links    = document.querySelectorAll('.nav-menu a[href^="#"]');
  const sections = document.querySelectorAll('main section[id]');
  if (!links.length || !sections.length) return;

  const map = new Map();
  links.forEach(l => { const id = (l.getAttribute('href') || '').slice(1); if (id) map.set(id, l); });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = map.get(e.target.id);
      if (link) link.classList.toggle('is-active', e.isIntersecting);
    });
  }, { rootMargin: '-25% 0px -70% 0px' });

  sections.forEach(s => obs.observe(s));
})();

// ─── Nav: hamburger ───────────────────────────────────────────────────────────
(function setupNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  const open  = () => { menu.classList.add('is-open');    toggle.setAttribute('aria-expanded', 'true');  document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };

  toggle.addEventListener('click', () => menu.classList.contains('is-open') ? close() : open());
  document.querySelectorAll('.nav-menu a').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
})();

// ─── Galería de tarjetas ──────────────────────────────────────────────────────
let temporizadorBusquedaVacia = null;

// Los dos iconos de las tarjetas, en una sola copia: salen hasta cuatro veces
// por tarjeta y las tarjetas son más de doscientas.
const ICONO_VOLTEAR =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>';
const ICONO_COMPARTIR =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';

function renderGaleriaCards() {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  const filtered = currentStudents.filter(s => {
    const groupOk  = !galeriaGroup  || s.grupo === galeriaGroup;
    const searchOk = !galeriaSearch
      || normalize(s.nombre).includes(galeriaSearch)
      || normalize(s.sueno || '').includes(galeriaSearch);
    return groupOk && searchOk;
  });

  if (!filtered.length) {
    // Se mide un rato después de dejar de escribir: si no, cada letra de una
    // búsqueda que todavía no termina contaría como una búsqueda fallida.
    clearTimeout(temporizadorBusquedaVacia);
    temporizadorBusquedaVacia = setTimeout(
      () => medir('busqueda_sin_resultados', { donde: 'galeria' }), 1200,
    );
    // Quien busca su nombre y no se encuentra es justo a quien le sirve el
    // formulario. El enlace se toma de la sección "Tu huella" para no repetirlo.
    const cta = document.querySelector('.suma-huella-cta');
    const invitacion = cta
      ? ` ¿Eres de la Generación 70 y no alcanzaste a responder? <a href="${cta.href}" target="_blank" rel="noopener">Déjanos tus datos aquí.</a>`
      : '';
    grid.innerHTML = `<p class="galeria-empty">No se encontraron sueños.${invitacion}</p>`;
    return;
  }

  clearTimeout(temporizadorBusquedaVacia);

  grid.innerHTML = '';
  filtered.forEach(s => {
    const cat  = CATEGORIES[s.category] || Object.values(CATEGORIES)[0];
    const hasMensaje = !!s.mensaje;
    const card = document.createElement('div');
    card.className = 'galeria-card' + (hasMensaje ? '' : ' galeria-card--sin-mensaje');
    card.style.setProperty('--cat-color', cat.color);
    card.dataset.sid = String(s.id || s.nombre);

    card.innerHTML =
      `<div class="galeria-card-inner">
        <div class="galeria-card-face galeria-card-front">
          <div class="galeria-card-top">
            <span class="galeria-card-cat" style="color:${cat.color}">${escapar(s.category)}</span>
            <span class="galeria-card-grupo">${escapar(s.grupo || '')}</span>
          </div>
          <h3 class="galeria-card-nombre">${escapar(s.nombre || '')}</h3>
          <p class="galeria-card-sueno">"${escapar(s.sueno || 'Sueño por revelar…')}"</p>
          <div class="galeria-card-footer">
            ${hasMensaje
              ? `<button class="galeria-card-flip" aria-label="Ver el mensaje de ${escapar(s.nombre || '')} a la generación">
                   ${ICONO_VOLTEAR}
                   Ver mensaje
                 </button>`
              : '<span></span>'}
            <button class="galeria-card-share" aria-label="Compartir sueño de ${escapar(s.nombre || '')}">
              ${ICONO_COMPARTIR}
              Compartir
            </button>
          </div>
        </div>
        <div class="galeria-card-face galeria-card-back">
          <p class="galeria-back-label">Mensaje a la Generación 70</p>
          ${hasMensaje
            ? `<p class="galeria-back-mensaje">"${escapar(s.mensaje)}"</p>`
            : `<p class="galeria-back-empty">Su sueño habla por sí solo.</p>`}
          <p class="galeria-back-firma">— ${escapar(s.nombre || '')}, ${escapar(s.grupo || '')}</p>
          ${hasMensaje
            ? `<div class="galeria-card-footer galeria-back-footer">
                 <button class="galeria-card-flip galeria-card-volver" aria-label="Volver al sueño de ${escapar(s.nombre || '')}">
                   ${ICONO_VOLTEAR}
                   Volver
                 </button>
                 <button class="galeria-card-share galeria-share-mensaje" aria-label="Compartir el mensaje de ${escapar(s.nombre || '')}">
                   ${ICONO_COMPARTIR}
                   Compartir
                 </button>
               </div>`
            : ''}
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function initGaleria() {
  const searchEl = document.getElementById('galeria-search');
  const tabsEl   = document.getElementById('galeria-tabs');
  const grid     = document.getElementById('galeria-grid');
  if (!grid) return;

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      galeriaSearch = normalize(searchEl.value.trim());
      renderGaleriaCards();
    });
  }

  if (tabsEl) {
    function setGaleriaGroup(g, btn) {
      galeriaGroup = g;
      tabsEl.querySelectorAll('.galeria-tab').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      renderGaleriaCards();
    }
    const allBtn = document.createElement('button');
    allBtn.className = 'galeria-tab is-active';
    allBtn.textContent = 'Todos';
    allBtn.addEventListener('click', () => setGaleriaGroup(null, allBtn));
    tabsEl.appendChild(allBtn);

    GROUPS.forEach(g => {
      const btn = document.createElement('button');
      btn.className = 'galeria-tab';
      btn.textContent = g;
      btn.addEventListener('click', () => setGaleriaGroup(g, btn));
      tabsEl.appendChild(btn);
    });
  }

  // Delegación: compartir o voltear tarjeta
  const dueno = el => {
    const sid = el.closest('.galeria-card')?.dataset.sid;
    return currentStudents.find(s => String(s.id || s.nombre) === sid);
  };

  grid.addEventListener('click', e => {
    // El de atrás comparte el mensaje; el de adelante, el sueño. Los dos se ven
    // igual porque los dos dicen "Compartir" sobre la cara que ya se está
    // mirando: lo que cambia es qué hay en esa cara.
    const shareBtn = e.target.closest('.galeria-card-share');
    if (shareBtn) {
      e.stopPropagation();
      const student = dueno(shareBtn);
      if (student) {
        askShareChoice(student, shareBtn.classList.contains('galeria-share-mensaje') ? 'mensaje' : 'sueno');
      }
      return;
    }

    const card = e.target.closest('.galeria-card');
    if (card && !card.classList.contains('galeria-card--sin-mensaje')) {
      card.classList.toggle('is-flipped');
      if (card.classList.contains('is-flipped')) {
        const s = dueno(card);
        medir('abrir_estudiante', { origen: 'galeria', grupo: (s && s.grupo) || 'sin_grupo' });
      }
    }
  });
}

// ─── Diálogo: con o sin Leo ───────────────────────────────────────────────────
const shareChoiceOverlay = document.getElementById('share-choice-overlay');
const shareConLeoBtn     = document.getElementById('share-con-leo');
const shareSinLeoBtn     = document.getElementById('share-sin-leo');
const shareCancelBtn     = document.getElementById('share-choice-cancel');

// La miniatura del botón "Con Leo". Arranca con el Leo de siempre y en cada
// apertura del diálogo pasa al del sueño de esa persona (ver askShareChoice).
let leoPreviewImg = null;
(function injectLeoPreview() {
  const preview = document.getElementById('share-choice-leo-preview');
  if (!preview) return;
  const img = new Image();
  img.src = leoGenerico;
  img.alt = 'Leo';
  img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
  preview.appendChild(img);
  leoPreviewImg = img;
})();

// Las dos pestañas de "qué compartir" y los textos que cambian con ellas.
const shareQueWrap   = document.getElementById('share-que');
const shareQueSueno  = document.getElementById('share-que-sueno');
const shareQueMsj    = document.getElementById('share-que-mensaje');
const shareLabelEl   = document.getElementById('share-choice-label');
const shareSinLeoDesc = document.getElementById('share-sin-leo-desc');

let _shareChoiceResolve = null;
let _shareChoiceStudent = null;
let _shareQue = 'sueno';

function pintarQue(que) {
  _shareQue = que;
  const esMsj = que === 'mensaje';
  shareQueSueno?.classList.toggle('is-active', !esMsj);
  shareQueMsj?.classList.toggle('is-active', esMsj);
  shareQueSueno?.setAttribute('aria-pressed', String(!esMsj));
  shareQueMsj?.setAttribute('aria-pressed', String(esMsj));
  if (shareLabelEl)    shareLabelEl.textContent = esMsj ? 'Compartir mensaje' : 'Compartir sueño';
  if (shareSinLeoDesc) shareSinLeoDesc.textContent = esMsj
    ? 'Solo el mensaje y las estrellas'
    : 'Solo el sueño y las estrellas';
}

shareQueSueno?.addEventListener('click', () => pintarQue('sueno'));
shareQueMsj?.addEventListener('click', () => pintarQue('mensaje'));

function askShareChoice(student, que = 'sueno') {
  _shareChoiceStudent = student;
  const tieneMensaje = !!student.mensaje;
  const queInicial = tieneMensaje && que === 'mensaje' ? 'mensaje' : 'sueno';
  if (!shareChoiceOverlay) { generateShareCard(student, true, queInicial); return; }
  // El botón muestra el Leo que de verdad va a salir en la tarjeta: el del sueño
  // de esta persona si su grupo ya tiene uno, y si no el de siempre (ver leos.js).
  if (leoPreviewImg) {
    leoPreviewImg.src = urlLeo(student) || leoGenerico;
  }
  if (shareQueWrap) shareQueWrap.hidden = !tieneMensaje;
  pintarQue(queInicial);
  shareChoiceOverlay.hidden = false;
  _shareChoiceResolve = withMascot => {
    shareChoiceOverlay.hidden = true;
    _shareChoiceResolve = null;
    generateShareCard(student, withMascot, _shareQue);
  };
}

shareConLeoBtn?.addEventListener('click', () => {
  // Desde que hay un Leo por sueño, "con Leo" son dos tarjetas distintas: la del
  // Leo de esa persona y la del Leo de siempre, que es la que les toca a los
  // grupos que todavía no tienen el suyo. Se distinguen dentro del mismo
  // parámetro `tipo` a propósito: ya está registrado en Analytics como "Tipo de
  // tarjeta", así que no hay que registrar nada nuevo para poder verlo. Lo
  // mismo con el prefijo "mensaje_": así se ve qué se comparte más sin abrir
  // una dimensión nueva, que además no sería retroactiva.
  const propio = _shareChoiceStudent && urlLeo(_shareChoiceStudent);
  medir('compartir_tarjeta', { tipo: tipoTarjeta(propio ? 'con_leo_propio' : 'con_leo_generico') });
  _shareChoiceResolve?.(true);
});
shareSinLeoBtn?.addEventListener('click', () => {
  medir('compartir_tarjeta', { tipo: tipoTarjeta('sin_leo') });
  _shareChoiceResolve?.(false);
});

function tipoTarjeta(base) {
  return _shareQue === 'mensaje' ? 'mensaje_' + base : base;
}
shareCancelBtn?.addEventListener('click', () => {
  shareChoiceOverlay.hidden = true;
  _shareChoiceResolve = null;
});
shareChoiceOverlay?.addEventListener('click', e => {
  if (e.target === shareChoiceOverlay) {
    shareChoiceOverlay.hidden = true;
    _shareChoiceResolve = null;
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !shareChoiceOverlay?.hidden) {
    shareChoiceOverlay.hidden = true;
    _shareChoiceResolve = null;
  }
});

// ─── Tarjeta compartible (Canvas) ────────────────────────────────────────────
// Parte un texto en renglones con la tipografía que ya tenga puesta el lienzo.
function partirEnLineas(ctx, texto, anchoMax) {
  const lineas = [];
  let linea = '';
  for (const palabra of texto.split(' ')) {
    const prueba = linea + (linea ? ' ' : '') + palabra;
    if (ctx.measureText(prueba).width > anchoMax && linea) {
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = prueba;
    }
  }
  if (linea) lineas.push(linea);
  return lineas;
}

function wrapTextCanvas(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lineas = partirEnLineas(ctx, text, maxWidth);
  const visibles = lineas.slice(0, maxLines);
  if (lineas.length > maxLines) visibles[visibles.length - 1] += '…';
  visibles.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return visibles.length;
}

// Los mensajes a la generación van de siete caracteres a cuatrocientos: no hay
// un tamaño de letra que le sirva a los dos. Se prueba de mayor a menor y se
// usa el primero que quepa entero en la banda disponible; si ni el más chico
// alcanza, se corta con puntos suspensivos antes que desbordar la tarjeta.
function ajustarTexto(ctx, texto, anchoMax, altoDisponible, tamanos, fuente) {
  for (const sz of tamanos) {
    ctx.font = fuente(sz);
    const lineas = partirEnLineas(ctx, texto, anchoMax);
    const interlinea = Math.round(sz * 1.42);
    if (lineas.length * interlinea <= altoDisponible) return { sz, lineas, interlinea };
  }
  const sz = tamanos[tamanos.length - 1];
  ctx.font = fuente(sz);
  const interlinea = Math.round(sz * 1.42);
  const caben = Math.max(1, Math.floor(altoDisponible / interlinea));
  const lineas = partirEnLineas(ctx, texto, anchoMax).slice(0, caben);
  lineas[lineas.length - 1] += '…';
  return { sz, lineas, interlinea };
}

// Primero el Leo del sueño de esta persona; si ese grupo todavía no tiene el
// suyo, el Leo de siempre, que además ya está cargado en el DOM por el hero.
async function loadMascotImg(student) {
  const propio = student ? await cargarLeo(student) : null;
  if (propio) return propio;

  // El genérico se pide aparte y no se toma del encabezado: allá el Leo va
  // cambiando, y la tarjeta de respaldo tiene que salir siempre igual.
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = leoGenerico;
  });
}

function downloadCanvas(canvas, fileName) {
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => document.body.removeChild(a));
}

async function generateShareCard(student, withMascot = true, que = 'sueno') {
  try {
    await document.fonts.ready;
    const mascot = withMascot ? await loadMascotImg(student) : null;

    // Dos tarjetas con el mismo marco. La del sueño es una frase corta y el
    // Leo manda; la del mensaje a la generación puede ser una carta de despedida
    // de cuatrocientos caracteres, así que el Leo cede altura para que quepa.
    const esMensaje = que === 'mensaje' && !!student.mensaje;
    const textoMsj  = esMensaje ? String(student.mensaje) : '';

    const W = 1080, H = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const cat = CATEGORIES[student.category] || Object.values(CATEGORIES)[0];

    // Fondo oscuro
    const bg = ctx.createRadialGradient(W / 2, H * 0.38, 0, W / 2, H * 0.38, W * 0.75);
    bg.addColorStop(0, '#0f172a'); bg.addColorStop(1, '#020617');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Micro-estrellas
    for (let i = 0; i < 130; i++) {
      const sx = (Math.sin(i * 3.14) * 0.5 + 0.5) * W;
      const sy = (Math.sin(i * 7.39) * 0.5 + 0.5) * H;
      const sr = (Math.sin(i * 5.71) * 0.5 + 0.5) * 1.4 + 0.2;
      const sa = 0.3 + (Math.sin(i * 2.33) * 0.5 + 0.5) * 0.55;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${sa.toFixed(2)})`; ctx.fill();
    }

    // Alto reservado al Leo. Todo lo de abajo se coloca a partir de aquí, así
    // que achicarlo en la tarjeta de un mensaje largo le regala esos píxeles al
    // texto sin descuadrar nada.
    const altoMax  = esMensaje ? (textoMsj.length > 150 ? 210 : 255) : 290;
    const baseY    = 30 + altoMax;

    // Nebulosa de categoría detrás de la mascota
    const nebY = mascot ? baseY - 110 : baseY - 65;
    const neb = ctx.createRadialGradient(W / 2, nebY, 0, W / 2, nebY, 380);
    neb.addColorStop(0, cat.color + '50'); neb.addColorStop(1, 'transparent');
    ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);

    // Mascota (o estrella de fallback)
    if (mascot) {
      // El Leo de siempre es más alto que ancho, pero los Leos por sueño los
      // genera una IA y pueden venir cuadrados o apaisados. Se limitan los dos
      // lados y se apoyan por abajo, así el espacio hasta el nombre de la
      // constelación es el mismo salga la proporción que salga.
      const anchoMax = 420;
      let mH = altoMax;
      let mW = (mascot.naturalWidth / mascot.naturalHeight) * mH;
      if (mW > anchoMax) {
        mW = anchoMax;
        mH = (mascot.naturalHeight / mascot.naturalWidth) * mW;
      }
      const mX = W / 2 - mW / 2;
      const mY = 30 + (altoMax - mH);
      ctx.save();
      ctx.shadowColor = cat.color; ctx.shadowBlur = 60;
      ctx.drawImage(mascot, mX, mY, mW, mH);
      ctx.restore();
    } else {
      // Sin Leo, quien acompaña es el símbolo del sueño: el disco es la luz de su
      // estrella, apagada a propósito para que el trazo se lea encima en vez de
      // perderse en el resplandor (ver simbolos.js).
      // En la tarjeta de un mensaje el símbolo cede lo mismo que cedería el
      // Leo, o su resplandor se le monta al nombre de la constelación.
      const R = esMensaje ? 118 : 150;
      ctx.save();
      ctx.shadowColor = cat.color; ctx.shadowBlur = 80;
      const sg = ctx.createRadialGradient(W / 2, nebY, 0, W / 2, nebY, R);
      sg.addColorStop(0, cat.color + '4d');
      sg.addColorStop(0.7, cat.color + '20');
      sg.addColorStop(1, cat.color + '00');
      ctx.fillStyle = sg;
      ctx.beginPath(); ctx.arc(W / 2, nebY, R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowColor = cat.color; ctx.shadowBlur = 36;
      dibujarSimbolo(ctx, nombreSimbolo(student), W / 2, nebY, esMensaje ? 136 : 172, '#eaf2fb');
      ctx.restore();
    }

    // Categoría
    ctx.font = '700 26px "Outfit", sans-serif';
    ctx.fillStyle = cat.color; ctx.textAlign = 'center';
    ctx.fillText(student.category.toUpperCase(), W / 2, baseY + 60);

    // Separador
    ctx.strokeStyle = cat.color + '35'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 200, baseY + 80); ctx.lineTo(W / 2 + 200, baseY + 80); ctx.stroke();

    // Nombre (tamaño adaptable)
    let nameSz = 76;
    ctx.font = `800 ${nameSz}px "Outfit", sans-serif`;
    while (ctx.measureText(student.nombre || '').width > W - 100 && nameSz > 40) {
      nameSz -= 4;
      ctx.font = `800 ${nameSz}px "Outfit", sans-serif`;
    }
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(student.nombre || '', W / 2, baseY + 170);

    // Grupo
    ctx.font = '500 28px "DM Sans", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(student.grupo || '', W / 2, baseY + 220);

    // Separador
    ctx.strokeStyle = cat.color + '30';
    ctx.beginPath(); ctx.moveTo(W / 2 - 260, baseY + 252); ctx.lineTo(W / 2 + 260, baseY + 252); ctx.stroke();

    if (esMensaje) {
      // Quién habla y a quién: sin este rótulo la tarjeta se confunde con la
      // del sueño, que tiene exactamente el mismo marco.
      ctx.font = '700 22px "Outfit", sans-serif';
      ctx.fillStyle = cat.color + 'cc';
      ctx.letterSpacing = '3px';
      ctx.fillText('MENSAJE A LA GENERACIÓN 70', W / 2, baseY + 300);
      ctx.letterSpacing = '0px';

      const arriba = baseY + 348;
      const abajo  = 860;
      const { lineas, interlinea } = ajustarTexto(
        ctx, `"${textoMsj}"`, 880, abajo - arriba,
        [56, 48, 42, 38, 34, 30, 27, 24, 22],
        sz => `italic 400 ${sz}px "DM Sans", sans-serif`,
      );
      // Centrado vertical dentro de la banda: un mensaje de una línea no debe
      // quedar pegado al rótulo con un hueco enorme debajo.
      const alto = lineas.length * interlinea;
      const y0 = arriba + (abajo - arriba - alto) / 2 + interlinea * 0.75;
      ctx.fillStyle = '#cbd5e1';
      lineas.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * interlinea));
    } else {
      // Sueño
      ctx.font = 'italic 400 34px "DM Sans", sans-serif';
      ctx.fillStyle = '#94a3b8'; ctx.textAlign = 'center';
      wrapTextCanvas(ctx, `"${student.sueno || 'Sueño por revelar…'}"`, W / 2, baseY + 308, 860, 52, 4);
    }

    // Branding
    ctx.font = '500 22px "Outfit", sans-serif';
    ctx.fillStyle = 'rgba(100,116,139,0.45)';
    ctx.fillText('Universo de los Sueños · Gen 70 LSyH', W / 2, 900);
    ctx.font = '600 26px "Outfit", sans-serif';
    ctx.fillStyle = cat.color + 'bb';
    ctx.fillText('syhg70.web.app', W / 2, 940);

    const fileName = `${esMensaje ? 'mensaje' : 'sueno'}-${(student.nombre || 'gen70').replace(/\s+/g, '-').toLowerCase()}.png`;

    // Mobile con HTTPS: diálogo nativo de compartir
    if (location.protocol === 'https:' && navigator.share) {
      canvas.toBlob(async blob => {
        const file = new File([blob], fileName, { type: 'image/png' });
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: esMensaje ? `Mensaje de ${student.nombre}` : `Sueño de ${student.nombre}`,
            });
            return;
          }
        } catch { /* cancelado por usuario */ }
        downloadCanvas(canvas, fileName);
      });
    } else {
      // Desktop o localhost: descarga directa
      downloadCanvas(canvas, fileName);
    }
  } catch (err) {
    console.error('Error generando tarjeta:', err);
  }
}

// ─── Modo Presentación ────────────────────────────────────────────────────────
function initPresentacion() {
  const overlay   = document.getElementById('pres-overlay');
  const btnOpen   = document.getElementById('btn-presentacion');
  const btnClose  = document.getElementById('pres-close');
  const btnPrev   = document.getElementById('pres-prev');
  const btnNext   = document.getElementById('pres-next');
  const btnPlay   = document.getElementById('pres-play');
  const nebulaEl  = document.getElementById('pres-nebula');
  const starEl    = document.getElementById('pres-star');
  const starWrapEl = document.getElementById('pres-star-wrap');
  const simboloEl = document.getElementById('pres-simbolo');
  const leoEl     = document.getElementById('pres-leo');
  const catEl     = document.getElementById('pres-cat');
  const nombreEl  = document.getElementById('pres-nombre');
  const grupoEl   = document.getElementById('pres-grupo');
  const suenoEl   = document.getElementById('pres-sueno');
  const fillEl    = document.getElementById('pres-progress-fill');
  const counterEl = document.getElementById('pres-counter');
  const contentEl = document.getElementById('pres-content');
  const iconPause = btnPlay?.querySelector('.icon-pause');
  const iconPlay  = btnPlay?.querySelector('.icon-play');

  if (!overlay || !btnOpen) return;

  const SLIDE_MS = 5000;
  let idx = 0, playing = true, timer = null;

  const presSearchEl = document.getElementById('pres-search');

  // Orden de la presentación: A–Z (como llegan, ordenados por nombre), Z–A o aleatorio
  const ordenBtns = document.querySelectorAll('.pres-orden-btn');
  let orden = 'az';
  let listaAleatoria = null;

  function barajar(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function listaBase() {
    if (orden === 'za') return [...currentStudents].reverse();
    if (orden === 'rand') {
      if (!listaAleatoria || listaAleatoria.length !== currentStudents.length) listaAleatoria = barajar(currentStudents);
      return listaAleatoria;
    }
    return currentStudents;
  }
  ordenBtns.forEach(btn => btn.addEventListener('click', () => {
    orden = btn.dataset.orden;
    if (orden === 'rand') listaAleatoria = barajar(currentStudents); // cada toque baraja de nuevo
    ordenBtns.forEach(b => {
      const activo = b === btn;
      b.classList.toggle('is-active', activo);
      b.setAttribute('aria-pressed', String(activo));
    });
    showSlide(0);
    if (playing) startAuto();
  }));

  function getList() {
    const q = normalize((presSearchEl?.value || '').trim());
    const base = listaBase();
    if (q) return base.filter(s => normalize(s.nombre).includes(q));
    return base;
  }

  function showSlide(i) {
    const list = getList();
    if (!list.length) return;
    idx = ((i % list.length) + list.length) % list.length;
    const s = list[idx];
    const cat = CATEGORIES[s.category] || Object.values(CATEGORIES)[0];

    contentEl.classList.add('is-fading');
    setTimeout(() => {
      nebulaEl.style.background = cat.color;
      // El disco va translúcido (los dos últimos dígitos son la opacidad) para que
      // el símbolo del sueño se lea encima; el resplandor sí va a color entero.
      starEl.style.background   = cat.color + '33';
      starEl.style.setProperty('--sc', cat.color);
      if (simboloEl) {
        simboloEl.innerHTML = simboloSVG(nombreSimbolo(s));
        simboloEl.style.filter = `drop-shadow(0 0 9px ${cat.color})`;
      }
      // Si el sueño de esta persona ya tiene su propio Leo, Leo va en lugar del
      // trazo (ver leos.js). Mientras ese grupo no tenga el suyo, esto no hace
      // nada y la diapositiva queda con el símbolo de línea, como hasta ahora.
      const leo = urlLeo(s);
      if (leoEl && starWrapEl) {
        starWrapEl.classList.toggle('con-leo', Boolean(leo));
        if (leo) {
          leoEl.src = leo;
          leoEl.style.filter = `drop-shadow(0 0 14px ${cat.color})`;
        } else {
          leoEl.removeAttribute('src');
        }
      }
      catEl.textContent   = s.category;
      catEl.style.color   = cat.color;
      nombreEl.textContent = s.nombre || '';
      grupoEl.textContent  = s.grupo  || '';
      suenoEl.textContent  = `"${s.sueno || 'Sueño por revelar…'}"`;
      counterEl.textContent = `${idx + 1} / ${list.length}`;
      contentEl.classList.remove('is-fading');
    }, 220);

    // Reiniciar barra de progreso
    if (fillEl) {
      fillEl.style.transition = 'none';
      fillEl.style.width = '0%';
      void fillEl.offsetWidth;
      if (playing) {
        fillEl.style.transition = `width ${SLIDE_MS}ms linear`;
        fillEl.style.width = '100%';
      }
    }
  }

  function startAuto() {
    clearInterval(timer);
    if (playing) timer = setInterval(() => showSlide(idx + 1), SLIDE_MS);
  }

  function stopAuto() { clearInterval(timer); timer = null; }

  function setPlaying(val) {
    playing = val;
    if (iconPause) iconPause.style.display = playing ? '' : 'none';
    if (iconPlay)  iconPlay.style.display  = playing ? 'none' : '';
    if (playing) {
      startAuto();
      if (fillEl) {
        fillEl.style.transition = `width ${SLIDE_MS}ms linear`;
        fillEl.style.width = '100%';
      }
    } else {
      stopAuto();
      if (fillEl) {
        fillEl.style.transition = 'none';
        // Congela la barra donde esté
        fillEl.style.width = getComputedStyle(fillEl).width;
      }
    }
  }

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    playing = true;
    if (iconPause) iconPause.style.display = '';
    if (iconPlay)  iconPlay.style.display  = 'none';
    showSlide(0);
    startAuto();
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    stopAuto();
  }

  if (presSearchEl) {
    presSearchEl.addEventListener('input', () => { showSlide(0); if (playing) startAuto(); });
    // Evitar que Escape del search cierre la presentación
    presSearchEl.addEventListener('keydown', e => { if (e.key === 'Escape') { presSearchEl.value = ''; showSlide(0); e.stopPropagation(); } });
  }

  btnOpen.addEventListener('click', () => { medir('abrir_presentacion'); open(); });
  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', () => { showSlide(idx - 1); startAuto(); });
  btnNext.addEventListener('click', () => { showSlide(idx + 1); startAuto(); });
  btnPlay.addEventListener('click', () => setPlaying(!playing));

  document.addEventListener('keydown', e => {
    if (overlay.hidden) return;
    // Dentro del buscador las teclas escriben (espacio incluido): no son atajos
    const enCampo = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (enCampo && e.key !== 'Escape') return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')  { showSlide(idx - 1); startAuto(); }
    if (e.key === 'ArrowRight') { showSlide(idx + 1); startAuto(); }
    if (e.key === ' ')          { e.preventDefault(); setPlaying(!playing); }
  });
}

// ─── El Leo del encabezado va cambiando ──────────────────────────────────────
//
// Quien abre el portal ve primero el Leo de siempre, que es el que viene en el
// HTML con prioridad alta: la portada no se retrasa ni un milisegundo por esto.
// Recién después empieza a pasar por los 41 Leos de los sueños, en orden
// distinto cada visita.
//
// **Solo rota mientras el encabezado está a la vista y la pestaña al frente.**
// Eso es lo que acota cuánto se descarga: cada Leo pesa unos 75 KB y se pide una
// sola vez, así que quien se queda viéndolo baja más, pero es porque lo está
// viendo. En cuanto se baja al universo, deja de pedir imágenes.
//
// Con `prefers-reduced-motion` no rota: muestra uno solo, al azar, y se queda
// quieto. La idea es que cambie de disfraz, no que parpadee encima de alguien
// que pidió menos movimiento.
function iniciarLeoPortada() {
  const caja = document.querySelector('.hero-mascot');
  const img = caja?.querySelector('img');
  const fuente = caja?.querySelector('source');
  const urls = leosBarajados();
  if (!caja || !img || !urls.length) return;

  const CADA_MS = 7000;
  const FUNDIDO_MS = 420;
  let i = -1, timer = null, aLaVista = false;

  function mostrar(url) {
    img.style.opacity = '0';
    setTimeout(() => {
      // El <source> del <picture> le gana al src del <img>, así que hay que
      // cambiar los dos o no pasa nada.
      if (fuente) fuente.srcset = url;
      img.src = url;
      img.style.opacity = '1';
    }, FUNDIDO_MS);
  }

  function siguiente() {
    i = (i + 1) % urls.length;
    const url = urls[i];
    // Se precarga antes de fundir: si se cambiara el src en seco, el encabezado
    // quedaría vacío el rato que tarde en llegar la imagen.
    const previa = new Image();
    previa.onload = () => mostrar(url);
    previa.onerror = () => {};   // si uno falla, se queda el que está puesto
    previa.src = url;
  }

  function arrancar() { if (!timer) timer = setInterval(siguiente, CADA_MS); }
  function parar() { clearInterval(timer); timer = null; }

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    siguiente();
    return;
  }

  new IntersectionObserver(([e]) => {
    aLaVista = e.isIntersecting;
    if (aLaVista && !document.hidden) arrancar(); else parar();
  }, { threshold: 0.25 }).observe(caja);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) parar();
    else if (aLaVista) arrancar();
  });
}

iniciarLeoPortada();
initPresentacion();
initGaleria();
initSolicitudes();
initProfesores();
initPlaylistYouTube();
medirUso();

// ─── La playlist en YouTube ───────────────────────────────────────────────────
// Igual que los videos de los profesores: la tarjeta no le pide nada a YouTube
// hasta que alguien le da play, así abrir el portal no carga sus cookies ni sus
// scripts. El id de la lista está escrito en el HTML (`data-lista`).
function initPlaylistYouTube() {
  const enlace = document.getElementById('playlist-yt-enlace');
  if (enlace) enlace.addEventListener('click', () => medir('abrir_playlist_youtube'));

  const caja = document.getElementById('playlist-youtube');
  if (!caja) return;

  caja.addEventListener('click', e => {
    const boton = e.target.closest('.playlist-yt-play');
    if (!boton) return;

    const lista = boton.dataset.lista;
    if (!lista) return;

    medir('ver_playlist_youtube');

    const src = `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(lista)}`
      + '&autoplay=1&rel=0&modestbranding=1&playsinline=1';

    caja.innerHTML = `<iframe class="playlist-yt-iframe" src="${src}"
      title="El Soundtrack de la Generación 70 LSyH en YouTube"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  });
}

// ─── Medición de uso ──────────────────────────────────────────────────────────
// Qué secciones alcanza la gente y si llegan a pulsar el enlace del formulario.
// Lo demás (abrir una tarjeta, compartirla, ver un video) se mide donde ocurre.
function medirUso() {
  // El enlace del formulario aparece en dos sitios: la sección "Tu huella" y el
  // mensaje de búsqueda sin resultados. Un solo oyente cubre los dos.
  document.addEventListener('click', e => {
    const enlace = e.target.closest('a[href*="docs.google.com/forms"]');
    if (!enlace) return;
    medir('clic_formulario', {
      origen: enlace.closest('.galeria-empty') ? 'busqueda_vacia' : 'seccion',
    });
  });

  if (!('IntersectionObserver' in window)) return;

  // Umbral 0: la galería mide decenas de miles de píxeles, así que pedir un
  // porcentaje visible nunca se cumpliría. Interesa "llegó hasta aquí".
  const vistas = new Set();
  const observador = new IntersectionObserver(entradas => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      const seccion = entrada.target.id;
      if (!vistas.has(seccion)) {
        vistas.add(seccion);
        medir('ver_seccion', { seccion });
      }
      observador.unobserve(entrada.target);
    });
  }, { threshold: 0 });

  // Maestros empieza oculta y se muestra sola: observarla igual es correcto,
  // porque mientras esté oculta no puede intersectar.
  document.querySelectorAll('main section[id]').forEach(s => observador.observe(s));
}

// ─── Carga de datos: Firestore o datos.json ───────────────────────────────────
// Poner en true mientras Firestore no tenga los datos reales importados.
// Cuando se haga la importación definitiva, cambiar a false.
const FORZAR_DATOS_JSON = true;

function ordenarPorNombre(a, b) {
  return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
}

const useLocal = FORZAR_DATOS_JSON || new URLSearchParams(window.location.search).has('local');

if (useLocal) {
  fetch('./datos.json', { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('No se pudo cargar datos.json (¿servidor HTTP y ?local=1?)');
      return r.json();
    })
    .then(data => renderGalaxy(Array.isArray(data) ? data.sort(ordenarPorNombre) : []))
    .catch(err => {
      const loading = document.getElementById('mapa-loading');
      if (loading) loading.innerHTML = `<p style="color:#fca5a5">${escapar(err.message)}</p>`;
    });
} else {
  function fallbackToJson() {
    fetch('./datos.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => renderGalaxy(Array.isArray(data) ? data.sort(ordenarPorNombre) : []))
      .catch(() => {
        const loading = document.getElementById('mapa-loading');
        if (loading) loading.innerHTML = '<p style="color:#fca5a5">Error al cargar datos. Recarga la página.</p>';
      });
  }

  onSnapshot(
    query(collection(db, 'estudiantes'), orderBy('nombre')),
    snapshot => {
      const all = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const active = all.filter(s => s.activo !== false);
      if (active.length === 0) {
        fallbackToJson();
      } else {
        renderGalaxy(all);
      }
    },
    err => {
      console.error('Error cargando estudiantes:', err);
      fallbackToJson();
    }
  );
}
