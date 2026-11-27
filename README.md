# Universo de los Sueños · Generación 70 LSyH

Portal de graduación de la Generación 70 del Liceo Salazar y Herrera (promoción 2026), hecho por el
comité de padres de familia. Publicado en https://syhg70.web.app.

## Qué tiene

- **Universo**: cada estudiante es una estrella agrupada por constelación (área del sueño). Buscador y filtros por constelación y grupo. Modo **Presentación** para proyectar en la ceremonia (pasa cada 5 s; flechas y espacio para controlar; buscador por nombre), con el símbolo del sueño de cada quien. Ver abajo.
- **Galería**: tarjeta por estudiante con su sueño; se voltea para leer su mensaje a la generación. Botón para compartir una imagen del sueño (con Leo, la mascota, o con el símbolo de su sueño). Ver abajo.
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
- **YouTube**: la playlist `PLLthgw-G26Uo` del canal de Luis.

**A 26 de noviembre de 2026: YouTube tiene 70 canciones y Spotify 69.** La que está en YouTube y no
en Spotify es *Riendo Para No Llorar*, de Kendo Kaponi. No son las mismas listas automáticamente: hay
que agregar cada canción en los dos lados, y es fácil que una se quede por fuera. Al compararlas, ojo
con dos falsas alarmas: *Condenado al Éxito* I y II parecen repetidas pero son dos canciones
distintas, y *Cheers to youth* de SEVENTEEN está en YouTube con el título en coreano
(`'청춘찬가' Official MV`), así que una búsqueda por nombre no la encuentra.

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
mismo id otra vez en el `href` del enlace, y **el número de canciones en el texto** (`Reproducir las 70
canciones`, y el mismo número otra vez en el `aria-label` del botón, que es fácil de olvidar). Código:
`initPlaylistYouTube()` en `main.js`.

**Los dos reproductores se actualizan solos; ese número no.** Si se agregan canciones a cualquiera de
las dos listas, lo que la gente ve y escucha ya queda al día sin tocar nada, porque los dos son
incrustados en vivo. Lo único que se queda viejo es el texto del botón. Ya pasó una vez: la lista
creció de 56 a 70 canciones y el portal siguió diciendo 56 durante días. Si vuelve a molestar, la
salida es quitar el número del texto (`Reproducir la lista completa`), que no puede desactualizarse.

## El símbolo de cada sueño

Cada estudiante tiene un dibujo que sale de **lo que escribió**, no de su constelación: una casa
para quien quiere construirle una casa a su abuelita, una huella para los veterinarios, una balanza
para los abogados, un cohete para los dos que nombraron la NASA. Aparece en dos lugares:

- En la **tarjeta para compartir**, en la versión sin Leo, donde antes había un círculo de luz igual
  para todos.
- En el **modo presentación**, dentro del disco de color de su constelación.

Todo está en `simbolos.js`, en tres piezas:

- **`SIMBOLOS`**: los 41 dibujos, cada uno como un puñado de líneas en una caja de 24×24. Son trazos,
  no ilustraciones: un balón son seis líneas. Así los 41 se ven de la misma familia y pesan unos
  pocos kilobytes en total, que importa porque el portal se abre desde el celular de las familias.
- **`REGLAS`**: qué palabras llevan a qué dibujo. **El orden es el diseño**: un sueño suele mencionar
  varias cosas y gana la primera regla que coincide. Arriba va lo personal y concreto, abajo lo
  genérico. Por eso "Ser arquitecta para diseñarle una casa a mi mamá" recibe la casa y no el arco
  de arquitectura, y "Ser arquero profesional y estudiar ingeniería civil" recibe el balón.
- **`POR_CONSTELACION`**: el dibujo de respaldo cuando el sueño no cae en ninguna regla.

El sueño se compara **sin tildes y en minúscula**, así que las reglas se escriben sin tildes
(`aviacion`, no `aviación`). Cuidado con las subcadenas: "g**astronom**ía" caía en astronomía y
"co**cine**ro" caería en cine, por eso esas dos reglas llevan `\b`.

A 26 de noviembre de 2026 los 41 dibujos están en uso y el grupo más grande son 18 estudiantes de
201 (los médicos), así que las tarjetas sí se diferencian entre sí.

