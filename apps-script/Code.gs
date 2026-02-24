/**
 * Gen70 LSyH - Procesar respuestas del formulario
 * Pega este código en Extensiones > Apps Script de la hoja de respuestas.
 * Configura los IDs de carpeta abajo y crea un disparador "Al enviar un formulario" → alEnviarFormulario
 */

// ========== CONFIGURACIÓN: pega aquí los ID de tus carpetas de Drive ==========
// El formulario crea 3 carpetas "(File responses)" — una por cada pregunta de subida. Necesitas el ID de cada una.
var ID_CARPETA_FOTO_INFANCIA = '197_ReFxFtwu1gvRqg7CpN0LaW9NIE1SRKvXW9O4fhVLn0DeOJcoiA34WYLVZRi1M8Q7BtGNZ';  // 7. Foto de infancia (antes)
var ID_CARPETA_FOTO_ACTUAL   = '16gBiPb7ILcjx_6-yKJ7PWZnjkzZBuCM2iFxkccSOP9OLjp13ccK0YFFmFnf3fC5-ei14LzbE';  // 8. Foto actual (grado 11)
var ID_CARPETA_FOTO_MURO     = '1EpPEEIOTQricwngL7g1d_v0VGqj7u0Yapaor5p9nZPJZJ7JM5WfpbeVxSOzGR4eZo32Q7Cg7';  // 9. Foto para el Muro de los Deseos
var ID_CARPETA_FOTOS        = '1s9QZs1eSUviUJ2qdLcaN8ga_QMmlcbvB';  // Carpeta "Fotos Gen70" (11A, 11B, ... 11F)

// Nombre de la hoja donde se escriben los datos listos para la web
var NOMBRE_HOJA_DATOS = 'DatosWeb';

// Columnas del formulario (índice 0 = primera columna). Orden: Timestamp, Nombre, Documento, Grupo, Dedicatoria, Canción, Sueño, Foto infancia, Foto actual, Foto muro
var COL_TIMESTAMP     = 0;
var COL_NOMBRE        = 1;
var COL_DOCUMENTO     = 2;
var COL_GRUPO         = 3;
var COL_DEDICATORIA   = 4;
var COL_CANCION       = 5;
var COL_SUENO         = 6;
var COL_FOTO_INFANCIA = 7;
var COL_FOTO_ACTUAL   = 8;
var COL_FOTO_MURO     = 9;

/**
 * Crear identificador seguro para archivos a partir del número de documento (solo números y letras).
 * Evita conflictos cuando hay dos estudiantes con el mismo nombre.
 */
function crearSlugDocumento(documento) {
  if (documento == null || documento === '') return '';
  var s = String(documento).trim().replace(/\s+/g, '');
  s = s.replace(/[^a-zA-Z0-9]/g, '');
  return s || '';
}

/**
 * Crear slug a partir del nombre: minúsculas, sin acentos, espacios → guiones (respaldo si no hay documento)
 */
function crearSlug(nombre) {
  if (!nombre || typeof nombre !== 'string') return 'estudiante';
  var slug = nombre.trim().toLowerCase();
  var acentos = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n' };
  for (var a in acentos) slug = slug.split(a).join(acentos[a]);
  slug = slug.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  return slug || 'estudiante';
}

/**
 * Obtener extensión del nombre de archivo
 */
function extension(nombreArchivo) {
  var i = nombreArchivo.lastIndexOf('.');
  return i >= 0 ? nombreArchivo.substring(i) : '.jpg';
}

/**
 * Obtener ID de archivo desde una celda (puede ser URL de Drive o solo nombre)
 */
