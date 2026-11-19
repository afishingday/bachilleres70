# Universo de los Sueños · Generación 70 LSyH

Portal de graduación de la Generación 70 del Liceo Salazar y Herrera (promoción 2026), hecho por el
comité de padres de familia. Publicado en https://syhg70.web.app.

## Qué tiene

- **Universo**: cada estudiante es una estrella agrupada por constelación (área del sueño). Buscador y filtros por constelación y grupo. Modo **Presentación** para proyectar en la ceremonia (pasa cada 5 s; flechas y espacio para controlar; buscador por nombre).
- **Galería**: tarjeta por estudiante con su sueño; se voltea para leer su mensaje a la generación. Botón para compartir una imagen del sueño (con o sin Leo, la mascota).
- **Palabras de sus Maestros**: videos en los que los profesores le dejan un mensaje a la generación. Ver abajo.
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

Como la hoja sigue abierta, la Galería lleva un bloque **"Todavía puedes dejar tu huella"**
(`.suma-huella` en `index.html`) con el enlace al formulario, para quien no alcanzó a responder. Va
**arriba de la grilla**, entre los filtros y la primera tarjeta: debajo quedaba a 47 pantallas de
scroll en celular, porque la galería pinta las 171 tarjetas seguidas. Lo que vaya después de
`#galeria-grid` no lo ve nadie. El mensaje de "No se encontraron sueños" (en `main.js`) ofrece el
mismo enlace, tomándolo del `href` del bloque para no repetir la URL en dos sitios. El texto
promete que aparecerá "en unos días" **porque nadie lo publica solo**: hay que volver a sincronizar
`public/datos.json` con la hoja, reconstruir y publicar. Si el formulario se cierra, hay que quitar
ese bloque; si cambia de enlace, el enlace está escrito directo en el HTML.

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

## Palabras de sus Maestros

Videos en los que los profesores le dejan un mensaje a la generación. Están subidos a YouTube como **no
listados** (no aparecen en búsquedas ni en el canal, pero cualquiera con el enlace los puede ver) y el
portal los incrusta. No hay formulario, ni base de datos, ni nada que aprobar: la lista se arma a mano.

- **Cómo agregar un profesor**: subir el video a YouTube, copiar el id del enlace (en
  `https://youtu.be/ScMzIvxBSi4` el id es `ScMzIvxBSi4`), agregar una entrada en `public/maestros.json`,
  reconstruir y publicar.
- **Campos**: `id` (cualquier texto único, solo identifica la entrada), `nombre`, `area`, `youtube` (el id
  del video) y `activo`. Opcional: `formato: "vertical"` para los videos grabados con el celular en
  vertical, que cambia la tarjeta a 9:16. Con `activo: false` la tarjeta desaparece del portal sin borrar
  la entrada.
- **La sección se muestra sola**: mientras no haya ningún video activo, ni la sección ni su enlace del
  menú aparecen en el portal.
- **Se agrupa sola por área**: con menos de 10 videos se ve una sola grilla; a partir de ahí se agrupan
  por `area`, siempre que haya más de un área y en promedio al menos dos profesores por área (si no,
  quedaría una pila de títulos sueltos).
- **El iframe se crea al dar play**: hasta entonces la tarjeta solo muestra la carátula, así que abrir la
  página no carga nada de YouTube. Los videos se incrustan desde `youtube-nocookie.com`.
- Código: `profesores.js`.

> `maestros.json` viene con tres entradas de ejemplo que apuntan a videos públicos de prueba, las tres
> en `activo: false` para que no se publiquen por accidente: la sección queda oculta en el portal aunque
> se reconstruya y se despliegue. Para verlas funcionando, poner `activo: true` en local. **Hay que
> borrarlas** cuando entren los videos reales.

## Otros archivos

- `firebase-config.js`: configuración de Firebase.
- `solicitudes.js`: formulario del pie para corregir o retirar datos (Ley 1581). Guarda en Firestore
  `solicitudes_borrado`; se atienden en `/admin` → **Solicitudes Ley 1581** (el inicio del panel muestra cuántas hay pendientes).
- `profesores.js`: grilla de los videos de los profesores (ver sección arriba).
- `public/`: `datos.json`, `maestros.json`, `404.html`, favicon, `og-image.jpg` (vista previa al compartir el enlace).
- `legacy/`: material del flujo anterior (formulario de familias, fotos), fuera del build. Ver su README.
