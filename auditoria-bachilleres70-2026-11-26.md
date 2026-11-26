# Auditoría — Universo de los Sueños · Gen 70 LSyH — 2026-11-26

**Qué se revisó:** el sitio publicado en https://syhg70.web.app y la carpeta `lsyh/bachilleres70`. Es una
re-auditoría: la referencia es `auditoria-bachilleres70-2026-09-08.md`, y al final de cada sección se
dice qué quedó cerrado de aquella y qué sigue abierto. Se revisaron las siete dimensiones habituales.

**Cómo se revisó:** lectura del código, chequeo técnico automático, y pruebas en un navegador real
sobre el sitio en vivo en escritorio (1440 px) y celular (390 y 360 px): capturas, medición de
contrastes, conteo de peticiones de red, medición de las distancias entre estrellas y comparación de
las dos playlists canción por canción. **No se envió ningún formulario de verdad** para no dejar
basura en la base de datos de producción: lo que se dice del formulario de solicitudes sale de leer el
código contra las reglas de seguridad, y se marca como tal.

---

De las 26 órdenes de septiembre, la mayoría están hechas, y bien hechas: el formulario de derechos ya
usa la misma librería que el resto del portal, el toque en celular dejó de cerrar la tarjeta sola, la
playlist real reemplazó al reproductor de prueba, la galería ya no corta los sueños a mitad de frase,
el pie dice quién está detrás y declara Google Analytics, hay vista previa al compartir y una página
de error en español. El portal hoy se ve y se siente terminado.

Lo que queda ya no son errores de construcción, son **tres brechas entre lo que el portal promete y lo
que puede cumplir hoy**: le dice a un estudiante nuevo que "en unos días" va a verse, y la última
sincronización fue hace 35 días; le promete a una familia que corrige o retira datos "de inmediato", y
nadie se entera cuando alguien lo pide; y carga 1,4 MB de carátulas y un reproductor que llama a
Spotify apenas se abre la página, en un sitio que en todo lo demás es cuidadoso con eso. La zona con
más oportunidades es la primera.

## Lo que el portal promete y hoy no puede cumplir (la zona con más oportunidades)

- La sección "Tu huella" le dice a quien no alcanzó a responder: *"En unos días vas a verte en el
  universo, con los demás."* El portal lee `public/datos.json`, que se llena **a mano** desde la hoja
  de respuestas, y tu propio README registra que la última sincronización fue el **22 de octubre** —
  hace 35 días. Cualquiera que haya llenado el formulario desde entonces lleva más de un mes esperando
  unos días. El formulario sigue recibiendo respuestas (lo comprobé: responde con normalidad), así que
  esa espera se sigue acumulando sola. O sincronizas ya y te pones una fecha fija para repetirlo, o la
  frase tiene que dejar de prometer un plazo.
- El pie promete que si alguien pide retirar o corregir su nombre "lo retiramos o corregimos de
  inmediato (Ley 1581 de 2012)". La solicitud se guarda en la base de datos y **solo aparece si
  alguien abre `/admin`**: no llega un correo, ni un mensaje, ni una alerta. Si nadie entra al panel
  durante dos semanas, un padre que pidió quitar el nombre de su hijo no recibe nada y el plazo legal
  corre igual. Con 171 menores publicados, esa es la petición que no te puedes dar el lujo de no ver.
- A favor, y es importante: ese formulario **ya está bien construido**. Usa la misma copia de la
  librería que el resto del portal (el error de septiembre era justamente una segunda copia que no
  reconocía la base de datos), manda exactamente los ocho campos que las reglas de seguridad exigen,
  con `estado: 'pendiente'` y `origen: 'portal'`, y tiene campo trampa para bots. Por lectura de
  código debería funcionar; no lo probé con un envío real para no ensuciar la base de datos, así que
  vale la pena que mandes tú una solicitud de prueba y la veas llegar al panel una sola vez.
- Las reglas de la base de datos quedaron bien cerradas: ya no hay escrituras anónimas sobre
  `estudiantes`, y las solicitudes se validan una por una (tamaños, grupo dentro de la lista de
  salones, tipo dentro de los tres permitidos). Esto era de lo más expuesto en septiembre y hoy está
  resuelto.

## La experiencia en celular

