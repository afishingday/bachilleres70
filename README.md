# Universo de los Sueños · Generación 70 LSyH

Portal de graduación de la Generación 70 del Liceo Salazar y Herrera (promoción 2026), hecho por el
comité de padres de familia. Publicado en https://syhg70.web.app.

## Qué tiene

- **Universo**: cada estudiante es una estrella agrupada por constelación (área del sueño). Buscador y filtros por constelación y grupo. Modo **Presentación** para proyectar en la ceremonia (pasa cada 5 s; flechas y espacio para controlar; buscador por nombre).
- **Galería**: tarjeta por estudiante con su sueño; se voltea para leer su mensaje a la generación. Botón para compartir una imagen del sueño (con o sin Leo, la mascota).
- **Palabras de sus Maestros**: videos en los que los profesores le dejan un mensaje a la generación. Ver abajo.
- **Playlist**: las canciones que eligieron los estudiantes, en Spotify y en YouTube. Ver abajo.

## De dónde salen los datos

Los estudiantes respondieron el formulario de Google **"La Huella de la Promoción 70"** (carpeta
*Gen70 Recopilación* en Drive). Esa hoja de respuestas se limpió a mano y se guardó en
`public/datos.json`, que es **el único archivo que lee el portal** (campos: `id`, `nombre`, `grupo`,
`categoria`, `sueno`, `mensaje`, `activo`). Para corregir un nombre o un texto: editar ese archivo,
reconstruir y publicar.

Las constelaciones posibles están en `CATEGORIES` dentro de `main.js`.

**Última sincronización con la hoja: 26 de noviembre de 2026** (201 estudiantes, de 216 respuestas).
En esa sincronización entraron 30 estudiantes que habían respondido el 12 de noviembre y llevaban dos
semanas sin aparecer en el portal. La hoja sigue abierta, así que puede volver a desfasarse: conviene
revisarla con una fecha fija, no cuando alguien se acuerde. Al comparar hay que tener en cuenta que
**una fila no es un estudiante**: en la sincronización del 22 de octubre, de 182 respuestas 11 eran
segundos envíos. Seis personas llenaron el
formulario dos veces y otras cinco aparecen con el nombre escrito distinto al del archivo (`Plancha` →
`Emanuel Velasco (Plancha)`, `Jacobo Gaviria` → `Jacobo Gaviria Jiménez`, `Samuel Pérez` → `Samuel
Pérez Acosta` y dos que mandaron el nombre completo en el segundo envío). Antes de agregar a alguien
conviene buscarlo por apellido y por salón, no por el nombre exacto. Ojo también con los dos
homónimos: Samuel Pérez Acosta es de 11A y Samuel Pérez Arteaga de 11E.

Como la hoja sigue abierta, hay una sección **"Todavía puedes dejar tu huella"** (`#tu-huella` en
`index.html`) con el enlace al formulario, para quien no alcanzó a responder. Tiene **sección propia
después de la galería y entrada en el menú**: dentro de la galería quedaba o estorbando antes de las
tarjetas, o enterrada detrás de las 201. Como queda lejos por scroll, el enlace del menú es la forma
real de llegar: si alguna vez se quita del menú, la sección deja de existir en la práctica. El
mensaje de "No se encontraron sueños" (en `main.js`) ofrece el mismo enlace, tomándolo del `href` de
la sección para no repetir la URL en dos sitios. El texto **no promete plazo a propósito**, porque
nadie lo publica solo: hay que volver a sincronizar `public/datos.json` con la hoja, reconstruir y
publicar. Si el formulario se cierra, hay que quitar esa sección; si cambia de enlace, el enlace está
escrito directo en el HTML.

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

Hoy hay **13 profesores**, todos sin `area`, así que se ven en una sola grilla. Los videos están en el
canal personal de YouTube de Luis: si ese canal desaparece o cambia de cuenta, la sección se queda sin
videos.

## El Soundtrack

La misma lista de canciones está en dos sitios, uno debajo del otro, porque no todo el mundo tiene
Spotify:

