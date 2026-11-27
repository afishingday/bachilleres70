// ─── Un símbolo por sueño ─────────────────────────────────────────────────────
//
// Cada estudiante escribió su sueño con sus propias palabras. De esas palabras
// sale un dibujo de línea que lo acompaña en la tarjeta para compartir (la
// versión sin Leo) y en el modo presentación.
//
// Tres decisiones de fondo:
//
//  1. **Son trazos, no ilustraciones.** Cada símbolo es un puñado de líneas en
//     una caja de 24×24, como los iconos del resto del portal. Nada realista:
//     un balón son seis líneas, no una foto de un balón. Así todos se ven de la
//     misma familia aunque sean cuarenta y uno, y el peso total del archivo es
//     de unos pocos kilobytes — importa, porque el portal se abre desde el
//     celular de las familias.
//
//  2. **Se dibujan dos veces desde la misma fuente.** `dibujarSimbolo()` los
//     pinta en el canvas de la tarjeta y `simboloSVG()` los escribe como SVG
//     para la diapositiva. Si alguien corrige un trazo, se corrige en los dos
//     lados a la vez, que es justo lo que no pasaría con dos juegos de archivos.
//
//  3. **El orden de `REGLAS` es el diseño.** Un sueño suele mencionar varias
//     cosas ("Ser arquitecta para diseñarle una casa a mi mamá") y gana la
//     primera regla que coincide. Por eso arriba van las frases más personales
//     y concretas, y abajo las genéricas. Cambiar el orden cambia qué símbolo
//     le toca a cuánta gente: antes de mover una regla, abrir
//     `herramientas/simbolos.html` para ver a quién le cambia el dibujo.
//
// El sueño se compara sin tildes y en minúscula, así que las reglas se escriben
// sin tildes: `aviacion`, no `aviación`.

