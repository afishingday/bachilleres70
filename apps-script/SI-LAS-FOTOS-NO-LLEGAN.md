# Si las fotos no quedan en Fotos Gen70

Sigue estos pasos para localizar el problema.

## 1. Revisar la última ejecución del script

1. Abre **Apps Script** (Extensiones → Apps Script en la hoja).
2. Haz clic en **Ejecuciones** (icono de play en la barra lateral).
3. Mira la última ejecución de **alEnviarFormulario**: ¿completó bien o hay error en rojo?
4. Si hay error, abre la ejecución y lee el mensaje.
5. Si completó bien, haz clic en ella y abre **Registro** (View log). Deberías ver líneas como:
   - `Procesando: nombre=..., documento=..., grupo=..., slug=...`
   - `Foto 1: encontrada por ID` (o "archivo más reciente en carpeta", o "NO encontrada")

Si ves **"Foto X: NO encontrada"**, el script no está encontrando el archivo en esa carpeta. Pasa al paso 2.

## 2. Comprobar los ID de las 3 carpetas de subida

Al añadir la pregunta "Número de documento", Google a veces crea **carpetas nuevas** para las subidas. El script sigue usando los ID de las carpetas antiguas, donde ya no se suben archivos.

1. Abre **Google Drive** y entra en la carpeta donde está el formulario (ej. **Gen70 Recopilación** o **Datos y fotos - Generación 70...**).
2. Verás varias carpetas con nombres tipo **"7. Foto de infancia (antes) (File responses)"**, **"8. Foto actual..."**, **"9. Foto para el Muro..."** (o 6, 7, 8 si no añadiste la pregunta documento).
3. Abre **cada una** y mira la **fecha de la última modificación** de los archivos. Las que tengan archivos subidos **hoy** (o en tu última prueba) son las que está usando el formulario **ahora**.
4. Esas 3 carpetas son las que debe usar el script. Para cada una:
   - Ábrela.
   - Copia el **ID** de la URL (la parte después de `/folders/`).
5. En **Code.gs**, pega esos 3 ID en:
   - `ID_CARPETA_FOTO_INFANCIA` → carpeta de **infancia (antes)**
   - `ID_CARPETA_FOTO_ACTUAL` → carpeta de **actual (grado 11)**
   - `ID_CARPETA_FOTO_MURO` → carpeta de **Muro de los Deseos**
6. Guarda el script y vuelve a enviar una respuesta de prueba.

## 3. Comprobar el orden de las columnas en la hoja

El script asume este orden: 1=Nombre, 2=Documento, 3=Grupo, 4=Dedicatoria, 5=Canción, 6=Sueño, 7=Foto infancia, 8=Foto actual, 9=Foto muro.

1. Abre la **hoja de respuestas** del formulario.
2. Mira la **primera fila** (encabezados). ¿Coincide ese orden? Si "Grupo" está en otra columna, el script leerá mal el grupo y puede estar guardando en otra carpeta (o fallando).
3. Si el orden es distinto, hay que cambiar en **Code.gs** las constantes `COL_GRUPO`, `COL_FOTO_INFANCIA`, etc., para que coincidan con la posición real de cada columna (la primera columna es 0, la segunda 1, etc.).

## 4. Probar ejecutando el script a mano

1. En Apps Script, en el desplegable de funciones elige **alEnviarFormulario**.
2. Pulsa **Ejecutar** (▶).
3. Revisa de nuevo **Ejecuciones** y **Registro**. Así ves con calma qué hace y si encuentra o no cada foto.
