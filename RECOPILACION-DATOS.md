# Cómo recopilar la información (150+ estudiantes)

Para no cargar manualmente los datos de cada estudiante, se usa **Google Form** + **Apps Script** en la hoja de respuestas. Los padres envían todo en un solo formulario; el script renombra las fotos y deja los datos listos para la web.

---

## 1. Crear la carpeta y el formulario en Google Drive

1. Crea una carpeta en Drive, por ejemplo **"Gen70 Recopilación"**.
2. Dentro, crea otra carpeta **"Fotos Gen70"**. Dentro de esta crea las subcarpetas **11A**, **11B**, **11C**, **11D**, **11E**, **11F**.
3. Crea un **Formulario de Google** (formularios.google.com) y asígnale un título, por ejemplo: *Datos y fotos – Generación 70 LSyH*.
4. En el formulario, activa **"Almacenar respuestas en Google Sheets"** (respuestas → Crear nueva hoja de cálculo) para que cada envío quede en una hoja.

---

## 2. Preguntas del formulario (en este orden)

Configura el formulario con estas preguntas, **exactamente en este orden** (el script usa la posición de las columnas):

| # | Pregunta | Tipo | Configuración |
|---|----------|------|----------------|
| 1 | **Nombre completo del estudiante** | Respuesta breve | Obligatoria |
| 2 | **Número de documento (cédula / ID)** | Respuesta breve | Obligatoria. Identificador único para las fotos; evita conflictos si hay nombres repetidos. |
| 3 | **Grupo** | Lista desplegable | Opciones: 11A, 11B, 11C, 11D, 11E, 11F. Obligatoria |
| 4 | **Dedicatoria para el Muro de los Deseos** | Párrafo | Lo que quieren que lean en la tarjeta. Obligatoria |
| 5 | **Canción para la playlist** | Respuesta breve | Nombre de la canción o enlace de Spotify/YouTube. Obligatoria |
| 6 | **Sueño o meta (para el Mapa de Sueños)** | Respuesta breve | Ej: "Estudiar Ingeniería", "Viajar por el mundo". Obligatoria |
| 7 | **Foto de infancia (antes)** | Subida de archivo | 1 archivo, solo imágenes. Obligatoria |
| 8 | **Foto actual (grado 11)** | Subida de archivo | 1 archivo, solo imágenes. Obligatoria |
| 9 | **Foto para el Muro de los Deseos** | Subida de archivo | 1 archivo, solo imágenes. Obligatoria |

Al guardar el formulario, Google crea **tres carpetas** dentro de la carpeta que hayas elegido para las subidas (por ejemplo "Gen70 Recopilación"):
- **7. Foto de infancia (antes) (File responses)**
- **8. Foto actual (grado 11) (File responses)**
- **9. Foto para el Muro de los Deseos (File responses)**

Cada envío del formulario guarda una foto en cada una de esas carpetas. El script usa los 3 IDs para saber de dónde leer las fotos.

Guarda el formulario y asegúrate de que las respuestas se envían a una **hoja de cálculo** (una sola hoja con todas las respuestas).

**Si ya tenías el formulario sin la pregunta "Número de documento":** añade una nueva pregunta **después de "Nombre completo del estudiante"**: tipo Respuesta breve, título "Número de documento (cédula / ID)", obligatoria. Las preguntas de subida de archivo pasarán a ser la 7, 8 y 9. **Importante:** al añadir una pregunta, a veces Google crea **carpetas nuevas** para las subidas. Si las fotos no aparecen en Fotos Gen70, abre la carpeta "Gen70 Recopilación" en Drive y comprueba qué 3 carpetas "(File responses)" tienen las fotos de tu último envío; copia los ID de **esas** tres y actualízalos en el script (paso 5).

---

## 3. Obtener los ID de las carpetas