// ─── Los trazos ───────────────────────────────────────────────────────────────
// Caja de 24×24. `s` = líneas, `c` = círculos al trazo [x, y, radio],
// `f` = puntos rellenos [x, y, radio], `fp` = formas rellenas.
export const SIMBOLOS = {
  // Salud
  pulso:   { s: ['M2.5 13H7l2-5.5 3 11 2-5.5h5.5'] },
  corazon: { s: ['M12 20.5C6.2 15.6 3.6 13.2 3.6 10.2A4.6 4.6 0 0 1 12 7.6a4.6 4.6 0 0 1 8.4 2.6c0 3-2.6 5.4-8.4 10.3Z'] },
  mente:   { s: ['M12 4.2v15.6', 'M12 4.2a4 4 0 0 0-4 4 3.4 3.4 0 0 0-2.6 5.6A3.6 3.6 0 0 0 8 19.8h4', 'M12 4.2a4 4 0 0 1 4 4 3.4 3.4 0 0 1 2.6 5.6 3.6 3.6 0 0 1-2.6 6h-4'] },
  diente:  { s: ['M12 3.6c-1.2-.8-2-1-2.9-1C6.6 2.6 5.2 4.5 5.2 7c0 3 1 4.3 1.5 7.3.5 2.7.2 6.1 2 6.1 1.7 0 1.6-4.2 2.6-4.2s.9 4.2 2.6 4.2c1.8 0 1.5-3.4 2-6.1.5-3 1.5-4.3 1.5-7.3 0-2.5-1.4-4.4-3.4-4.4-.9 0-1.7.2-2.9 1Z'] },
  ojo:     { s: ['M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z'], c: [[12, 12, 2.8]] },
  manzana: { s: ['M12 7.6c-2.6-2-7.4-1-7.4 4.4 0 5 3.4 8.8 7.4 8.8s7.4-3.8 7.4-8.8c0-5.4-4.8-6.4-7.4-4.4Z', 'M12 7.6V4.8c0-1.4 1.4-2.4 3-2.2'] },
  huella:  { c: [[7.2, 9, 1.9], [11.2, 7, 1.9], [15.3, 7.6, 1.9], [18, 11, 1.9]], s: ['M12.4 12.4c2.7 0 5.3 2.1 5.3 4.4 0 2-1.7 3.2-3.4 2.7a6.4 6.4 0 0 0-3.9 0c-1.7.5-3.4-.7-3.4-2.7 0-2.3 2.6-4.4 5.4-4.4Z'] },

  // Ciencias
  matraz:  { s: ['M9 3.4h6', 'M10 3.4v5.2L4.6 18.4A1.6 1.6 0 0 0 6 20.8h12a1.6 1.6 0 0 0 1.4-2.4L14 8.6V3.4', 'M7.4 14.4h9.2'] },
  adn:     { s: ['M8 2.6c0 6.4 8 12.4 8 18.8', 'M16 2.6c0 6.4-8 12.4-8 18.8', 'M8.9 6.6h6.2', 'M7.4 11h9.2', 'M8.9 15.4h6.2'] },
  saturno: { c: [[12, 11.4, 5.6]], s: ['M5.8 15.2C3.4 14.6 2 13.5 2 12.3c0-2.2 4.5-4 10-4s10 1.8 10 4c0 1.2-1.4 2.3-3.8 2.9'] },
  hoja:    { s: ['M12 21.4C7 17.4 5 13 5 9.4 5 6 8 3.2 12 2.6c4 .6 7 3.4 7 6.8 0 3.6-2 8-7 12Z', 'M12 21.4V7.2'] },

  // Tecnología
  codigo:    { s: ['M8.6 7.4 3.4 12l5.2 4.6', 'M15.4 7.4 20.6 12l-5.2 4.6', 'M13.4 5.2l-2.8 13.6'] },
  engranaje: { c: [[12, 12, 3.2], [12, 12, 7.4]], s: ['M12 2.2v2.4', 'M12 19.4v2.4', 'M2.2 12h2.4', 'M19.4 12h2.4', 'M5.1 5.1l1.7 1.7', 'M17.2 17.2l1.7 1.7', 'M18.9 5.1l-1.7 1.7', 'M6.8 17.2l-1.7 1.7'] },
  avion:     { s: ['M12 2.8c1.5 0 2.4 2.4 2.4 5.4l6.8 4.6v2.4l-6.8-2.2v3.6l2.6 2v1.8L12 19.4l-5 1.2v-1.8l2.6-2v-3.6l-6.8 2.2v-2.4l6.8-4.6c0-3 .9-5.4 2.4-5.4Z'] },
  cohete:    { s: ['M12 2.6c3 2.6 4.6 6.4 4.6 10.4l-1.6 4.4H9l-1.6-4.4C7.4 9 9 5.2 12 2.6Z', 'M9 17.4 7 20.6l3.2-1', 'M15 17.4l2 3.2-3.2-1', 'M7.5 12.6 4.4 15.4l.7-4.6', 'M16.5 12.6l3.1 2.8-.7-4.6'], c: [[12, 10.4, 2]] },

  // Construcción y hogar
  arquitectura: { s: ['M3 20.6V12a9 9 0 0 1 18 0v8.6', 'M2.4 20.6h19.2', 'M8.4 20.6v-8.4a3.6 3.6 0 0 1 7.2 0v8.4'] },
  casa:         { s: ['M3.4 10.6 12 3.4l8.6 7.2V20a1.4 1.4 0 0 1-1.4 1.4H4.8A1.4 1.4 0 0 1 3.4 20Z', 'M9.6 21.4v-6.2h4.8v6.2'] },

  // Sociales
  balanza: { s: ['M12 4.6v15.4', 'M7.6 20h8.8', 'M4.2 8h15.6', 'M4.2 8 2 13.6a3.3 3.3 0 0 0 4.4 0L4.2 8Z', 'M19.8 8l-2.2 5.6a3.3 3.3 0 0 0 4.4 0L19.8 8Z'] },
  libro:   { s: ['M12 6.5C10 4.8 7.6 4.2 3.5 4.2v13.6c4.1 0 6.5.6 8.5 2.3 2-1.7 4.4-2.3 8.5-2.3V4.2c-4.1 0-6.5.6-8.5 2.3Z', 'M12 6.5v13.6'] },
  pluma:   { s: ['M4 20.4C3 11 9.4 4 20.4 3.6 20.8 14 14 20.4 5.6 19.6', 'M4 20.4 13.4 11', 'M16.8 7.6 13.2 7.8', 'M13.4 11l-3.6.2', 'M10.2 14.2l-3.6.2'] },
  manos:   { s: ['M12 12.2c-2.2-1.9-3.4-2.9-3.4-4.3a1.8 1.8 0 0 1 3.4-.9 1.8 1.8 0 0 1 3.4.9c0 1.4-1.2 2.4-3.4 4.3Z', 'M4 13.8V16a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6v-2.2', 'M4 13.8a1.6 1.6 0 0 1 3.2 0', 'M16.8 13.8a1.6 1.6 0 0 1 3.2 0'] },
  idiomas: { s: ['M2.5 5h11v6.6h-6l-3 2.8v-2.8h-2Z', 'M10.5 11.6h11v6.6h-2V21l-3-2.8h-6'] },

  // Artes
  paleta:  { s: ['M12 3.2a8.8 8.8 0 0 0 0 17.6c1.5 0 2.2-1 2.2-2.1 0-1.6 1.1-2.4 2.6-2.4h2a3.8 3.8 0 0 0 3.8-3.8C22.6 7.2 18 3.2 12 3.2Z'], f: [[8, 8.4, 1.1], [12.2, 7.2, 1.1], [6.6, 12.4, 1.1], [9.4, 16.2, 1.1]] },
  nota:    { s: ['M9 18V5.6l9-2v12.4'], c: [[6.6, 18, 2.6], [15.6, 16, 2.6]] },
  cine:    { s: ['M3 9.5h18v10.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20V9.5Z', 'M3.6 9.5 5.2 4.2l16.2 2.4-.8 2.9', 'M8.6 4.8 7.4 9.2', 'M13.2 5.5 12 9.3', 'M17.8 6.2 16.6 9.5'] },
  gorro:   { s: ['M7 20.6h10v-4.1H7Z', 'M7 16.5c-2.4 0-4.2-2-4.2-4.4 0-2.5 2-4.4 4.4-4.4.3-2.5 2.4-4.2 4.8-4.2s4.5 1.7 4.8 4.2c2.4 0 4.4 1.9 4.4 4.4 0 2.4-1.8 4.4-4.2 4.4Z'] },
  percha:  { c: [[12, 5.3, 2.1]], s: ['M12 7.4 3 15.2c-.8.7-.3 2 .8 2h16.4c1.1 0 1.6-1.3.8-2L12 7.4Z'] },
  mascara: { s: ['M4.5 5.5h15c0 7-2.6 13.2-7.5 13.2S4.5 12.5 4.5 5.5Z', 'M9.6 14.4c1.6 1.2 3.2 1.2 4.8 0'], f: [[9.2, 10, 1.1], [14.8, 10, 1.1]] },
  cinta:   { s: ['M5 20.6c0-4.2 3.6-5.4 6.6-7.2 2.6-1.6 4.4-3.2 4.4-5.6a4 4 0 0 0-8 0', 'M19 3.4c0 4.2-3.6 5.4-6.6 7.2C9.8 12.2 8 13.8 8 16.2a4 4 0 0 0 8 0'] },
  joya:    { s: ['M12 21.2 3.4 9.6 7.2 3.8h9.6l3.8 5.8L12 21.2Z', 'M3.4 9.6h17.2', 'M7.2 3.8 12 21.2l4.8-17.4'] },
  labial:  { s: ['M9 10.6h6v9.8H9Z', 'M9.6 10.6V5.2a2.4 2.4 0 0 1 4.8 0v5.4', 'M8 20.4h8'] },

  // Negocios
  crecimiento: { s: ['M3 18.6l5.4-5.4 3.6 3.6L21 7.4', 'M15.4 7.4H21v5.6'] },
  moneda:      { c: [[12, 12, 8.8], [12, 12, 6]], s: ['M12 7.4v9.2', 'M14.3 9.8a2.5 2.5 0 0 0-2.3-1.2c-1.4 0-2.4.8-2.4 1.9 0 2.6 4.8 1.4 4.8 4 0 1.1-1 1.9-2.4 1.9a2.5 2.5 0 0 1-2.3-1.2'] },
  megafono:    { s: ['M3.5 10.5h3.2L14 5.6v12.8L6.7 13.5H3.5Z', 'M17 9.4a4 4 0 0 1 0 5.2', 'M19.6 7.2a7.4 7.4 0 0 1 0 9.6'] },
  globo:       { c: [[12, 12, 8.8]], s: ['M3.4 9h17.2', 'M3.4 15h17.2', 'M12 3.2c-5.4 5-5.4 12.6 0 17.6 5.4-5 5.4-12.6 0-17.6Z'] },

  // Deporte
  balon:   { c: [[12, 12, 9]], s: ['M12 7.2 8.2 10l1.4 4.4h4.8L15.8 10Z', 'M12 3v4.2', 'M3.6 9.4 8.2 10', 'M20.4 9.4 15.8 10', 'M6.8 18.6l2.8-4.2', 'M17.2 18.6l-2.8-4.2'] },
  basquet: { c: [[12, 12, 9]], s: ['M12 3v18', 'M3 12h18', 'M5.6 5.6c3.4 3.4 3.4 9.4 0 12.8', 'M18.4 5.6c-3.4 3.4-3.4 9.4 0 12.8'] },
  bandera: { s: ['M5 3v18', 'M5 4h14.6v9.2H5Z'], fp: ['M5 4h4.8v3.1H5Z', 'M14.6 4h4.8v3.1h-4.8ZM9.8 7.1h4.8v3.1H9.8ZM5 10.2h4.8v3H5ZM14.6 10.2h4.8v3h-4.8Z'] },
  guante:  { s: ['M6.4 6.4h6.2a5.4 5.4 0 0 1 5.4 5.4v2.8a3.4 3.4 0 0 1-3.4 3.4H9.8a3.4 3.4 0 0 1-3.4-3.4Z', 'M6.4 10.6H4.6a2 2 0 0 0 0 4h1.8', 'M9.4 18v1.6a1.4 1.4 0 0 0 1.4 1.4h4.6a1.4 1.4 0 0 0 1.4-1.4V18'] },
  medalla: { c: [[12, 15.4, 5.6]], s: ['M8.4 10.6 5.6 3h12.8l-2.8 7.6'], f: [[12, 15.4, 1.5]] },

  // Todavía buscando
  brujula: { c: [[12, 12, 9]], s: ['M15.4 8.6 13.6 13.6 8.6 15.4 10.4 10.4Z'] },
};

