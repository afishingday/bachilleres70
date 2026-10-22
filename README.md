# Universo de los Sueños · Generación 70 LSyH

Portal de graduación de la Generación 70 del Liceo Salazar y Herrera (promoción 2026), hecho por el
comité de padres de familia. Publicado en https://syhg70.web.app.

## Qué tiene

- **Universo**: cada estudiante es una estrella agrupada por constelación (área del sueño). Buscador y filtros por constelación y grupo. Modo **Presentación** para proyectar en la ceremonia (pasa cada 5 s; flechas y espacio para controlar; buscador por nombre).
- **Galería**: tarjeta por estudiante con su sueño; se voltea para leer su mensaje a la generación. Botón para compartir una imagen del sueño (con o sin Leo, la mascota).
- **Playlist**: lista de Spotify con las canciones que eligieron los estudiantes.

## De dónde salen los datos

Los estudiantes respondieron el formulario de Google **"La Huella de la Promoción 70"** (carpeta
*Gen70 Recopilación* en Drive). Esa hoja de respuestas se limpió a mano y se guardó en
`public/datos.json`, que es **el único archivo que lee el portal** (campos: `id`, `nombre`, `grupo`,
`categoria`, `sueno`, `mensaje`, `activo`). Para corregir un nombre o un texto: editar ese archivo,
reconstruir y publicar.

Las constelaciones posibles están en `CATEGORIES` dentro de `main.js`.

**Última sincronización con la hoja: 22 de octubre de 2026** (171 estudiantes). La hoja sigue abierta,
así que puede volver a desfasarse. Al comparar hay que tener en cuenta que **una fila no es un
estudiante**: de las 182 respuestas de ese día, 11 eran segundos envíos. Seis personas llenaron el
formulario dos veces y otras cinco aparecen con el nombre escrito distinto al del archivo (`Plancha` →
`Emanuel Velasco (Plancha)`, `Jacobo Gaviria` → `Jacobo Gaviria Jiménez`, `Samuel Pérez` → `Samuel
Pérez Acosta` y dos que mandaron el nombre completo en el segundo envío). Antes de agregar a alguien
conviene buscarlo por apellido y por salón, no por el nombre exacto. Ojo también con los dos
homónimos: Samuel Pérez Acosta es de 11A y Samuel Pérez Arteaga de 11E.

## Cómo trabajar

```bash
npm install            # una sola vez (también en admin/ si se va a usar el panel)
npm run dev:portal     # portal en http://127.0.0.1:5173
npm run dev            # portal + panel admin (/admin)
npm run build          # genera dist/ (portal + admin)
firebase deploy --only hosting,firestore:rules,storage
```

## Panel de administración y Firestore

En `admin/` hay un panel (React) que edita la colección `estudiantes` de Firestore. Hoy el portal **no
lee Firestore**: en `main.js` está `FORZAR_DATOS_JSON = true`. Si algún día se quiere que el portal lea
la base de datos, importar primero los datos (`npm run importar`, requiere `serviceAccountKey.json`)
y cambiar esa llave a `false`. Las reglas (`firestore.rules`, `storage.rules`) solo permiten escribir
con sesión de administrador.

## Otros archivos

- `firebase-config.js`: configuración de Firebase.
- `solicitudes.js`: formulario del pie para corregir o retirar datos (Ley 1581). Guarda en Firestore
  `solicitudes_borrado`; se atienden en `/admin` → **Solicitudes Ley 1581** (el inicio del panel muestra cuántas hay pendientes).
- `public/`: `datos.json`, `404.html`, favicon, `og-image.jpg` (vista previa al compartir el enlace).
- `legacy/`: material del flujo anterior (formulario de familias, fotos), fuera del build. Ver su README.