function obtenerIdArchivo(valor) {
  if (!valor) return null;
  var s = String(valor).trim();
  var match = s.match(/id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return null;
}

/**
 * Buscar en la carpeta el archivo más reciente que coincida con el nombre
 */
function buscarArchivoPorNombre(carpeta, nombreArchivo, desdeFecha) {
  var archivos = carpeta.getFiles();
  var candidato = null;
  var nombreNorm = (nombreArchivo || '').toString().toLowerCase().trim();
  if (!nombreNorm) return null;
  while (archivos.hasNext()) {
    var f = archivos.next();
    if (desdeFecha && f.getDateCreated() < desdeFecha) continue;
    var n = f.getName().toLowerCase();
    if (n === nombreNorm || n.indexOf(nombreNorm) !== -1) {
      if (!candidato || f.getDateCreated() > candidato.getDateCreated()) candidato = f;
    }
  }
  return candidato;
}

/**
 * Obtener archivos de la carpeta creados después de una fecha, ordenados por fecha (más recientes primero)
 */
function listarArchivosRecientes(carpeta, desdeFecha) {
  var lista = [];
  var archivos = carpeta.getFiles();
  while (archivos.hasNext()) {
    var f = archivos.next();
    if (f.getDateCreated() >= desdeFecha) lista.push(f);
  }
  lista.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  return lista;
}

/**
 * Procesar la última respuesta del formulario
 */
/**
 * Obtener el archivo más reciente de una carpeta (opcionalmente desde una fecha)
 */
function archivoMasReciente(carpeta, desdeFecha) {
  var archivos = carpeta.getFiles();
  var masReciente = null;
  while (archivos.hasNext()) {
    var f = archivos.next();
    if (desdeFecha && f.getDateCreated() < desdeFecha) continue;
    if (!masReciente || f.getDateCreated() > masReciente.getDateCreated()) masReciente = f;
  }
  return masReciente;
}

function alEnviarFormulario(e) {
  if (!ID_CARPETA_FOTO_INFANCIA || !ID_CARPETA_FOTO_ACTUAL || !ID_CARPETA_FOTO_MURO || !ID_CARPETA_FOTOS) {
    Logger.log('ERROR: Configura los 4 ID de carpeta en el script (las 3 de File responses + Fotos Gen70).');
    return;
  }

  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hojaRespuestas = libro.getSheets()[0];
  var ultimaFila = hojaRespuestas.getLastRow();
  if (ultimaFila < 2) return;

  var fila = hojaRespuestas.getRange(ultimaFila, 1, 1, 10).getValues()[0];
  var nombre = fila[COL_NOMBRE];
  var documento = fila[COL_DOCUMENTO] != null && fila[COL_DOCUMENTO] !== '' ? String(fila[COL_DOCUMENTO]).trim() : '';
  var grupo = String(fila[COL_GRUPO] || '').trim().toUpperCase();
  var dedicatoria = fila[COL_DEDICATORIA] || '';
  var cancion = fila[COL_CANCION] || '';
  var sueno = fila[COL_SUENO] || '';

  if (!grupo || !/^11[A-F]$/i.test(grupo)) {
    Logger.log('Grupo no válido: ' + grupo);
    return;
  }

  // Nombre de archivo: documento + nombre (ej. 8100898-maria-garcia-lopez-infancia.png) para unicidad y legibilidad
  var slugDoc = crearSlugDocumento(documento);
  var slugNombre = crearSlug(nombre);
  var slug = slugDoc ? slugDoc + '-' + slugNombre : slugNombre;
  var carpetaInfancia = DriveApp.getFolderById(ID_CARPETA_FOTO_INFANCIA);
  var carpetaActual   = DriveApp.getFolderById(ID_CARPETA_FOTO_ACTUAL);
  var carpetaMuro     = DriveApp.getFolderById(ID_CARPETA_FOTO_MURO);
  var carpetaFotos   = DriveApp.getFolderById(ID_CARPETA_FOTOS);

  var carpetaGrupo = null;
  try {
    carpetasGrupo = carpetaFotos.getFoldersByName(grupo);
    if (carpetasGrupo.hasNext()) {
      carpetaGrupo = carpetasGrupo.next();
    }
  } catch (err) {}
  if (!carpetaGrupo) {
    carpetaGrupo = carpetaFotos.createFolder(grupo);
  }

  var timestamp = fila[COL_TIMESTAMP];
  // Ventana amplia: archivos subidos hasta 10 min antes (el script a veces corre antes de que Drive actualice)
  var desdeFecha = timestamp ? new Date(timestamp.getTime() - 10 * 60 * 1000) : new Date(Date.now() - 15 * 60 * 1000);

  Logger.log('Procesando: nombre=' + nombre + ', documento=' + documento + ', grupo=' + grupo + ', slug=' + slug);

  var carpetasOrigen = [carpetaInfancia, carpetaActual, carpetaMuro];
  var sufijos = ['-infancia', '-actual', '-muro'];
  var rutasGuardadas = [];
  var idsDrive = []; // IDs de los archivos copiados en Drive (para usar en la web sin subir al hosting)

  for (var i = 0; i < 3; i++) {
    var valor = fila[COL_FOTO_INFANCIA + i] ? String(fila[COL_FOTO_INFANCIA + i]).trim() : '';
    var id = obtenerIdArchivo(valor);
    var archivoOrigen = null;

    if (id) {
      try {
        archivoOrigen = DriveApp.getFileById(id);
        Logger.log('  Foto ' + (i + 1) + ': encontrada por ID');
      } catch (err) {
        Logger.log('  Foto ' + (i + 1) + ': ID no válido, buscando en carpeta');
      }
    }
    if (!archivoOrigen) {
      archivoOrigen = archivoMasReciente(carpetasOrigen[i], desdeFecha);
      if (archivoOrigen) Logger.log('  Foto ' + (i + 1) + ': archivo más reciente en carpeta ' + (i + 1));
    }
    if (!archivoOrigen && valor) {
      archivoOrigen = buscarArchivoPorNombre(carpetasOrigen[i], valor, desdeFecha);
      if (archivoOrigen) Logger.log('  Foto ' + (i + 1) + ': encontrada por nombre');
    }

    if (archivoOrigen) {
      var ext = extension(archivoOrigen.getName());
      var nombreNuevo = slug + sufijos[i] + ext;
      var copia = archivoOrigen.makeCopy(nombreNuevo, carpetaGrupo);
      rutasGuardadas.push(grupo + '/' + nombreNuevo);
      idsDrive.push(copia.getId());
    } else {
      Logger.log('  Foto ' + (i + 1) + ': NO encontrada. Revisa que el ID de la carpeta "' + ['infancia', 'actual', 'muro'][i] + '" sea el correcto.');
      rutasGuardadas.push('');
      idsDrive.push('');
    }
  }

  var hojaDatos = libro.getSheetByName(NOMBRE_HOJA_DATOS);
  if (!hojaDatos) {
    hojaDatos = libro.insertSheet(NOMBRE_HOJA_DATOS);
    hojaDatos.appendRow(['nombre', 'documento', 'grupo', 'dedicatoria', 'cancion', 'sueno', 'foto_infancia', 'foto_actual', 'foto_muro', 'foto_infancia_id', 'foto_actual_id', 'foto_muro_id']);
  }
  if (hojaDatos.getLastRow() === 0) {
    hojaDatos.appendRow(['nombre', 'documento', 'grupo', 'dedicatoria', 'cancion', 'sueno', 'foto_infancia', 'foto_actual', 'foto_muro', 'foto_infancia_id', 'foto_actual_id', 'foto_muro_id']);
  }
  hojaDatos.appendRow([
    nombre,
    documento,
    grupo,
    dedicatoria,
    cancion,
    sueno,
    rutasGuardadas[0] || '',
    rutasGuardadas[1] || '',
    rutasGuardadas[2] || '',
    idsDrive[0] || '',
    idsDrive[1] || '',
    idsDrive[2] || ''
  ]);

  Logger.log('Procesado: ' + nombre + ' (' + grupo + ')');
}

/**
 * Exportar la hoja DatosWeb a JSON (ejecutar desde el menú o desde la consola).
 * Copia el resultado y guárdalo como datos.json en tu proyecto.
 */
function exportarJSON() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(NOMBRE_HOJA_DATOS);
  if (!hoja || hoja.getLastRow() < 2) {
    Logger.log('No hay datos en la hoja ' + NOMBRE_HOJA_DATOS);
    return;
  }
  var numCols = hoja.getLastColumn();
  var datos = hoja.getRange(2, 1, hoja.getLastRow(), Math.max(numCols, 12)).getValues();
  var arr = [];
  for (var i = 0; i < datos.length; i++) {
    var r = datos[i];
    arr.push({
      nombre: r[0],
      documento: r[1],
      grupo: r[2],
      dedicatoria: r[3],
      cancion: r[4],
      sueno: r[5],
      foto_infancia: r[6],
      foto_actual: r[7],
      foto_muro: r[8],
      foto_infancia_id: r[9] || '',
      foto_actual_id: r[10] || '',
      foto_muro_id: r[11] || ''
    });
  }
  var json = JSON.stringify(arr, null, 2);
  Logger.log(json);
  return json;
}