// ─── Qué palabras llevan a qué símbolo ────────────────────────────────────────
// Gana la primera que coincida. Arriba lo personal y concreto, abajo lo general.
export const REGLAS = [
  // Lo más personal que escribieron: la casa para la mamá o la abuela.
  [/casa a mi|casa a su|hacerle una casa|disenarle una casa|una casa a/, 'casa'],

  // Salud, en orden de especificidad
  [/veterinar|zootecni|los animales|mascota/, 'huella'],
  [/odontolog|dentista/, 'diente'],
  [/optometr/, 'ojo'],
  [/pedagog|docencia|ser profesor|licenciatura en ciencias sociales|ensenar/, 'libro'],
  [/psicolog|filosof|salud mental/, 'mente'],
  [/cardiolog/, 'corazon'],
  [/nutricion/, 'manzana'],
  [/medicin|medic|cirug|cirujan|doctor|enfermer|pediatr|neonat|traumat|ortoped|dermatolog|fisioterap/, 'pulso'],

  // Ciencias
  [/quimic|farmaceutic/, 'matraz'],
  [/biolog/, 'adn'],
  // \b a propósito: sin él, "gastronomía" cae en astronomía.
  [/\bastronom/, 'saturno'],
  [/nasa|aeroespacial|espacial/, 'cohete'],

  // Deporte (antes de avión: "piloto de automovilismo" no es un piloto de avión)
  // Sin "carreras": en estas respuestas suele significar carreras universitarias.
  [/automovilismo|formula 1/, 'bandera'],
  [/aviacion|piloto|avion|aerolinea|aeronautic/, 'avion'],
  [/nba|basquet|baloncesto/, 'basquet'],
  [/futbol|arquero|medellin/, 'balon'],
  [/peleador|boxe|artes marciales|\bmma\b/, 'guante'],
  [/deport|atleta/, 'medalla'],

  // Tecnología e ingeniería
  [/sistemas|software|programa|paginas web|desarrollo web|inteligencia artificial|cloud|ciberseg/, 'codigo'],
  [/mecatronic|mecanic|industrial|robotic/, 'engranaje'],
  [/arquitect|diseno de interiores|disenadora de interiores|ingenieria civil|ingeniero civil|construccion/, 'arquitectura'],
  [/ingenieria ambiental|agronomic|agricol|medio ambiente/, 'hoja'],

  // Sociales
  [/derecho|abogad|penalista|juridic|criminalistic/, 'balanza'],
  [/trabajo social|trabajadora social|derechos humanos|voluntari|organizaciones internacionales|generar consciencia|generar conciencia/, 'manos'],
  [/periodis|escritor/, 'pluma'],

  // Artes
  // \bcine\b a propósito: sin él, "cocinero" cae aquí antes de llegar al gorro.
  [/\bcine\b|animacion|stop motion|pelicula|audiovisual/, 'cine'],
  [/traduc|idiomas/, 'idiomas'],
  // El \b de cant… es obligatorio: sin él, "me encantaría estudiar medicina"
  // acaba con una nota musical. Solo las formas del verbo, no "cantidad".
  [/music|\bcant(ante|ar|ando|o)\b|cancion|trompetis|clarinetis|solista/, 'nota'],
  [/chef|gastronom|cocin|restaurante/, 'gorro'],
  [/modas|moda|modelo|fashion/, 'percha'],
  [/actriz|\bactor|teatro/, 'mascara'],
  [/bailarin|danza|baile/, 'cinta'],
  [/joyeria|tatuar|tatuaje/, 'joya'],
  [/comunicacion social|comunicador/, 'pluma'],

  // Negocios
  [/publicidad|mercadeo|marketing/, 'megafono'],
  [/negocios internacionales|negociador|negociadora|relaciones internacionales|finanzas internacionales|importacion|logistica|viajar por|conocer el mundo|el exterior|extranjero|europa|paris|por el mundo|diferentes paises/, 'globo'],
  [/finanz|financ|contadur|contador|econom|trading|trader|inversionista|dinero|\bplata\b|monetari/, 'moneda'],
  [/empresa|empresari|emprend|administraci|negocio|ventas|analista|jefe|jefa/, 'crecimiento'],

  // Belleza (después de medicina y de administración: "dermatología y estética"
  // es medicina, y "administración de empresas más un curso de maquillaje" es
  // administración)
  [/maquill|cosmetolog|estetica/, 'labial'],
  [/diseno|disenador|creativ/, 'paleta'],

  // Los que todavía están buscando
  [/todavia|aun no|explorando|construyendo mi camino|mejor persona|estabilidad|exitos|famos|plenamente|profesional$/, 'brujula'],
];

