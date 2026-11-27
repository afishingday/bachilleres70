# Versiones de Leo por tipo de sueño

Material de trabajo para generar con IA un Leo por cada tipo de sueño, en vez de uno por
constelación (8 dibujos repartidos entre 201 personas quedaba demasiado genérico).

**Los grupos no son inventados**: son los mismos 41 de `simbolos.js`, que ya están probados contra
los 201 sueños reales. Si se genera un Leo por grupo, encaja en el código que ya existe sin inventar
una clasificación nueva. Para ver quién cae en cada grupo: `herramientas/simbolos.html`.

## Dónde va esto hoy (26 de noviembre de 2026)

**Están los 41.** Los 201 estudiantes tienen su Leo, y ningún grupo quedó sin usar. Los archivos
están en `assets/leos/` y el portal ya los usa.

Esta página sigue sirviendo para dos cosas: si algún día entra un estudiante nuevo con un sueño que
abre un grupo que no existía, aquí está qué debería llevar ese Leo y el prompt base para que
combine con los otros 41; y si hay que regenerar uno, aquí está la descripción con la que se hizo.

El respaldo sigue en pie aunque hoy no se use: si falta un archivo, esa persona sale con el Leo de
siempre en la tarjeta y con el símbolo de línea en la presentación, sin que se rompa nada.

## Cuántos hacen falta de verdad

El reparto es muy desigual, así que no hay que hacer los 41 para que se note:

| Si se hacen… | Cubren | De los 201 |
|---|---|---|
| los 10 más grandes | 122 estudiantes | 61 % |
| los 19 con 4 o más | 168 estudiantes | **84 %** |
| los 30 con 2 o más | 190 estudiantes | 95 % |
| los 41 | 201 estudiantes | 100 % |

**Se puede ir publicando de a poco.** La idea es que el código busque el Leo del grupo y, si todavía
no existe, use lo que hay hoy (el símbolo de línea). Así el portal funciona igual con 3 Leos que con
41, y se van agregando sin volver a tocar nada.

## Lo que conviene tener en cuenta antes de generar

- **Lo difícil no es el dibujo, es que los 41 parezcan el mismo Leo.** Generar cada uno por separado
  desde texto da 41 gatos distintos. Hay que partir siempre de la misma imagen de referencia (el Leo
  que ya existe) y cambiar solo el disfraz y los objetos, con la misma pose, la misma luz y el mismo
  encuadre.
- **Tamaño**: en la tarjeta para compartir, Leo se dibuja a 290 px de alto sobre un lienzo de 1080.
  Con que el archivo tenga unos 700 px de alto sobra. Más grande solo pesa.
- **Fondo transparente** (PNG o WebP), porque la tarjeta lo pone encima de su propio degradado de
  color según la constelación.
- **Peso**: en el modo presentación las diapositivas pasan cada 5 segundos, así que en una
  proyección completa se pedirían muchas imágenes seguidas. Conviene que cada una no pase de unos
  200 KB (WebP ayuda bastante).
- Una opción es **dejar el símbolo de línea en la presentación** (pesa cero, se lee de lejos en el
  proyector y ya está hecho) y usar los Leos solo en la tarjeta para compartir, que es la que la
  gente publica. Se puede decidir después de ver los primeros.

## Prompt base (el mismo para todos)

En inglés, que es donde los generadores rinden mejor. Lo único que cambia entre uno y otro es la
última línea.

```
3D cartoon mascot character, cheerful anthropomorphic jaguar cub, orange-tan fur with
darker spots, big green eyes, friendly open smile, standing full body facing viewer,
wearing a black hoodie with red and white stripes on the sleeves and "LSYH SENIORS"
on the chest, soft studio lighting, dark navy-to-purple gradient background with a
subtle glow behind the character, clean render, same character and same pose in every
image, transparent background.

<AQUÍ VA LA LÍNEA DE CADA GRUPO>
```

## Los 41 grupos

Ordenados por cuánta gente cubren. El nombre entre paréntesis es el del símbolo en `simbolos.js`,
para que coincidan los archivos.

### Los grandes — con estos 19 ya se cubre el 84 %

