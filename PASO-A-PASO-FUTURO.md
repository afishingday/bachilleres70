# Flujo paso a paso: de las respuestas a la página publicada

Guía para seguir a medida que vas obteniendo fotos e información de las familias. Puedes ir tachando cada ítem cuando lo completes.

---

## Antes de abrir el formulario a las familias

- [ ] Formulario de Google creado con las 9 preguntas en orden (nombre, documento, grupo, dedicatoria, canción, sueño, 3 subidas de foto).
- [ ] Formulario vinculado a una hoja de cálculo (Respuestas).
- [ ] Carpetas en Drive: carpeta del formulario + **Fotos Gen70** con subcarpetas **11A, 11B, 11C, 11D, 11E, 11F**.
- [ ] En el formulario, las 3 preguntas de subida de archivo apuntando a la carpeta del formulario.
- [ ] **Code.gs** pegado en la hoja (Extensiones → Apps Script), con los **4 ID de carpeta** configurados (las 3 “File responses” + Fotos Gen70).
- [ ] Disparador creado: **Al enviar un formulario** → función **alEnviarFormulario** (y autorización concedida).
- [ ] Mensaje para padres enviado (con el enlace del formulario y lo que deben enviar).

---

## Cada vez que llegan respuestas (automático)

El script se ejecuta solo al enviar el formulario y:

- Copia las 3 fotos a **Fotos Gen70** en la subcarpeta del grupo (11A, 11B, etc.) con nombre `documento-nombre-infancia.png`, `documento-nombre-actual.png`, `documento-nombre-muro.png`.
- Añade una fila en la hoja **DatosWeb** (nombre, documento, grupo, dedicatoria, canción, sueño, rutas e IDs de Drive).

No tienes que hacer nada más por cada envío; solo revisar de vez en cuando que en Drive y en la hoja todo se vea bien.

---

## Cuando quieras actualizar la página (tras tener nuevas respuestas o datos)

### 1. Exportar el JSON

- [ ] Abre la **hoja de cálculo** de respuestas.
- [ ] **Extensiones** → **Apps Script**.
- [ ] En el desplegable elige la función **exportarJSON**.
- [ ] Pulsa **Ejecutar** (▶).
- [ ] Abre **Ejecuciones** → última ejecución → **Registro**.
- [ ] Copia **todo** el JSON que aparece.
- [ ] Pega el contenido en el archivo **datos.json** de tu proyecto (raíz, junto a index.html) y guarda.

### 2. Regenerar el HTML en index.html

- [ ] En la raíz del proyecto (donde está `datos.json` e `index.html`), ejecuta en la terminal:
  ```bash
  node scripts/generar-html-desde-json.js
  ```
- [ ] Verifica que en consola salga algo como: *index.html actualizado correctamente*.

### 3. Subir las fotos al hosting

- [ ] En **Drive**, abre la carpeta **Fotos Gen70** (con 11A, 11B, …, 11F dentro).
- [ ] Descarga la carpeta completa (clic derecho → Descargar, o selecciona todo y descarga). Si el hosting permite subir desde Drive, usa esa opción si la tienes.
- [ ] En tu **hosting**, sube la carpeta **fotos** (el contenido de Fotos Gen70) al mismo nivel que **index.html**, de modo que la estructura sea:
  ```
  tu-sitio/
  ├── index.html
  ├── styles.css
  ├── main.js
  └── fotos/
      ├── 11A/
      ├── 11B/
      ├── 11C/
      ├── 11D/
      ├── 11E/
      └── 11F/
  ```
- [ ] Si ya habías subido fotos antes, reemplaza o actualiza la carpeta **fotos** con la nueva descarga (así se añaden los estudiantes nuevos y se actualizan los que cambiaron).

### 4. Subir la página actualizada

- [ ] Sube (o reemplaza) en el hosting los archivos **index.html**, **styles.css** y **main.js** que tengas en tu proyecto.
- [ ] Abre la URL del sitio y comprueba:
  - [ ] Sección **El Antes y el Ahora**: se ven las fotos (infancia y actual al hacer hover) y los nombres.
  - [ ] Sección **Muro de los Deseos**: se ven las fotos y las dedicatorias al voltear la tarjeta.
  - [ ] Filtro por grupo (Todos, 11A, 11B, etc.) funciona correctamente.

---

## Resumen rápido (para cuando ya tengas el flujo claro)

| Paso | Acción |
|------|--------|
| 1 | Exportar JSON desde Apps Script (exportarJSON) → pegar en **datos.json** |
| 2 | Ejecutar `node scripts/generar-html-desde-json.js` |
| 3 | Descargar **Fotos Gen70** de Drive y subirla al hosting como carpeta **fotos/** |
| 4 | Subir **index.html**, **styles.css**, **main.js** al hosting |
| 5 | Revisar la página en el navegador |

---

## Si algo falla

- **Las fotos no se ven:** Comprueba que la carpeta **fotos** esté en el hosting con las subcarpetas 11A–11F y que los nombres de archivo coincidan con los del JSON (documento-nombre-infancia/actual/muro).
- **Faltan estudiantes o datos:** Revisa que **datos.json** tenga todas las filas de la hoja DatosWeb y vuelve a ejecutar el generador.
- **El script no copia fotos al enviar el formulario:** Revisa en Apps Script → Ejecuciones si hay error; confirma que los 4 ID de carpeta en Code.gs sean los correctos (sobre todo las 3 carpetas “File responses” donde llegan las subidas).

Guarda este archivo en el proyecto y úsalo como checklist cada vez que actualices la página.