- El portal mide **52 pantallas de alto en un celular** (44.358 px a 390 px de ancho), y "Tu huella",
  "Palabras de sus Maestros" y "Playlist" empiezan todas **después de la pantalla 45**: la galería de
  171 tarjetas va antes que las tres. Quien no use el menú de arriba, simplemente no sabe que los
  videos de los profesores existen. Son la sección más emotiva del sitio y hoy dependen por completo
  de que alguien abra el menú hamburguesa. Vale la pena subir Maestros y Playlist antes de la galería,
  o cortar la galería a unas pocas tarjetas con un botón "Ver las 171".
- En el mapa de estrellas en celular, **159 de las 171 estrellas tienen otra a menos de 22 px**, y hay
  **19 parejas a menos de 6 px** — Jacobo Gómez Velásquez y Nicolás Naranjo Idárraga están a 1,5 px, o
  sea una encima de la otra. El área táctil de 44 px que se agregó en septiembre ayuda a acertarle a
  "alguna" estrella, pero no a la que uno quiere: en esa zona hay tres o cuatro superpuestas. En
  celular el mapa funciona como adorno, y el buscador y los filtros son la forma real de encontrar a
  alguien. Conviene que el mensaje del mapa en celular lo diga ("Busca por nombre o toca una
  estrella") y, si quieres arreglarlo de fondo, separar las estrellas con más radio o agrandar el mapa
  en vertical.
- La fila de constelaciones en celular mide **1.461 px dentro de una ventana de 375 px**: se puede
  arrastrar, pero seis de las ocho constelaciones quedan fuera de pantalla y nada indica que hay más.
  El filtro principal de la sección principal es, en el teléfono, prácticamente invisible. Una
  segunda fila (que envuelva en vez de cortar) o un degradado en el borde derecho lo resuelve.
- El mensaje de ayuda del mapa ("Toca una estrella para ver el sueño") está puesto **encima de las
  estrellas**, en la esquina inferior derecha, y en celular cae justo sobre el grupo naranja de
  Ciencias Sociales: se lee mal y tapa estrellas que son botones. Además su contraste es de 3,99 a 1 a
  11 px, el texto menos legible de la página.
- A favor: lo que más dolía en septiembre está cerrado. El toque ya no abre y cierra la tarjeta en el
  mismo gesto (el aviso solo aparece con foco de teclado), el mensaje del mapa cambia solo entre
  "toca" y "haz clic" según el dispositivo, la galería ya no corta los sueños con puntos suspensivos a
  mitad de frase, el buscador de arriba lleva la vista al universo cuando empiezas a escribir, el de
  la galería ya busca también por sueño, y la barra espaciadora dejó de pausar la presentación
  mientras escribes en el buscador. No hay desborde horizontal en ningún ancho de los que probé.

## Peso y privacidad de lo que carga la página

- Las 13 carátulas de los videos de los profesores se piden en tamaño `maxresdefault`, que son
  **1.280 × 720 px y 1,4 MB en total** — más que todo el código del portal junto. Se muestran en
  tarjetas de unos 290 px de ancho. Pidiendo `hqdefault` esas mismas 13 carátulas pesan **176 KB**, y
  en `mqdefault` 118 KB: es un ahorro de más de un megabyte sin que nadie note la diferencia. En un
  celular con datos, ese megabyte es la diferencia entre que la sección aparezca enseguida o que
  alguien se canse de esperar. El código ya sabe caer a `hqdefault` cuando `maxresdefault` no existe,
  así que el cambio es de una línea.
- El reproductor de Spotify **se carga apenas se abre el portal**, sin que nadie baje hasta la
  playlist: dispara unas 30 peticiones a cinco dominios de Spotify y envía eventos a su sistema de
  errores (Sentry) y a su servicio de telemetría. Esto choca con dos cosas tuyas: el pie dice que los
  datos "no se comparten con terceros" y solo declara Google Analytics; y el resto del portal es
  cuidadoso justo con esto — los videos de los profesores y la playlist de YouTube no le piden nada a
  Google hasta que alguien pulsa. Dale a Spotify el mismo trato (una tarjeta que se convierte en
  reproductor al pulsarla) y el portal se vuelve coherente consigo mismo, además de más liviano.
- El portal se lleva empaquetada la librería de base de datos de Google aunque hoy **no consulta la
  base de datos**: `FORZAR_DATOS_JSON` sigue en `true`, pero `main.js` importa Firestore de forma fija
  y el archivo publicado pesa 333 KB (84 KB comprimido). Cargarlo solo cuando haga falta le quita a
  cada visita la mayor parte de ese peso. Era la orden 23 de septiembre y es la única parte de esa
  orden que sigue pendiente: la mascota ya se sirve en WebP de 28 KB en vez del PNG de 226 KB.
- A favor: no hay un solo error de consola propio del sitio (los únicos avisos vienen del reproductor
  de Spotify), el sitio va por HTTPS con seguridad estricta, y el peso del portal en sí —código,
  estilos, datos de los 171 estudiantes— es razonable.

## Legibilidad y accesibilidad

- Todo el texto secundario del portal usa el mismo gris (`--text-muted`, `#64748b`), que sobre el
  fondo oscuro da **4,24 a 1** — justo por debajo del 4,5 a 1 que se recomienda para texto pequeño.
  Afecta al subtítulo de la galería, al de Maestros, al crédito del pie y a la línea de la playlist de
  YouTube, todos entre 12 y 14 px. No es dramático, pero es sistemático: subir ese color a `#7488a3`
  (5,56 a 1) arregla los cuatro de una vez sin cambiar el estilo del sitio. El mensaje del mapa, a
  3,99 a 1, necesita el mismo ajuste con más razón.
- El título principal está partido con saltos de línea (`Universo<br>de los<br>Sueños`), y los
  lectores de pantalla lo leen pegado: "Universode losSueños". Se arregla dejando el texto corrido y
  partiéndolo con estilos.
- En el código queda un encabezado vacío (el nombre del estudiante dentro del modo presentación, que
  solo se llena al abrirlo). Es menor, pero un lector de pantalla lo anuncia como título sin
  contenido.
- A favor: la accesibilidad de lo importante sigue muy cuidada. Las estrellas son enfocables con
  teclado, los diálogos tienen rol y nombre, los botones son botones de verdad y no `div`, el cierre
  con Escape es consistente, las áreas táctiles de 44 px están puestas, y la jerarquía de encabezados
  es correcta. La única imagen del sitio es decorativa y está marcada como tal.

## Textos

- Quedan **16 mensajes que empiezan con "Que…"** — "Que son lo mejor.", "Que nunca los olvidaré.",
  "Que marquen la diferencia académicamente." Son respuestas a la pregunta del formulario, pero bajo
  el título "Mensaje a la Generación 70" se leen como frases cortadas. Una entrada del tipo "Les
  desea:" antes del mensaje los deja completos sin tener que reescribir nada ni volver a preguntarle a
  nadie.
- Hay **seis mensajes repetidos palabra por palabra** entre dos estudiantes distintos. "Los amo." lo
  escribieron cuatro personas y seguro es real; pero "Gracias por convertir años normales en recuerdos
  inolvidables." aparece idéntico en Isabella Bobadilla Rojas e Isabela López Gómez, dos nombres que
  se parecen tanto que huele a copiado al digitar. Vale la pena mirar esa pareja en la hoja de
  respuestas.
- Siguen dos mayúsculas inconsistentes en profesiones: "Estudiar Astronomía" (Jeferson Orozco) y
  "Convertirme en Química Farmacéutica" (Manuela Gutiérrez Sepúlveda), frente a "Estudiar medicina" o
  "Ser astrónoma" en el resto. Es un detalle, pero se proyecta en la ceremonia.
- A favor: los textos que más molestaban en septiembre están corregidos. "Plancha" ya es "Emanuel
  Velasco (Plancha)", los dos sueños en tercera persona están en primera ("Todavía estoy construyendo
  mi camino"), existe la constelación neutra "Explorando su camino" con 10 estudiantes que antes
  quedaban forzados en categorías que no les correspondían, y las tarjetas de los 37 estudiantes sin
  mensaje ya no se voltean para decirles que no dejaron ninguno.

## Diseño y primera impresión

- La portada sigue siendo lo mejor del sitio y no hay que tocarla: en cinco segundos se entiende qué
  es, de quién y para qué, el mapa de constelaciones es genuinamente distinto a cualquier sitio de
  graduación, y la sección de Maestros que se agregó después está a la altura del resto —las 13
  carátulas se ven parejas, con el mismo encuadre y el mismo fondo del colegio, que es justo lo que
  hace que una grilla de videos caseros se vea profesional.
- Las tarjetas de los profesores muestran solo el nombre. El archivo tiene un campo para el área y los
  13 lo tienen vacío. Un estudiante de 2026 reconoce "el profe de física" antes que "Andrés Henao":
  llenar ese campo hace que la sección se pueda recorrer, y de paso activa el agrupado por área que ya
  está programado.
- En la galería, las tarjetas de una fila se estiran todas al alto de la más larga, así que las de
  sueños cortos ("Empresario", "Ser veterinaria") quedan con un hueco grande debajo. No es un error,
  pero en una pantalla con cuatro tarjetas por fila se nota como desorden. Alinear las tarjetas arriba
  en vez de estirarlas lo resuelve.
- El modo presentación sigue cortando los sueños a cuatro líneas y pasando cada 5 segundos sin
  importar el largo del texto. Para la ceremonia, los sueños más largos —y son los más bonitos— se van
  a proyectar incompletos. Vale la pena que el tiempo dependa del largo y que no haya recorte.
- Las imágenes que la gente comparte llevan impreso "syhg70.web.app". Si en algún momento compras un
  dominio propio, todas las tarjetas que ya circularon apuntan a la dirección vieja. Lo dije en
  septiembre y hoy pesa más, porque con el portal terminado ya se están compartiendo de verdad: si vas
  a comprar dominio, es ahora.

## Posicionamiento en Google y al compartir el enlace

- Esta sección está prácticamente cerrada. La portada tiene título, descripción, vista previa para
  WhatsApp con imagen de 1200 × 630 que existe y carga, ícono de pestaña, ícono para iPhone, idioma
  declarado, un solo H1 y jerarquía correcta. La página de error ya es la tuya, en español y con el
  estilo del portal ("Esta estrella no existe"). Todo lo que faltaba en septiembre se hizo.
- Lo único que queda: la página de error no tiene descripción propia (irrelevante para Google, pero
  sale vacía si alguien comparte ese enlace), y el portal no manda cabeceras de seguridad de contenido
  (CSP). Para un sitio estático como este es opcional; lo menciono para que conste, no porque corra
  prisa.

## Mantenimiento

- **El README ya no describe el sitio.** Dice que el bloque "Todavía puedes dejar tu huella" va
  "arriba de la grilla, entre los filtros y la primera tarjeta" y advierte que "lo que vaya después de
  `#galeria-grid` no lo ve nadie". Hoy es una sección propia **después** de la galería, exactamente
  donde el README dice que nadie la ve. La decisión está explicada en un comentario del HTML y tiene
  su entrada en el menú, así que fue a propósito; pero el README quedó contradiciéndose y es el
  documento que va a leer quien mantenga esto en seis meses. Hay que actualizar ese párrafo.
- El oyente que cierra la tarjeta al hacer clic fuera del mapa se registra **dentro** de la función
  que dibuja las estrellas. Hoy no hace daño porque esa función corre una sola vez, pero el día que
  pongas `FORZAR_DATOS_JSON = false` y el portal lea la base de datos en vivo, cada actualización va a
  agregar un oyente más. Era la orden 26 de septiembre y sigue abierta.
- Por último, una corrección a algo que te dije hoy mismo: **las dos playlists sí son la misma lista.**
  Las comparé canción por canción y las dos tienen 56 temas, el mismo nombre y los mismos títulos
  (Baile Inolvidable, Al Taller del Maestro, Tras de Mí, Himno Nacional, El Día de Mi Suerte…); lo que
  cambia es el orden y, en un puñado de temas en coreano, cómo está escrito el título en cada
  plataforma. Que abran con canciones distintas era solo eso, el orden. No hay nada que cuadrar.

## Lo que no aplica

- El crédito de VMM en el pie: este no es un entregable de la agencia, es tu proyecto.
- Datos estructurados para Google (negocio local, evento): no es un negocio ni tiene nada que Google
  deba mostrar enriquecido. Y recuerda que las preguntas frecuentes ya no generan resultados
  enriquecidos desde mayo de 2026, así que tampoco por ahí.
- La dimensión de coherencia contra un brief de cliente: no hay brief porque no hay cliente. La
  referencia fue lo que el propio portal promete en sus textos.

---

## Órdenes de corrección sugeridas

Listas para copiar y pedir en otra conversación, en orden de prioridad. Las tres primeras son las que
afectan a personas reales que están esperando algo.

1. "Sincroniza `public/datos.json` con la hoja de respuestas 'La Huella de la Promoción 70' (la última
   fue el 22 de octubre de 2026), reconstruye y publica. Al comparar, ten en cuenta que una fila no es
   un estudiante: busca por apellido y por salón, no por el nombre exacto. Después anota la nueva
   fecha de sincronización en el README."
