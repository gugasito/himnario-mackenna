# Himnario Mackenna

Aplicación móvil independiente para consultar el himnario de la Iglesia IEUCB Mackenna. Está en preparación: el catálogo extraído es un borrador que requiere revisión editorial. La aplicación está pensada para leer y buscar sin conexión; no requiere cuenta ni servidor.

Repositorio: [github.com/gugasito/himnario-mackenna](https://github.com/gugasito/himnario-mackenna). La imagen muestra el prototipo en navegador; no es una captura de una aplicación nativa distribuida.

[![Vista previa de las pantallas](docs/screens/pantallas.png)](docs/pantallas.md)

Ver la [galería de pantallas](docs/pantallas.md).

## Desarrollo

Requisitos: Node.js 24.14.0 (`.nvmrc`) y npm.

```sh
npm ci
npm start
```

La aplicación queda disponible en `http://127.0.0.1:4200`. Para compilar y ejecutar las comprobaciones:

```sh
npm run build
npm test
npm run check
npm run catalog:check
npm run catalog:test
```

Consulta [Desarrollo](docs/desarrollo.md) para sincronizar y abrir los proyectos nativos.

## Contenido y decisiones

- [Decisión técnica](docs/decision-tecnica.md): elección de Angular, Ionic y Capacitor.
- [Diseño](docs/diseno.md): navegación, pantallas y criterios de accesibilidad.
- [Hoja de ruta](docs/hoja-de-ruta.md): trabajo pendiente antes de una versión utilizable.
- [Catálogo](docs/catalogo.md): contrato y procedencia de los himnos.

La fuente principal es el PDF de `data/source/`; el APK antiguo solo sirve para comparación. La extracción no sustituye la revisión de las letras. El proyecto de la web de la iglesia es fuente de solo lectura.

## Estado y verificación

La comprobación web (`npm run check`) pasó; `npm test` pasó con 5 pruebas. La validación del catálogo pasó con 385 himnos y 1.642 bloques de estrofa/coro; las 8 pruebas del importador también pasaron. La revisión visual en navegador cubrió búsqueda, variantes, lectura, favoritos, ajustes, persistencia y pantallas móviles. El catálogo aún requiere revisión editorial: el índice y los encabezados de las páginas del PDF difieren en algunos títulos, y falta el título de 261-B; los detalles están en [Catálogo](docs/catalogo.md).

La sincronización de Capacitor para Android e iOS y la comprobación de privacidad/proyecto iOS pasaron. La compilación nativa y las pruebas en dispositivos siguen pendientes. [Muestra de pantallas](docs/diseno.md#pantallas-de-referencia).
