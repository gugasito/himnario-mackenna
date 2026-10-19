# Versiones de prueba para Android e iOS

El workflow **Native release builds** se ejecuta al **publicar** una release con una etiqueta SemVer estricta, como `v0.1.0` o `v0.1.0-rc.1`. Las prereleases también se procesan al publicarlas; un borrador no inicia el flujo. Crear o subir solo una etiqueta no publica una release. La [release de prueba v0.1.0-rc.1](https://github.com/gugasito/himnario-mackenna/releases/tag/v0.1.0-rc.1) tiene los resultados del primer run completo: validación y builds pasaron en [GitHub Actions run 39193984202](https://github.com/gugasito/himnario-mackenna/actions/runs/39193984202), que luego adjuntó los assets.

El flujo manual `workflow_dispatch` acepta una etiqueta de versión SemVer y ejecuta los builds del commit de la rama seleccionada en **Run workflow**; no necesita que exista esa etiqueta en Git. Deja los resultados como artefactos de Actions y no crea ni publica una release. En GitHub, abre **Actions**, selecciona **Native release builds**, pulsa **Run workflow**, elige la rama, introduce una versión como `v0.1.0-rc.1` y ejecuta. Esta opción permite revisar una compilación antes de publicar una versión.

Cuando ambos builds terminen correctamente, la release recibirá estos archivos:

- `himnario-mackenna-android.apk` y `himnario-mackenna-android.aab` (Android, firmados con la clave de release del proyecto).
- `himnario-mackenna-ios-simulator.zip` (app `.app` ARM64 para iOS Simulator, sin firma).
- `SHA256SUMS` y `BUILD-INFO.txt` (checksums y datos de versión/build).

Los builds también se suben como artefactos de Actions por siete días. Si uno de los builds falla, no se adjunta un conjunto parcial a la release. Reintentar la ejecución puede reemplazar esos cinco assets con `--clobber`, sin reemplazar el resto de la release.

## Descarga y uso

- **APK:** permite instalar la compilación de prueba en Android mediante instalación manual. El AAB se conserva como paquete para una posible distribución futura; este flujo no publica en Google Play.
- **iOS Simulator:** descarga y descomprime el ZIP en un Mac con Xcode y un simulador ARM64 arrancado. El archivo contiene `App.app`; instálalo con `xcrun simctl install booted App.app`. Es una aplicación para simulador, no una aplicación de escritorio macOS ni un paquete instalable en un iPhone físico.

No hay una cuenta Apple Developer. Por eso este flujo no produce una IPA para dispositivos físicos. Para distribuir en un iPhone se necesitarán la cuenta, el certificado de firma y el perfil de aprovisionamiento apropiados; GitHub Actions no sustituye esos requisitos.

## Firma Android y credenciales

La clave Android de este proyecto corresponde a una identidad nueva, provisionalmente `org.ucbmackenna.himnario`. No se ha confirmado que pueda actualizar la antigua aplicación Android: la identidad de paquete y la clave de firma existentes aún deben verificarse por separado.

El workflow requiere los secretos `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD`. Se guardan en **Settings → Secrets and variables → Actions** del repositorio. La copia de respaldo de la clave se guarda de forma privada fuera del repositorio. No pongas la clave, contraseñas ni valores de secretos en Git, logs o artefactos. Si falta un secreto de firma, el build debe fallar; no se genera una variante de depuración como sustituto.

Los runners de Actions son efímeros: no son el respaldo de la clave. La firma hace que los artefactos identifiquen la aplicación, pero no significa que estén publicados en una tienda.

## Versiones y repetición

El nombre de versión nativo usa la parte numérica principal de la etiqueta (por ejemplo, `v0.1.0-rc.1` produce `0.1.0`); el código numérico es el número de ejecución de Actions. La etiqueta completa, incluida la prerelease, queda en `BUILD-INFO.txt`. Reintentar el mismo run conserva el número y puede repetir el mismo `versionCode` Android. Publicar una versión nueva inicia otro run.

Todos los jobs compilan el mismo commit identificado por SHA. En el flujo disparado por una release, antes de adjuntar archivos se comprueba que la etiqueta publicada apunta a ese commit. El workflow valida y prueba la aplicación antes de los builds nativos. El run exitoso enlazado arriba confirma el proceso completo; además, se verificaron los checksums y la presencia del catálogo de 385 himnos en los tres paquetes. Este proceso produce paquetes de prueba; no publica en tiendas. Las pruebas en dispositivos físicos siguen pendientes.
