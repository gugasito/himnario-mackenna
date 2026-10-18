# Decisión técnica

Para esta aplicación se eligió Angular standalone 21.2.25, Ionic 9.0.8 y Capacitor 8.5.3, con TypeScript y npm. La decisión busca aprovechar la experiencia y el ecosistema Angular disponibles, reutilizar la interfaz entre Android e iOS y mantener el catálogo local para uso sin conexión.

| Alternativa | Consideración para este proyecto |
| --- | --- |
| Angular + Ionic + Capacitor | Elegida: conserva Angular y permite empaquetar una aplicación web compartida en Android e iOS. |
| React Native + Expo | Buena opción multiplataforma, pero implica adoptar React y su modelo de componentes. |
| Flutter | Interfaz multiplataforma consistente, pero requiere adoptar Dart y Flutter. |
| Kotlin + Swift nativos | Acceso directo a cada plataforma, a cambio de mantener dos aplicaciones. |

La decisión es contextual; no afirma superioridad de rendimiento ni elimina la necesidad de pruebas nativas. Referencias: [Ionic con Angular](https://ionicframework.com/docs/angular/overview), [Capacitor](https://capacitorjs.com/docs), [React Native](https://reactnative.dev/docs/environment-setup) y [Flutter](https://flutter.dev/).
