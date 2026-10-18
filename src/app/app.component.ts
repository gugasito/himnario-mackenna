import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { bookOutline, heart, heartOutline, home, homeOutline, listOutline, settings, settingsOutline, searchOutline, chevronForward, arrowBack, closeCircle, sunnyOutline, moonOutline, phonePortraitOutline, alertCircleOutline, refreshOutline, textOutline, removeOutline, addOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { HymnalService } from './core/hymnal.service';
import { PreferencesService } from './core/preferences.service';

@Component({
  selector: 'app-root', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IonIcon],
  template: `
    <div class="app-frame">
      <header class="topbar">
        <a class="brand-lockup" routerLink="/" aria-label="Himnario Mackenna, inicio">
          <img src="/brand/logo_mackenna_blanco.svg" alt="Iglesia IEUCB Mackenna" />
          <span><strong>Himnario</strong><small>IEUCB Mackenna</small></span>
        </a>
        <span class="offline-note">Un canto para cada día</span>
      </header>
      <main id="main-content" class="main-content">
        @if (hymnal.status() === 'loading') {
          <section class="state-panel loading-panel" role="status" aria-live="polite"><span class="loader" aria-hidden="true"></span><p>Preparando el himnario…</p></section>
        } @else if (hymnal.status() === 'error') {
          <section class="state-panel error-panel" role="alert"><div class="state-icon"><ion-icon name="alert-circle-outline"></ion-icon></div><h1>No pudimos abrir el himnario</h1><p>{{ hymnal.error() }}</p><button class="button button-primary" (click)="retry()"><ion-icon name="refresh-outline"></ion-icon> Intentar de nuevo</button></section>
        } @else {
          <router-outlet (activate)="focusPageHeading()" />
        }
      </main>
      @if (hymnal.status() === 'ready' && !isReader()) {
        <nav class="tabbar" aria-label="Navegación principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" aria-label="Inicio"><ion-icon name="home-outline"></ion-icon><span>Inicio</span></a>
          <a routerLink="/himnos" routerLinkActive="active" aria-label="Himnos"><ion-icon name="book-outline"></ion-icon><span>Himnos</span></a>
          <a routerLink="/favoritos" routerLinkActive="active" aria-label="Favoritos"><ion-icon name="heart-outline"></ion-icon><span>Favoritos</span></a>
          <a routerLink="/ajustes" routerLinkActive="active" aria-label="Ajustes"><ion-icon name="settings-outline"></ion-icon><span>Ajustes</span></a>
        </nav>
      }
    </div>
  `
})
export class AppComponent implements OnInit {
  readonly hymnal = inject(HymnalService);
  readonly preferences = inject(PreferencesService);
  private readonly router = inject(Router);

  constructor() {
    addIcons({ bookOutline, heart, heartOutline, home, homeOutline, listOutline, settings, settingsOutline, searchOutline, chevronForward, arrowBack, closeCircle, sunnyOutline, moonOutline, phonePortraitOutline, alertCircleOutline, refreshOutline, textOutline, removeOutline, addOutline, checkmarkCircleOutline });
  }

  ngOnInit(): void { void this.initialize(); }
  isReader(): boolean { return this.router.url.startsWith('/himno/'); }
  focusPageHeading(): void {
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('#main-content h1');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
  }
  async retry(): Promise<void> { await this.hymnal.load(); }
  private async initialize(): Promise<void> { await this.preferences.load(); await this.hymnal.load(); }
}