**Antes de mover una regla o agregar un dibujo**, abrir `herramientas/simbolos.html` con
`npm run dev:portal` corriendo (http://127.0.0.1:5173/herramientas/simbolos.html): muestra los 41
trazos y, abajo, qué símbolo le quedó a cada uno de los 201. Mover una regla una posición le cambia
el dibujo a varias personas a la vez, y ahí se ve a quiénes antes de publicar. Esa página no entra
al sitio publicado: `vite.config.js` solo construye `index.html`.

## Un Leo por cada sueño

Además del Leo de siempre hay **una versión suya por tipo de sueño** —Leo con bata y estetoscopio,
Leo con balón, Leo con casco de obra—, usando los mismos 41 grupos de los símbolos.

Desde el 26 de noviembre de 2026 **están los 41**: los 201 estudiantes tienen su propio Leo y
ningún grupo quedó sin usar. Se comprobó recorriendo las 201 tarjetas una por una.

**Para agregar uno**: dejar el archivo en `assets/leos/` con el nombre exacto del grupo
(`assets/leos/pulso.webp`) y reconstruir. Eso es todo — no hay lista que actualizar ni código que
tocar, porque `leos.js` recoge con `import.meta.glob` lo que encuentre en esa carpeta. La lista de
los 41 nombres, con qué sueños agrupa cada uno y qué debería llevar Leo, está en
`herramientas/leos-por-sueno.md`, y un resumen en `assets/leos/LEEME.txt`.

Los que genera la IA salen en PNG de 700 px de alto y pesan unos 400 KB cada uno. **Hay que pasarlos
a WebP antes de meterlos**, o los 41 serían 16,5 MB. Con Pillow, calidad 82, quedaron entre 55 y
107 KB sin que se note la diferencia: **16,5 MB → 3,0 MB** en total.

Eso no se descarga al entrar al portal: al abrirlo no se pide ni un Leo, y cada uno llega solo
cuando a alguien le toca esa tarjeta o esa diapositiva. Quien comparte una tarjeta baja unos 70 KB.
Una proyección completa sí termina pidiéndolos casi todos, pero repartidos a lo largo de las 201
diapositivas y cada uno una sola vez —`leos.js` guarda la promesa, así que dos diapositivas
seguidas del mismo grupo comparten la descarga—.

Se hizo así a propósito: el número de canciones de la playlist estaba escrito a mano en el HTML y se
quedó viejo sin que nadie lo notara. Con 41 archivos posibles, una lista a mano se desactualiza
seguro.

Cuando un grupo ya tiene su Leo:

- La **tarjeta con Leo** sale con el suyo en lugar del genérico, y el botón "Con Leo" del diálogo
  muestra en la miniatura el que de verdad va a salir.
- La **diapositiva** lo pone en lugar del símbolo de línea, con el disco de color detrás haciendo de
  resplandor.

Mientras no lo tenga, todo queda como estaba antes: Leo de siempre en la tarjeta, símbolo de línea
en la presentación. Los dos caminos conviven en la misma pasada de la presentación sin saltos, y eso
está probado recorriendo diapositivas seguidas de los dos tipos.

Dos detalles que no son evidentes. Los archivos van en `assets/` y no en `public/` justamente para
que Vite los recoja y les ponga nombre con huella, así nadie se queda con una versión vieja en
caché. Y la tarjeta **limita el Leo por los dos lados** (290 px de alto, 420 de ancho) y lo apoya por
abajo, porque los genera una IA y pueden venir cuadrados o apaisados: el Leo de siempre es más alto
que ancho y sin ese límite uno apaisado se comería el nombre de la constelación.

La tarjeta **sin Leo** no cambia nunca: ahí siempre va el símbolo de línea.

### El Leo del encabezado va cambiando

El Leo de la portada rota entre los 41, en orden distinto cada visita
(`iniciarLeoPortada()` en `main.js`). Tres cosas que no son evidentes y que
conviene no deshacer:

- **La primera imagen sigue siendo el Leo de siempre.** Es la que viene en el HTML con
  `fetchpriority="high"`, y la rotación no arranca hasta los 7 segundos. Si el primer Leo se
  eligiera en JavaScript, la portada esperaría a que bajara una imagen que el navegador no sabe
  que necesita.
- **Solo rota mientras el encabezado está a la vista y la pestaña al frente.** Eso es lo que acota
  cuánto se descarga: cada cambio son unos 75 KB. Quien baja al universo deja de pedir imágenes;
  quien se queda mirando baja más, pero es porque lo está mirando. Y cada archivo se pide una vez,
  así que el tope de una visita entera son los 3,0 MB de los 41, y en una segunda visita, cero.
- **La caja de la imagen está fija en la proporción del Leo de siempre** (`aspect-ratio: 408/612`,
  `object-fit: contain`, apoyado abajo). Las 41 versiones vienen con anchos distintos —de 368 a
  602 px— y sin esa caja el título se correría de sitio en cada cambio. Está medido: el `<h1>` no
  se mueve ni un píxel, en celular tampoco.

Con `prefers-reduced-motion` no rota: muestra uno solo, al azar, y se queda quieto.

**Importante para quien toque esto:** la tarjeta para compartir y la miniatura del diálogo **ya no
pueden** sacar el Leo genérico del `<img>` del encabezado, porque ese `<img>` va cambiando. Los dos
importan `assets/mascota-lsyh.webp` directamente (`import leoGenerico from ...`). Volver a leer el
encabezado haría que la tarjeta de respaldo saliera con un Leo al azar.

## Los créditos del pie

Al final del pie, después de la línea de los padres y separados por una raya, van los créditos:
**Virtual Marketing Manager en asociación con A Fishing Day**, con los dos Instagram
(`@vmarketingm` y `@afishingday`) como forma de contacto.

Esto **revierte a propósito** una decisión de septiembre de 2026, cuando se quitó toda marca de
agencia del sitio para no exponer a la empresa. Luis pidió volver a ponerla el 26 de noviembre. Si
alguien encuentra la nota vieja, esta es la que manda.

Van al final y no arriba porque el portal es de los padres de familia, y el pie ya lo dice en su
primera línea: estos créditos son la firma de quien lo construyó, no el encabezado. Los colores no
usan `--text-muted` (#64748b, 4,24:1), que es justo el contraste bajo que anotó la auditoría de
noviembre.

## Qué se mide

Google Analytics (vía Firebase, `G-R5PKWZT9CH`; propiedad GA4 `p525865313`). Además de las visitas que
mide solo, el portal registra estos eventos con `medir()`, el ayudante que exporta `firebase-client.js`:

| Evento | Cuándo | Parámetros |
|---|---|---|
| `ver_seccion` | alguien llega a una sección, una vez por visita | `seccion` |
| `abrir_estudiante` | se abre una tarjeta, en el mapa o en la galería | `origen`, `grupo` |
| `compartir_tarjeta` | se genera la tarjeta para compartir | `tipo`: `con_leo_propio`, `con_leo_generico` o `sin_leo` |
| `ver_video_profesor` | se le da play al video de un profesor | `profesor` |
| `clic_formulario` | se pulsa el enlace del formulario | `origen` |
| `busqueda_sin_resultados` | una búsqueda en la galería no encuentra nada | `donde` |
| `abrir_presentacion` | se abre el modo presentación | — |
| `ver_playlist_youtube` | se le da play a la playlist de YouTube dentro del portal | — |
| `abrir_playlist_youtube` | se pulsa el enlace para ver la lista completa en YouTube | — |

**En local no se mide nada.** `firebase-client.js` apaga Analytics cuando el sitio se abre en
`localhost`, `127.0.0.1` o `file:`. Antes no era así, y una tarde probando el botón de compartir
dejaba en la propiedad tarjetas compartidas que nadie compartió; después esos números ya no se
pueden separar de los de las familias. Filtrar la IP desde el panel haría lo mismo, pero hay que
acordarse en cada computador y cada vez que cambie la IP.

Desde que hay un Leo por sueño, `compartir_tarjeta` distingue **`con_leo_propio`** de
**`con_leo_generico`** (ver sección de los Leos). Van dentro del mismo parámetro `tipo`, que ya está
registrado como "Tipo de tarjeta", así que no hubo que registrar ninguna dimensión nueva. Para el
total de "con Leo" de antes hay que sumar los dos valores; el corte es el 26 de noviembre de 2026.

Ahora que están los 41, **`con_leo_generico` no debería aparecer nunca**. Si aparece, no es un dato
de uso: significa que a alguien le faltó su archivo de Leo en lo publicado. Vale la pena dejarlo
así, como aviso.

Dos cosas que conviene no olvidar. **No se registra el nombre de ningún estudiante**, solo su salón: el
portal es sobre menores y una lista de "los más vistos" no es algo que haga falta. Por lo mismo
**no se registra el grupo de símbolo** de la tarjeta compartida, aunque sería interesante: 21 de los
41 grupos tienen una o dos personas, así que un evento con `grupo_simbolo: bandera` señalaría al
único estudiante que puso automovilismo. Y para ver los
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
- `simbolos.js`: los dibujos de los sueños y las reglas que deciden cuál le toca a quién (ver sección
  arriba). Lo usan la tarjeta para compartir y el modo presentación, los dos desde el mismo archivo.
- `herramientas/simbolos.html`: hoja de contacto para revisar esos dibujos y sus reglas. Herramienta
  de trabajo, fuera del sitio publicado.
- `leos.js`: encuentra el Leo que le toca a cada sueño entre los que haya en `assets/leos/` (ver
  sección arriba). No hay lista que mantener: lee la carpeta.
- `herramientas/leos-por-sueno.md`: los 41 grupos con qué sueños agrupa cada uno, cuántos estudiantes
  cubre y qué debería llevar Leo, más el prompt base. Material de trabajo para irlos generando.
- `public/`: `datos.json`, `maestros.json`, `404.html`, favicon, `og-image.jpg` (vista previa al compartir el enlace).
- `legacy/`: material del flujo anterior (formulario de familias, fotos), fuera del build. Ver su README.
