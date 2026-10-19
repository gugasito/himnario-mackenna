# Desarrollo

## Flujo de trabajo

El proyecto usa Angular standalone 21.2.25, Ionic 9.0.8 y Capacitor 8.5.3 con TypeScript y npm. Se mantiene una sola aplicación Angular: se desarrolla y revisa primero en navegador, y Capacitor empaqueta esa misma interfaz dentro de una aplicación nativa Android o iOS.

Usa Node.js 24.14.0 según `.nvmrc`. Desde la raíz instala dependencias con `npm ci` y levanta el servidor local con `npm start` (`http://127.0.0.1:4200`). Los comandos disponibles son:

| Comando | Acción |
| --- | --- |
| `npm run build` | Compila la aplicación Angular en `dist/`. |
| `npm test` | Ejecuta las pruebas con Vitest. |
| `npm run check` | Compila y comprueba los tipos de pruebas con TypeScript. |
| `npm run catalog:check` | Valida el catálogo y su SHA-256 frente al PDF local. |
| `npm run catalog:test` | Ejecuta las pruebas del importador del catálogo. |
| `npm run cap:sync` | Compila y sincroniza los recursos web en Android e iOS mediante Capacitor. |
| `npm run android` / `npm run ios` | Abre el proyecto correspondiente en Android Studio o Xcode. |

Los comandos del catálogo (`catalog:check` y `catalog:test`) requieren Python 3; para importar o regenerar el catálogo se necesita `pdftotext` de Poppler. El servidor, la compilación web y las pruebas de aplicación requieren Node y npm.

El flujo habitual es editar Angular compartido, revisar en navegador y luego ejecutar `npm run cap:sync` para probar en Android Studio o Xcode. La sincronización prepara los recursos nativos; no equivale a compilar, firmar ni verificar en un dispositivo. El [run 39193984202 de GitHub Actions](https://github.com/gugasito/himnario-mackenna/actions/runs/39193984202) completó validaciones, build Android y build iOS Simulator, y adjuntó los cinco assets a la [release v0.1.0-rc.1](https://github.com/gugasito/himnario-mackenna/releases/tag/v0.1.0-rc.1). Se comprobaron los checksums y que las tres aplicaciones incluyan el catálogo de 385 himnos. Las pruebas en dispositivos físicos siguen pendientes.

Los cambios específicos de plataforma deben limitarse a funciones que lo requieran. Compartir la interfaz reduce duplicación, pero cada plataforma requiere pruebas propias de navegación, permisos, áreas seguras, almacenamiento y compilación/firma. Una prueba en navegador no demuestra que la aplicación nativa compile.

## Requisitos nativos

Para ejecutar en dispositivos se necesitan Android Studio y el SDK Android; para iOS, macOS con Xcode. Sigue los requisitos vigentes de [configuración de entorno de Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup). La release enlazada arriba ofrece APK/AAB Android y la app iOS Simulator empaquetada. Las pruebas de instalación y funcionamiento en dispositivos Android e iOS físicos siguen pendientes.

El catálogo se incluye en la aplicación para lectura y búsqueda sin conexión. Preferencias y favoritos se guardan localmente con Capacitor Preferences. El alcance inicial no incluye servidor, autenticación ni sincronización entre dispositivos.

Al retomar trabajo en una sesión nueva, lee primero `AGENTS.md` y los documentos de `docs/`; ahí constan las decisiones y límites del proyecto. Comprueba después el estado del árbol de trabajo y define el alcance antes de tocar archivos compartidos.