Necesitas **cuatro** IDs para el script. Para obtener el ID de una carpeta: ábrela en Drive, mira la URL (ej. `https://drive.google.com/drive/folders/1ABC123xyz...`) y copia la parte después de `/folders/`.

1. **Carpeta "7. Foto de infancia (antes) (File responses)"** — dentro de "Gen70 Recopilación".
2. **Carpeta "8. Foto actual (grado 11) (File responses)"** — misma ubicación.
3. **Carpeta "9. Foto para el Muro de los Deseos (File responses)"** — misma ubicación.
4. **Carpeta "Fotos Gen70"** — la que creaste para guardar las fotos ya renombradas (con subcarpetas 11A, 11B, … 11F).

Guárdalos; los usarás en el paso 5.

---

## 4. Añadir el script a la hoja de respuestas

1. Abre la **hoja de cálculo** vinculada al formulario (Respuestas).
2. Menú **Extensiones** → **Apps Script**.
3. Borra el código que aparezca y pega todo el contenido del archivo **`apps-script/Code.gs`** de este proyecto.
4. Guarda el proyecto (Ctrl+S) y ponle un nombre, por ejemplo *Gen70 Procesar respuestas*.

---

## 5. Configurar los ID en el script

En el archivo **Code.gs**, al inicio verás:

```javascript
var ID_CARPETA_FOTO_INFANCIA = '';  // "6. Foto de infancia (antes) (File responses)"
var ID_CARPETA_FOTO_ACTUAL   = '';  // "7. Foto actual (grado 11) (File responses)"
var ID_CARPETA_FOTO_MURO     = '';  // "8. Foto para el Muro de los Deseos (File responses)"
var ID_CARPETA_FOTOS        = '';  // "Fotos Gen70"
```

Pega en cada variable el ID de la carpeta correspondiente (abre cada carpeta en Drive y copia el ID de la URL). Guarda el script.

---

## 6. Activar el disparador (trigger)

1. En Apps Script, haz clic en el icono **Reloj** (Disparadores / Triggers).
2. **Añadir disparador**.
3. Elige:
   - Función: **`alEnviarFormulario`**
   - Origen del evento: **Desde una hoja de cálculo**
   - Tipo de evento: **Al enviar un formulario**
4. Guarda. La primera vez te pedirá **autorizar** la aplicación (cuenta de Google, permisos de Drive y de la hoja). Acepta.

A partir de ahí, **cada vez que alguien envíe el formulario**, el script se ejecutará solo y:
- Tomará el nombre, el **número de documento** y el grupo.
- Usará el documento como identificador único para las fotos (ej: `12345678-infancia.jpg`). Si no se envió documento, usará un slug del nombre.
- Tomará la foto más reciente de cada una de las 3 carpetas “File responses” (infancia, actual, muro).
- Las copiará a la carpeta del grupo (11A, 11B, etc.) dentro de "Fotos Gen70" con nombres como: `12345678-infancia.jpg`, `12345678-actual.jpg`, `12345678-muro.jpg` (o .png según suban).
- Añadirá una fila en la hoja **"DatosWeb"** con: nombre, documento, grupo, dedicatoria, canción, sueño y rutas de las fotos.

---

## 7. Hoja "DatosWeb"

El script crea (si no existe) una hoja llamada **"DatosWeb"** con columnas:

| nombre | documento | grupo | dedicatoria | cancion | sueno | foto_infancia | foto_actual | foto_muro | foto_infancia_id | foto_actual_id | foto_muro_id |

- **foto_infancia**, **foto_actual**, **foto_muro**: rutas del archivo (ej: `11A/8100898-maria-garcia-infancia.png`).
- **foto_infancia_id**, **foto_actual_id**, **foto_muro_id**: ID de cada archivo en Google Drive. Sirven para mostrar las fotos **directamente desde Drive** sin subirlas al hosting (ver sección siguiente).

