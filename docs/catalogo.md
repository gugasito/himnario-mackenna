# Catálogo de himnos

`public/data/hymns.json` es un catálogo local derivado del PDF que la iglesia publica en `https://ucbmackenna.org/assets/himnario.pdf`. La copia usada para la importación está en `data/source/himnario.pdf`; su SHA-256 registrado es `dcd40b3c107facdef421876cf034bd558322f740b476558d1a33712f6d954dcb`. Corresponde a `mackenna-angular` en el commit `808f5a7e8a65e28e25e584d85fc81bdf3619cf02` de `develop`; la copia publicada verificada tenía el mismo hash. El PDF tiene 413 páginas físicas: los himnos ocupan las páginas 14–398 y el índice alfabético comienza en la 399. Hay 385 entradas en el índice numérico y 385 himnos extraídos, con 1.642 bloques de estrofa/coro.

## Actualizar

Reemplaza la copia local únicamente después de verificar la nueva fuente y su procedencia. Ejecuta desde la raíz:

```sh
python3 scripts/import-hymns.py
python3 scripts/import-hymns.py --check
python3 scripts/validate-catalog.py
python3 -m unittest scripts/test-import-hymns.py
```

El importador usa `pdftotext` (Poppler) y la biblioteca estándar de Python; no requiere paquetes de Python. `importedAt` usa la fecha local de importación. `--check` vuelve a extraer la fuente y compara todo el catálogo, ignorando solo `importedAt`, para detectar resultados obsoletos. El validador contrasta además orden y números con el índice numérico del PDF. El importador comprueba que sigan existiendo 413 páginas, que el himno 382 esté en la página 398 y que el índice alfabético empiece en la 399; un PDF con otra paginación o estructura falla claramente. Si hay anomalías no reemplaza el JSON actual; el archivo se escribe mediante reemplazo atómico. `sourcePage` es la página física del PDF, empezando en 1. `number` conserva el texto de variante impreso (`10-A`, `104 A y B`) y solo el `id` se normaliza a minúsculas y guiones (`10-a`, `104-a-y-b`).

La página física 277 imprime solo `261-B`, sin título; el título se deja vacío para no inferirlo desde `261-A`. El contenido de esa variante sí se conserva. El número compuesto `288 y 289` también se conserva literalmente y su ID es `288-y-289`. El importador compara cada encabezado con el índice numérico, ignorando espacios, puntuación y mayúsculas. Quedan dos diferencias entre el texto impreso del himno y el índice: 205 aparece como `OÍ BENDITA HISTORIA` frente a `BENDITA HISTORIA`, y 303 como `¡CAMARADAS! ...` frente a `iCAMARADAS! ...`. El catálogo mantiene el encabezado de la página del himno; ambos casos quedan reportados para revisión editorial.

El APK antiguo contiene 385 registros. Una comparación normalizada por IDs encontró 379 claves comunes; entre ellas coinciden 354 títulos y 85 letras concatenadas tras normalizar puntuación y mayúsculas. Hay 6 claves solo en cada catálogo, principalmente por formatos distintos de los números de variantes. Esta comparación es diagnóstica: no usa el APK como fuente y no autoriza reemplazar texto del PDF.

## Revisión editorial

La extracción conserva títulos, líneas, estrofas y marcas de coro detectables en el texto del PDF. Es un borrador: el catálogo conserva `reviewRequired: true`. Antes de considerarlo aprobado, revisar manualmente títulos partidos, límites entre estrofas, coros repetidos, signos, acentos y casos en que el diseño del PDF altere el orden o separación del texto. Los conteos del importador y las pruebas estructurales no sustituyen esa revisión.

El APK antiguo puede consultarse como referencia comparativa, pero no es fuente de importación. Las letras del PDF actual prevalecen; cualquier diferencia relevante debe anotarse para revisión editorial, sin sustituir texto en silencio.