2. "Haz que las solicitudes Ley 1581 avisen a alguien: agrega una Cloud Function (o una automatización
   equivalente) que, al crearse un documento en `solicitudes_borrado`, mande un correo al comité.
   Mientras eso existe, cambia la frase del pie de 'lo retiramos o corregimos de inmediato' por un
   plazo que sí puedas cumplir."
3. "En la sección 'Tu huella' de `index.html`, cambia 'En unos días vas a verte en el universo' por una
   frase sin plazo ('Te sumamos al universo en la próxima actualización'), salvo que vayas a
   comprometerte a sincronizar en una fecha fija."
4. "En `profesores.js`, cambia la carátula de `maxresdefault.jpg` a `hqdefault.jpg` como imagen
   principal (hoy es el respaldo). Son 1,4 MB que bajan a 176 KB en las 13 tarjetas."
5. "Dale al reproductor de Spotify el mismo trato que al de YouTube en `index.html`: una tarjeta con
   botón que cree el iframe al pulsarla, en vez del iframe directo. Hoy Spotify se carga apenas se
   abre el portal, con unas 30 peticiones y telemetría a sus servidores."
6. "En `styles.css`, sube `--text-muted` de `#64748b` a `#7488a3` para que el texto secundario pase el
   mínimo de contraste (de 4,24 a 5,56 sobre 1), y usa ese mismo color en `.mapa-hint`. Mueve además
   el mensaje del mapa fuera de la zona de estrellas (debajo del mapa, no encima)."
