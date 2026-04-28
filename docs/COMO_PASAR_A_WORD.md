# Cómo pasar el proyecto a Word (DOCX)

Tu documento está en **Markdown** (`PROXECTO_FIN_CICLO_INDUSTRIA40.md`). Tienes varias formas de obtener un `.docx` para entregar o imprimir.

---

## Opción 1: Instalar Pandoc y convertir (recomendada)

**Pandoc** convierte muy bien Markdown → Word y respeta títulos, tablas y listas.

1. **Instalar Pandoc** (solo una vez):
   - Abre **PowerShell** o **Símbolo del sistema** y ejecuta:
     ```bash
     winget install pandoc
     ```
   - O descarga el instalador desde: https://pandoc.org/installing.html

2. **Cerrar y volver a abrir** la terminal para que reconozca `pandoc`.

3. **Convertir el documento:**
   - En la terminal, ve a la carpeta del proyecto y ejecuta:
     ```bash
     cd C:\Users\Victor\Documents\000Proyectos\Industria40_2
     pandoc docs/PROXECTO_FIN_CICLO_INDUSTRIA40.md -o docs/PROXECTO_FIN_CICLO_INDUSTRIA40.docx
     ```
   - Se generará el archivo `docs/PROXECTO_FIN_CICLO_INDUSTRIA40.docx`.

4. Abre el `.docx` en Word, ajusta la **portada** (nombre del alumno, tutor), **índice** si quieres actualizarlo, **márgenes** y **tamaño de fuente** (p. ej. 12 pt) para que encaje en unas 40 páginas A4.

---

## Opción 2: Convertidor online (sin instalar nada)

1. Entra en: **https://md2docx.app/**
2. Arrastra el archivo `PROXECTO_FIN_CICLO_INDUSTRIA40.md` o pégalo dentro de la carpeta `docs`.
3. O copia todo el contenido del `.md` y pégalo en la caja de texto.
4. Pulsa en **Convert** / **Descargar** y guarda el `.docx`.
5. Abre el archivo en Word y retoca portada, índices y formato si hace falta.

---

## Opción 3: Abrir o pegar en Word a mano

- **Abrir en Word:** En Word 2019/365, **Archivo → Abrir** y elige `PROXECTO_FIN_CICLO_INDUSTRIA40.md`. Word a veces interpreta parte del Markdown; luego guarda como `.docx` y formatea (títulos, tablas, negritas).
- **Copiar y pegar:** Abre el `.md` en Cursor o en el Bloc de notas, selecciona todo (Ctrl+A), copia (Ctrl+C), pega en un documento nuevo de Word (Ctrl+V). Después en Word:
  - Asigna estilos a los títulos (# = Título 1, ## = Título 2, etc.).
  - Revisa las **tablas** (pueden haberse pegado como texto; tendrás que convertirlas en “Insertar → Tabla” si es necesario).
  - Ajusta portada, márgenes y tamaño de letra (12 pt) para las 40 páginas.

---

## Después de tener el DOCX

- Completa en la **portada**: [Nome do alumno], [Nome do titor].
- Revisa el **índice** (si lo generas en Word: Referencias → Tabla de contenido).
- Configura **márgenes** (p. ej. Normal) y **tamaño de página A4**.
- Para **40 páginas**: cuerpo 12 pt, interlineado 1,15 o 1,5; si sobra texto, puedes reducir un poco el cuerpo o los márgenes.
- **Guardar como PDF** si te piden entrega en PDF: Archivo → Guardar como → PDF.

Si instalas Pandoc y quieres usar otra carpeta de salida o otro nombre de archivo, cambia la ruta en el comando `pandoc` (el segundo argumento después de `-o`).