// Si el sueño no cae en ninguna regla, lo acompaña el símbolo de su constelación.
export const POR_CONSTELACION = {
  'Tecnología e Ingeniería': 'engranaje',
  'Salud y Medicina': 'pulso',
  'Artes y Diseño': 'paleta',
  'Negocios y Emprendimiento': 'crecimiento',
  'Ciencias Sociales': 'libro',
  'Ciencias Exactas': 'matraz',
  'Deporte y Atletismo': 'medalla',
  'Explorando su camino': 'brujula',
};

function sinTildes(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Devuelve el nombre del símbolo que le toca a un estudiante. */
export function nombreSimbolo(student) {
  const sueno = sinTildes(student?.sueno);
  if (sueno) {
    for (const [patron, simbolo] of REGLAS) {
      if (patron.test(sueno)) return simbolo;
    }
  }
  const cat = student?.category || student?.categoria;
  return POR_CONSTELACION[cat] || 'brujula';
}

// ─── Dibujarlo en el canvas de la tarjeta ─────────────────────────────────────
/**
 * Pinta el símbolo centrado en (cx, cy) dentro de una caja de `tam` píxeles.
 * `grosor` va en unidades de la caja de 24, así que el trazo crece con el
 * dibujo en vez de quedarse fino cuando el símbolo es grande.
 */
export function dibujarSimbolo(ctx, nombre, cx, cy, tam, color, grosor = 1.55) {
  const sim = SIMBOLOS[nombre];
  if (!sim) return;

  const k = tam / 24;
  ctx.save();
  ctx.translate(cx - tam / 2, cy - tam / 2);
  ctx.scale(k, k);
  ctx.lineWidth = grosor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  (sim.s || []).forEach(d => ctx.stroke(new Path2D(d)));
  (sim.fp || []).forEach(d => ctx.fill(new Path2D(d)));
  (sim.c || []).forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  (sim.f || []).forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ─── Escribirlo como SVG para la diapositiva ──────────────────────────────────
/** Devuelve el `<svg>` del símbolo, listo para meter en el HTML. */
export function simboloSVG(nombre, grosor = 1.55) {
  const sim = SIMBOLOS[nombre];
  if (!sim) return '';

  const partes = [];
  (sim.s || []).forEach(d => partes.push(`<path d="${d}"/>`));
  (sim.c || []).forEach(([x, y, r]) => partes.push(`<circle cx="${x}" cy="${y}" r="${r}"/>`));
  (sim.fp || []).forEach(d => partes.push(`<path d="${d}" fill="currentColor" stroke="none"/>`));
  (sim.f || []).forEach(([x, y, r]) => partes.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`));

  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${grosor}"`
    + ` stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${partes.join('')}</svg>`;
}