| # | Grupo | Est. | Qué sueños agrupa | Qué lleva Leo |
|---|---|---|---|---|
| 1 | `pulso` | 18 | Medicina, cirugía, pediatría, enfermería, fisioterapia | Bata blanca sobre el hoodie y estetoscopio al cuello |
| 2 | `moneda` | 18 | Finanzas, contaduría, economía, trading | Moneda dorada en la mano, calculadora, corbata |
| 3 | `crecimiento` | 16 | Empresa, emprendimiento, administración | Maletín, señalando una gráfica que sube flotando a su lado |
| 4 | `globo` | 13 | Negocios y relaciones internacionales, viajar | Globo terráqueo bajo el brazo, maletita con calcomanías de banderas |
| 5 | `balanza` | 11 | Derecho, abogacía, derechos humanos | Mazo de juez y una balanza pequeña |
| 6 | `huella` | 11 | Veterinaria, zootecnia | Cachorro en brazos y estetoscopio |
| 7 | `balon` | 10 | Fútbol, arquero | Balón bajo el pie y camiseta de fútbol sobre el hoodie |
| 8 | `codigo` | 9 | Ingeniería de sistemas, software, IA | Portátil abierto con código brillando, audífonos |
| 9 | `brujula` | 8 | Todavía explorando su camino | Brújula, mapa enrollado y morral *(este ya existe)* |
| 10 | `arquitectura` | 8 | Arquitectura, ingeniería civil, interiores | Casco de obra, planos enrollados, escuadra |
| 11 | `mente` | 7 | Psicología, filosofía | Libreta y lápiz, pose pensativa, idea brillando sobre la cabeza |
| 12 | `avion` | 6 | Aviación, piloto, aeronáutica | Gorra de piloto, gafas de aviador, avioncito en la mano |
| 13 | `nota` | 6 | Música, canto, producción musical | Guitarra o trompeta, audífonos al cuello |
| 14 | `percha` | 5 | Diseño de modas, modelaje | Cinta métrica al cuello, tijeras y retazos de tela |
| 15 | `megafono` | 5 | Publicidad, mercadeo, marketing | Megáfono y un celular con corazones flotando |
| 16 | `labial` | 5 | Maquillaje, cosmetología | Brocha grande y paleta de maquillaje |
| 17 | `diente` | 4 | Odontología | Espejo de dentista, tapabocas, diente gigante de utilería |
| 18 | `gorro` | 4 | Gastronomía, chef | Gorro de chef, delantal, cuchara de palo y olla |
| 19 | `engranaje` | 4 | Mecánica, mecatrónica, industrial | Llave inglesa, gafas de seguridad, engranaje |

### Los medianos — suman otro 11 %

| # | Grupo | Est. | Qué sueños agrupa | Qué lleva Leo |
|---|---|---|---|---|
| 20 | `cine` | 2 | Animación, audiovisual | Claqueta y cámara de cine |
| 21 | `saturno` | 2 | Astronomía | Telescopio y un Saturno pequeño flotando |
| 22 | `casa` | 2 | **La casa para la mamá y la abuelita** | Casco de obra y una casita de maqueta en las manos |
| 23 | `manzana` | 2 | Nutrición | Manzana y un tazón de frutas |
| 24 | `pluma` | 2 | Periodismo, comunicación social | Micrófono y libreta de reportero |
| 25 | `manos` | 2 | Trabajo social, ayudar a los demás | Manos abiertas sosteniendo un corazón que brilla |
| 26 | `hoja` | 2 | Ingeniería ambiental, agronomía | Matica en una maceta, hojas alrededor |
| 27 | `libro` | 2 | Pedagogía, docencia | Libro abierto, puntero y tablero detrás |
| 28 | `cohete` | 2 | NASA, espacial | Casco de astronauta bajo el brazo, cohete pequeño |
| 29 | `ojo` | 2 | Optometría | Gafas enormes y una tabla de examen visual |
| 30 | `medalla` | 2 | Deportes en general | Medalla al cuello, pito y banda en la frente |

### Los de una sola persona — el último 5 %

| # | Grupo | Est. | Sueño | Qué lleva Leo |
|---|---|---|---|---|
| 31 | `joya` | 1 | Joyería y tatuajes | Gema brillante y máquina de tatuar |
| 32 | `guante` | 1 | Peleador profesional | Guantes de boxeo puestos |
| 33 | `matraz` | 1 | Química farmacéutica | Bata de laboratorio y matraz con líquido brillante |
| 34 | `mascara` | 1 | Actriz | Máscaras de teatro y un reflector |
| 35 | `corazon` | 1 | Cardiología | Estetoscopio y un corazón que late brillando |
| 36 | `paleta` | 1 | Diseño interactivo | Tableta digital con lápiz y paleta de colores |
| 37 | `idiomas` | 1 | Traducción de idiomas | Globos de diálogo con distintos alfabetos y banderitas |
| 38 | `basquet` | 1 | NBA, baloncesto | Balón de baloncesto girando en un dedo |
| 39 | `cinta` | 1 | Bailarina profesional | Cinta de gimnasia ondeando, en punta de pie |
| 40 | `adn` | 1 | Biología | Hélice de ADN flotando y microscopio |
| 41 | `bandera` | 1 | Automovilismo | Casco de carreras y bandera a cuadros |

## Dónde van los archivos

**El código ya está listo para recibirlos.** Uno por grupo, con el mismo nombre del símbolo, en
`assets/leos/`:

```
assets/leos/pulso.webp
assets/leos/moneda.webp
assets/leos/crecimiento.webp
...
```

No hay ninguna lista que actualizar: se deja el archivo ahí, se reconstruye el sitio, y aparece.
La carpeta tiene un `LEEME.txt` con lo mismo, para no tener que buscar esta página. El detalle de
cómo funciona está en `leos.js`.

Van en `assets/` y no en `public/` justamente para que se recojan solos: Vite sabe qué hay en
`assets/` y les pone un nombre con huella, así el celular de alguien que ya vio el portal no se
queda con una versión vieja en caché.

Mientras un grupo no tenga el suyo, el Leo de siempre (`assets/mascota-lsyh.png`) hace de respaldo
en la tarjeta, y la presentación muestra el símbolo de línea.

### Lo que ya se probó

Con un Leo de prueba puesto en la carpeta: la tarjeta salió con ese Leo, el botón "Con Leo" del
diálogo mostró ese mismo Leo en la miniatura, y la diapositiva lo puso en lugar del trazo. Los
estudiantes de otros grupos siguieron saliendo igual que antes, en la misma pasada. Al quitar el
archivo, el portal volvió exactamente a como estaba.