7. "En celular, sube 'Palabras de sus Maestros' y 'Playlist' antes de la galería en `index.html`, o
   limita `#galeria-grid` a las primeras 24 tarjetas con un botón 'Ver las 171'. Hoy las tres últimas
   secciones empiezan después de la pantalla 45 de scroll."
8. "En `styles.css`, haz que `#categorias-list` y `#grupos-list` envuelvan en varias filas en celular
   (`flex-wrap: wrap`) en vez de cortarse: hoy la fila de constelaciones mide 1.461 px dentro de una
   ventana de 375 px y seis de las ocho quedan fuera de pantalla."
9. "En `main.js`, en `posicionarEstrella`, separa más las estrellas en pantallas pequeñas (sube el
   radio de la constelación o el alto del mapa en celular): hoy 159 de 171 tienen una vecina a menos
   de 22 px y 19 parejas están a menos de 6 px. Y cambia el mensaje táctil a 'Busca por nombre o toca
   una estrella'."
10. "Carga Firebase solo cuando haga falta: en `main.js`, convierte el import de `firebase/firestore` y
    de `firebase-client.js` en import dinámico dentro de la rama que se usa cuando `FORZAR_DATOS_JSON`
    es `false` (y para `medir()`, cárgalo después del primer pintado). El archivo publicado pesa hoy
    333 KB sin que el portal consulte la base de datos."
