import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { sunnyOutline, moonOutline, phonePortraitOutline, textOutline, removeOutline, addOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { PreferencesService, ReadingFont, ThemeChoice } from '../core/preferences.service';
import { HymnalService } from '../core/hymnal.service';

@Component({ selector: 'app-settings-page', standalone: true, imports: [IonIcon], template: `
  <section class="settings-page page-wrap"><div class="page-heading"><span class="eyebrow">A TU MANERA</span><h1>Ajustes</h1><p>Haz que la lectura se sienta cómoda.</p></div>
    <section class="settings-section"><div class="settings-title"><span class="settings-icon"><ion-icon name="text-outline"></ion-icon></span><div><h2>Tamaño de letra</h2><p>Actual: {{ preferences.value().fontSize }} px</p></div></div><div class="font-control"><button class="icon-button" (click)="changeSize(-1)" [disabled]="preferences.value().fontSize <= 22" aria-label="Reducir tamaño de letra"><ion-icon name="remove-outline"></ion-icon></button><div class="font-preview" [style.font-size.px]="preferences.value().fontSize" [style.font-family]="preferences.readingFontFamily()">Aa</div><button class="icon-button" (click)="changeSize(1)" [disabled]="preferences.value().fontSize >= 34" aria-label="Aumentar tamaño de letra"><ion-icon name="add-outline"></ion-icon></button></div><input aria-label="Tamaño de letra" type="range" min="22" max="34" step="1" [value]="preferences.value().fontSize" (input)="setFontSize($event)" /></section>
    <section class="settings-section"><h2>Tipografía de lectura</h2><p class="settings-description">Elige el estilo de letra para los himnos.</p><div class="reading-font-options" role="group" aria-label="Tipografía de lectura">@for (option of readingFonts; track option.value) { <button type="button" class="reading-font-option" [class.selected]="preferences.value().readingFont === option.value" [attr.aria-pressed]="preferences.value().readingFont === option.value" (click)="setReadingFont(option.value)"><span>{{ option.label }}</span><span class="font-option-preview" [style.font-family]="preferences.readingFontFamily(option.value)">Aa</span></button> }</div><p class="settings-description font-source-note">Se usan fuentes disponibles en el dispositivo; no se descargan fuentes.</p></section>
    <section class="settings-section"><h2>Apariencia</h2><p class="settings-description">Elige cómo quieres ver el himnario.</p><div class="theme-options" role="group" aria-label="Tema de la aplicación">@for (option of themes; track option.value) { <button class="theme-option" [class.selected]="preferences.value().theme === option.value" [attr.aria-pressed]="preferences.value().theme === option.value" (click)="setTheme(option.value)"><ion-icon [name]="option.icon"></ion-icon><span>{{ option.label }}</span>@if (preferences.value().theme === option.value) { <ion-icon class="theme-check" name="checkmark-circle-outline"></ion-icon> }</button> }</div></section>
    <section class="settings-about"><span class="eyebrow">SOBRE ESTE HIMNARIO</span><h2>Una colección para nuestra comunidad.</h2><p>La edición digital se prepara a partir de la fuente impresa de la iglesia. Algunas letras aún están pendientes de revisión editorial. La aplicación móvil guarda el catálogo para leer sin conexión.</p><a [href]="hymnal.sourceUrl()" target="_blank" rel="noreferrer">Ver fuente del catálogo <span aria-hidden="true">↗</span></a></section>
    @if (preferences.persistenceWarning()) { <p class="persistence-note" role="status"><ion-icon name="alert-circle-outline"></ion-icon> No pudimos guardar los últimos cambios en este dispositivo.</p> }
    <footer class="settings-footer">IEUCB Mackenna <span>·</span> Himnario digital</footer>
  </section>
` })
export class SettingsPageComponent {
  readonly preferences = inject(PreferencesService);
  readonly hymnal = inject(HymnalService);
  readonly readingFonts: { value: ReadingFont; label: string }[] = [
    { value: 'system', label: 'Sistema (sin remates)' },
    { value: 'serif', label: 'Clásica (con remates)' }
  ];
  readonly themes: { value: ThemeChoice; label: string; icon: string }[] = [
    { value: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
    { value: 'light', label: 'Claro', icon: 'sunny-outline' },
    { value: 'dark', label: 'Oscuro', icon: 'moon-outline' }
  ];
  constructor() { addIcons({ sunnyOutline, moonOutline, phonePortraitOutline, textOutline, removeOutline, addOutline, checkmarkCircleOutline, alertCircleOutline }); }
  async changeSize(amount: number): Promise<void> { await this.preferences.patch({ fontSize: Math.min(34, Math.max(22, this.preferences.value().fontSize + amount)) }); }
  async setFontSize(event: Event): Promise<void> { await this.preferences.patch({ fontSize: Number((event.target as HTMLInputElement).value) }); }
  async setReadingFont(readingFont: ReadingFont): Promise<void> { await this.preferences.patch({ readingFont }); }
  async setTheme(theme: ThemeChoice): Promise<void> { await this.preferences.patch({ theme }); }
}