- **Spotify**: `2wO4X5OPppFjR6AbbxpZ7k`, incrustada tal cual con el iframe que da Spotify.
- **YouTube**: la playlist `PLLthgw-G26Uo` del canal de Luis (56 canciones a 26 de noviembre de 2026).

El bloque de YouTube da **dos salidas**, porque el reproductor incrustado deja la lista de canciones
muy apretada y en celular casi no se ve:

- **Reproducir aquí mismo**: el botón. **No es un iframe hasta que alguien lo pulsa**, igual que los
  videos de los profesores, así que abrir el portal no le pide cookies ni scripts a Google por una
  playlist que mucha gente ni va a abrir. Al pulsarlo, el botón se reemplaza por el reproductor de
  `youtube-nocookie.com` en 16:9, ya sonando.
- **Abrir la lista completa en YouTube**: el enlace de abajo, que abre otra pestaña. Va **fuera** de la
  tarjeta a propósito: la tarjeta se reemplaza por el reproductor, y así la salida a YouTube sigue
  disponible mientras alguien está viendo los videos.

Tres cosas están escritas a mano en `index.html`: el id de la playlist en el `data-lista` del botón, el
mismo id otra vez en el `href` del enlace, y **el número de canciones en el texto** (`Reproducir las 56
canciones`). Si se agregan canciones a la lista en YouTube, hay que corregir ese número aquí. Código:
`initPlaylistYouTube()` en `main.js`.

## Qué se mide

Google Analytics (vía Firebase, `G-R5PKWZT9CH`; propiedad GA4 `p525865313`). Además de las visitas que
mide solo, el portal registra estos eventos con `medir()`, el ayudante que exporta `firebase-client.js`:

| Evento | Cuándo | Parámetros |
|---|---|---|
| `ver_seccion` | alguien llega a una sección, una vez por visita | `seccion` |
| `abrir_estudiante` | se abre una tarjeta, en el mapa o en la galería | `origen`, `grupo` |
| `compartir_tarjeta` | se genera la tarjeta para compartir | `tipo` (con o sin Leo) |
| `ver_video_profesor` | se le da play al video de un profesor | `profesor` |
| `clic_formulario` | se pulsa el enlace del formulario | `origen` |
| `busqueda_sin_resultados` | una búsqueda en la galería no encuentra nada | `donde` |
| `abrir_presentacion` | se abre el modo presentación | — |
| `ver_playlist_youtube` | se le da play a la playlist de YouTube dentro del portal | — |
| `abrir_playlist_youtube` | se pulsa el enlace para ver la lista completa en YouTube | — |

Dos cosas que conviene no olvidar. **No se registra el nombre de ningún estudiante**, solo su salón: el
portal es sobre menores y una lista de "los más vistos" no es algo que haga falta. Y para ver los
parámetros desglosados en Analytics hay que **registrarlos como dimensiones personalizadas** (Admin →
Definiciones personalizadas); sin eso solo se ven los totales de cada evento, y el registro **no es
retroactivo**.

Las seis ya están registradas (19 de noviembre de 2026), todas de ámbito *Event*: Sección → `seccion`,
Salón → `grupo`, Origen → `origen`, Profesor → `profesor`, Tipo de tarjeta → `tipo`, Dónde se buscó →
`donde`. **Si se agrega un parámetro nuevo a un evento, hay que registrarlo ahí el mismo día**, o esos
datos quedan sin desglosar para siempre.

## Otros archivos

- `firebase-config.js`: configuración de Firebase.
- `solicitudes.js`: formulario del pie para corregir o retirar datos (Ley 1581). Guarda en Firestore
  `solicitudes_borrado`; se atienden en `/admin` → **Solicitudes Ley 1581** (el inicio del panel muestra cuántas hay pendientes).
- `profesores.js`: grilla de los videos de los profesores (ver sección arriba).
- `public/`: `datos.json`, `maestros.json`, `404.html`, favicon, `og-image.jpg` (vista previa al compartir el enlace).
- `legacy/`: material del flujo anterior (formulario de familias, fotos), fuera del build. Ver su README.