**Opción A – Subir fotos al hosting:** Sube la carpeta "Fotos Gen70" a tu servidor como `fotos/` y usa las rutas en el JSON.  
**Opción B – Usar Drive:** Comparte la carpeta "Fotos Gen70" como *Cualquier persona con el enlace puede ver*, exporta el JSON (con los campos `foto_*_id`) y el generador de HTML usará las URLs de Drive para las imágenes.

---

## 8. Exportar datos para la web

Cuando tengas todas las respuestas (o las que quieras publicar):

1. En la hoja **"DatosWeb"**, selecciona todos los datos (sin el encabezado si prefieres).
2. **Archivo** → **Descargar** → **Valores separados por comas (.csv)**.
3. Puedes convertir ese CSV a **JSON** con la herramienta que prefieras (por ejemplo [csv2json](https://www.convertcsv.com/csv-to-json.htm)) o usar la función **"Exportar JSON"** del script (ver abajo en Code.gs).
4. Con ese JSON puedes:
   - Alimentar un generador de HTML (hay un ejemplo en **`scripts/generar-html.js`**), o
   - Cargar el JSON en la página con JavaScript y pintar las tarjetas dinámicamente.

---

## Resumen del flujo

1. Padres rellenan **un solo formulario** (datos + 3 fotos).
2. El **script** renombra y organiza las fotos en **Fotos Gen70 / 11A … 11F**.
3. Los datos quedan en la hoja **DatosWeb** listos para exportar.
4. Tú descargas **Fotos Gen70** (o la subes a tu hosting) y usas el CSV/JSON para generar o alimentar la página.

---

## 9. Obtener el JSON para generar el HTML

**Opción A – Desde Apps Script**  
En la hoja, abre **Extensiones → Apps Script**, elige la función **`exportarJSON`** en el desplegable y pulsa **Ejecutar**. En **Ver → Registro** (o **Ejecuciones**) verás el JSON. Cópialo y guárdalo en tu proyecto como **`datos.json`** (en la raíz, junto a `index.html`).

**Opción B – Desde la hoja**  
Descarga la hoja "DatosWeb" como CSV y convierte a JSON con una herramienta online (por ejemplo [convertcsv.com/csv-to-json](https://www.convertcsv.com/csv-to-json.htm)). Ajusta los nombres de columnas a: `nombre`, `grupo`, `dedicatoria`, `cancion`, `sueno`, `foto_infancia`, `foto_actual`, `foto_muro`. Guarda el resultado como **`datos.json`** en la raíz del proyecto.

---

## 10. Generar el HTML a partir del JSON

En el proyecto hay un script de Node.js que lee **`datos.json`** y genera los bloques HTML de las tarjetas:

1. Asegúrate de tener **Node.js** instalado.
2. Coloca **`datos.json`** en la raíz del proyecto (junto a `index.html`).
3. En la terminal, desde la raíz del proyecto:
   ```bash
   node scripts/generar-html-desde-json.js
   ```
4. Se crearán **`generado-antesyahora.html`** y **`generado-muro.html`**.
5. Abre esos archivos, copia todo el contenido y **reemplaza** en `index.html`:
   - El contenido de `<div class="students-grid">` (todas las `<article class="student-card">`) por el de `generado-antesyahora.html`.
   - El contenido de `<div class="wish-cards-grid">` (todas las `<article class="wish-card">`) por el de `generado-muro.html`.

- Si el JSON tiene **foto_infancia_id**, **foto_actual_id**, **foto_muro_id** (exportados desde la hoja DatosWeb), el generador usará las URLs de Drive (`https://drive.google.com/uc?export=view&id=...`) y **no necesitas subir las fotos al hosting**. Antes, comparte la carpeta **Fotos Gen70** en Drive: clic derecho → Compartir → "Cualquier persona con el enlace" → "Lector".
- Si no hay IDs de Drive, el generador usará las rutas `fotos/11A/...`; en ese caso sube la carpeta "Fotos Gen70" a tu servidor como `fotos/`.
