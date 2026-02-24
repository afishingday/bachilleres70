Gen70 - Apps Script
==================

1. Abre la hoja de cálculo vinculada al formulario de Google.
2. Extensiones → Apps Script.
3. Pega aquí el contenido de Code.gs (reemplaza todo lo que haya).
4. Arriba en Code.gs, rellena los 4 ID de carpeta:
   - ID_CARPETA_FOTO_INFANCIA = ID de "6. Foto de infancia (antes) (File responses)"
   - ID_CARPETA_FOTO_ACTUAL   = ID de "7. Foto actual (grado 11) (File responses)"
   - ID_CARPETA_FOTO_MURO     = ID de "8. Foto para el Muro de los Deseos (File responses)"
   - ID_CARPETA_FOTOS        = ID de la carpeta "Fotos Gen70"
5. Guarda (Ctrl+S).
6. Crea un disparador: icono Reloj → Añadir disparador:
   - Función: alEnviarFormulario
   - Origen: Desde una hoja de cálculo
   - Tipo: Al enviar un formulario
7. Autoriza la aplicación cuando lo pida.

Cada envío del formulario renombrará y copiará las 3 fotos a Fotos Gen70/11X/
y añadirá una fila en la hoja "DatosWeb".

Para exportar JSON: ejecuta la función exportarJSON() y copia el resultado del
registro (Ver → Registro) a un archivo datos.json.