11. "Llena el campo `area` de los 13 profesores en `public/maestros.json` con la materia de cada uno;
    con eso las tarjetas dicen de quién es cada video y se activa solo el agrupado por área."
12. "Actualiza el README: el bloque 'Tu huella' ya no va arriba de la grilla, es una sección propia
    después de la galería con su entrada en el menú. Corrige ese párrafo y la advertencia sobre lo que
    va después de `#galeria-grid`."
13. "En `main.js`, saca `mapaEl.addEventListener('click', …)` fuera de `renderGalaxy` para que no se
    acumule un oyente por cada render cuando el portal lea Firestore en vivo."
14. "En `public/datos.json`, antepón 'Les desea:' (o equivalente) a los 16 mensajes que empiezan con
    'Que…', y corrige las mayúsculas de 'Estudiar Astronomía' y 'Convertirme en Química Farmacéutica'.
    Revisa en la hoja de respuestas si el mensaje idéntico de Isabella Bobadilla Rojas e Isabela López
    Gómez es real o un copiado al digitar."
15. "En `styles.css`, quita el recorte a cuatro líneas de `.pres-sueno` y haz que el modo presentación
    espere más en los sueños largos (tiempo proporcional al número de caracteres, con un mínimo de 5
    segundos)."
16. "En la galería, alinea las tarjetas arriba en vez de estirarlas al alto de la fila
    (`align-items: start` en `.galeria-grid`), para que las de sueños cortos no queden con un hueco."
17. "En `index.html`, deja el H1 como texto corrido ('Universo de los Sueños') y pártelo con estilos,
    no con `<br>`: hoy los lectores de pantalla lo leen pegado."
18. "Decide si vas a comprar un dominio propio antes de que se compartan más tarjetas: las imágenes que
    genera el portal llevan impreso 'syhg70.web.app' y ya están circulando."
