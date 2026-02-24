/**
 * Genera el HTML desde datos.json y actualiza index.html automáticamente.
 *
 * Uso (Node.js):
 *   1. Exporta la hoja "DatosWeb" a JSON y guarda como datos.json en la raíz del proyecto
 *   2. node scripts/generar-html-desde-json.js
 *   3. index.html queda actualizado (las secciones entre los marcadores GEN70-STUDENTS-GRID y GEN70-WISH-CARDS-GRID)
 *
 * Estructura esperada de datos.json: array de objetos con
 *   nombre, grupo, dedicatoria, cancion, sueno, foto_infancia, foto_actual, foto_muro, foto_*_id (opcional)
 */

var fs = require('fs');
var path = require('path');

var rutaJson = path.join(__dirname, '..', 'datos.json');
var rutaIndex = path.join(__dirname, '..', 'index.html');

function escaparHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var DRIVE_VIEW_URL = 'https://drive.google.com/uc?export=view&id=';

function urlFoto(ruta, idDrive) {
  if (idDrive && String(idDrive).trim()) return DRIVE_VIEW_URL + String(idDrive).trim();
  if (!ruta) return '';
  ruta = String(ruta).trim();
  if (!ruta) return '';
  return 'fotos/' + ruta.replace(/^fotos\/?/, '');
}

var datos;
try {
  datos = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
} catch (e) {
  console.error('No se pudo leer datos.json. Asegúrate de tener el archivo en la raíz del proyecto.');
  console.error(e.message);
  process.exit(1);
}

if (!Array.isArray(datos)) {
  console.error('datos.json debe ser un array de objetos.');
  process.exit(1);
}

// --- El Antes y el Ahora ---
var lineasAntes = [];
datos.forEach(function (r) {
  var grupo = (r.grupo || '').trim().toUpperCase();
  var nombre = escaparHtml(r.nombre);
  var infancia = urlFoto(r.foto_infancia, r.foto_infancia_id);
  var actual = urlFoto(r.foto_actual, r.foto_actual_id);
  if (!infancia) infancia = 'https://picsum.photos/seed/' + encodeURIComponent(r.nombre || '') + '-child/500/500';
  if (!actual) actual = 'https://picsum.photos/seed/' + encodeURIComponent(r.nombre || '') + '-now/500/500';
  lineasAntes.push(
    '          <article class="student-card" role="listitem" data-grupo="' + escaparHtml(grupo) + '">\n' +
    '            <div class="student-card-images">\n' +
    '              <img class="student-card-img student-card-img--current" src="' + escaparHtml(actual) + '" alt="" width="500" height="500" loading="lazy">\n' +
    '              <img class="student-card-img student-card-img--childhood" src="' + escaparHtml(infancia) + '" alt="" width="500" height="500" loading="lazy">\n' +
    '            </div>\n' +
    '            <p class="student-card-name">' + nombre + '</p>\n' +
    '          </article>'
  );
});

// --- Muro de los Deseos ---
var lineasMuro = [];
datos.forEach(function (r) {
  var grupo = (r.grupo || '').trim().toUpperCase();
  var nombre = escaparHtml(r.nombre);
  var dedicatoria = escaparHtml(r.dedicatoria);
  var fotoMuro = urlFoto(r.foto_muro, r.foto_muro_id);
  if (!fotoMuro) fotoMuro = 'https://picsum.photos/seed/wish-' + encodeURIComponent(r.nombre || '') + '/400/400';
  lineasMuro.push(
    '          <article class="wish-card" tabindex="0" role="button" aria-label="Ver dedicatoria de ' + nombre + '" data-grupo="' + escaparHtml(grupo) + '">\n' +
    '            <div class="wish-card-inner">\n' +
    '              <div class="wish-card-front">\n' +
    '                <div class="wish-card-photo">\n' +
    '                  <img src="' + escaparHtml(fotoMuro) + '" alt="" width="400" height="400" loading="lazy">\n' +
    '                </div>\n' +
    '                <p class="wish-card-name">' + nombre + '</p>\n' +
    '              </div>\n' +
    '              <div class="wish-card-back">\n' +
    '                <div class="wish-card-back-scroll">\n' +
    '                  <p class="wish-card-dedication">' + dedicatoria + '</p>\n' +
    '                </div>\n' +
    '              </div>\n' +
    '            </div>\n' +
    '          </article>'
  );
});

var htmlAntes = lineasAntes.join('\n');
var htmlMuro = lineasMuro.join('\n');

var indexContent;
try {
  indexContent = fs.readFileSync(rutaIndex, 'utf8');
} catch (e) {
  console.error('No se encontró index.html en la raíz del proyecto.');
  process.exit(1);
}

var markerStudentsStart = '<!-- GEN70-STUDENTS-GRID -->';
var markerStudentsEnd = '<!-- /GEN70-STUDENTS-GRID -->';
var markerWishStart = '<!-- GEN70-WISH-CARDS-GRID -->';
var markerWishEnd = '<!-- /GEN70-WISH-CARDS-GRID -->';

if (indexContent.indexOf(markerStudentsStart) === -1 || indexContent.indexOf(markerStudentsEnd) === -1) {
  console.error('index.html no tiene los marcadores GEN70-STUDENTS-GRID. No se puede actualizar.');
  process.exit(1);
}
if (indexContent.indexOf(markerWishStart) === -1 || indexContent.indexOf(markerWishEnd) === -1) {
  console.error('index.html no tiene los marcadores GEN70-WISH-CARDS-GRID. No se puede actualizar.');
  process.exit(1);
}

var reStudents = new RegExp(
  '(' + markerStudentsStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')[\\s\\S]*?(' + markerStudentsEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'
);
var reWish = new RegExp(
  '(' + markerWishStart.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')[\\s\\S]*?(' + markerWishEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')'
);

indexContent = indexContent.replace(reStudents, '$1\n' + htmlAntes + '\n          $2');
indexContent = indexContent.replace(reWish, '$1\n' + htmlMuro + '\n          $2');

fs.writeFileSync(rutaIndex, indexContent, 'utf8');

console.log('index.html actualizado correctamente.');
console.log('  - El Antes y el Ahora: ' + datos.length + ' tarjetas');
console.log('  - Muro de los Deseos: ' + datos.length + ' tarjetas');
