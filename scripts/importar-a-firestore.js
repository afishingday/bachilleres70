/**
 * Importa datos de datos.json a Firestore.
 *
 * Requisitos:
 *   1. npm install (en la raíz del proyecto, instala firebase-admin)
 *   2. Descarga la clave de servicio: Firebase Console → Configuración → Cuentas de servicio
 *      → Generar nueva clave privada → guarda como serviceAccountKey.json en la raíz
 *   3. node scripts/importar-a-firestore.js [archivo.json]   (por defecto public/datos.json)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importar() {
  const archivoArg = process.argv[2] || 'public/datos.json';
  const rutaArchivo = path.isAbsolute(archivoArg)
    ? archivoArg
    : path.join(__dirname, '..', archivoArg);

  if (!fs.existsSync(rutaArchivo)) {
    console.error(`No se encontró el archivo: ${rutaArchivo}`);
    process.exit(1);
  }

  const datos = JSON.parse(fs.readFileSync(rutaArchivo, 'utf-8'));
  console.log(`Importando ${datos.length} estudiantes desde ${archivoArg}...`);

  const CHUNK = 400; // Firestore batch limit is 500
  let importados = 0;

  for (let i = 0; i < datos.length; i += CHUNK) {
    const chunk = datos.slice(i, i + CHUNK);
    const batch = db.batch();

    chunk.forEach(e => {
      // El id del archivo (texto) es el id del documento, para poder ubicarlo fácil
      const docId = String(e.id || e.documento || Date.now());
      const ref = db.collection('estudiantes').doc(docId);
      batch.set(ref, {
        nombre: e.nombre || '',
        grupo: e.grupo || '',
        categoria: e.categoria || '',
        sueno: e.sueno || '',
        mensaje: e.mensaje || '',
        dedicatoria: e.dedicatoria || '',
        cancion: e.cancion || '',
        activo: e.activo !== false,
      }, { merge: true }); // merge:true conserva lo que ya exista en la ficha
    });

    await batch.commit();
    importados += chunk.length;
    console.log(`  ${importados}/${datos.length} importados`);
  }

  console.log(`✓ Importación completada. ${importados} estudiantes en Firestore.`);
  process.exit(0);
}

importar().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
