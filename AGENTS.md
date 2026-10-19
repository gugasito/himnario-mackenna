# Himnario Mackenna

Aplicación móvil independiente para Android e iOS de la Iglesia IEUCB Mackenna.
La web existente en `../mackenna-angular` es una fuente de contenido de solo lectura.

## Decisiones iniciales (18 de octubre de 2026)

- Angular standalone 21, Ionic 9, Capacitor 8, TypeScript y npm. Node local: 24.14.0.
- Un solo proyecto y catálogo incluido para lectura y búsqueda sin conexión en las aplicaciones nativas.
- Interfaz en español; números originales, variantes A/B, estrofas y coros deben conservarse.
- Fuente principal: PDF del repositorio de la iglesia. El APK antiguo sirve para comparación, nunca para reemplazar silenciosamente las letras actuales.
- No modificar el proyecto de la iglesia. El usuario autorizó publicar este proyecto en `https://github.com/gugasito/himnario-mackenna.git`; la publicación en tiendas queda fuera del alcance actual.

## Estructura y contratos previstos

- `src/app/`: pantallas y servicios; `public/data/hymns.json`: catálogo generado.
- `data/source/`: fuente y procedencia; `scripts/`: importación y validación.
- `docs/`: decisiones, flujo de desarrollo, revisión de contenido y diseño.
- `android/`, `ios/`: proyectos Capacitor; identificador inicial provisional `org.ucbmackenna.himnario`.
- Catálogo: objeto `{ version: 1, source: { name, url, sha256, importedAt, reviewRequired: true }, hymns: Hymn[] }`.
- `Hymn`: `{ id: string, number: string, title: string, verses: { kind: 'verse' | 'chorus', lines: string[] }[], sourcePage: number }`.
- `sourcePage` es el número físico del PDF, basado en 1. IDs estables derivados del número, por ejemplo `10-a`.
- La extracción es un borrador pendiente de revisión editorial. No inventar categorías, autores ni letras.
- Favoritos y preferencias locales con Capacitor Preferences. No se necesita cuenta ni servidor para el alcance inicial.
- Comandos verificados: `npm ci` (instalación reproducible), `npm start` (puerto 4200), `npm run check` (compilación web y tipos), `npm test` (5 pruebas), `npm run catalog:check` y `npm run catalog:test` (8 pruebas del importador).
- `npm run cap:sync` compila la web y sincroniza Android e iOS. GitHub Actions ya compiló Android firmado y la app para iOS Simulator; las pruebas en dispositivos físicos siguen pendientes. El entorno local carece de Xcode completo y Android SDK.
- `public/pantallas.html` es una vista de revisión con tres rutas reales a 360 px; no forma parte de la navegación de la aplicación.
- Referencias: `docs/decision-tecnica.md`, `docs/desarrollo.md`, `docs/diseno.md`, `docs/catalogo.md` y `docs/hoja-de-ruta.md`.

## Releases automáticas

- El usuario autorizó compilar Android e iOS al publicar releases y adjuntar los resultados en GitHub; no se publica en tiendas.
- Android debe conservar una firma estable de esta nueva aplicación. Las claves se guardan como secretos de GitHub y en un respaldo privado fuera del repositorio; nunca se incluyen en archivos de compilación, logs ni artefactos.
- El usuario confirmó que no tiene Apple Developer. La entrega iOS actual es para simulador de Mac; no presentarla como un IPA instalable en iPhone.
- Compilar el commit exacto de la etiqueta de release, validar versiones y publicar los archivos solo después de que ambas plataformas hayan terminado correctamente.

## Calidad y colaboración

Usar la habilidad disponible `codex-orchestrator` para implementar con responsables definidos y revisión del coordinador.
Consultar las decisiones y el diseño en `docs/` una vez creados. No revertir trabajo de otros agentes.
Verificar búsquedas sin tildes y por número, variantes A/B, persistencia, estados vacíos y rutas de lectura inválidas.
Revisar visualmente las pantallas en móvil; distinguir pruebas de navegador de compilaciones nativas.
Accesibilidad: controles con nombre, foco visible, áreas táctiles amplias, contraste y adaptación a texto grande.
