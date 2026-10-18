import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { arrowForward, bookOutline, heartOutline, searchOutline, sparklesOutline } from 'ionicons/icons';
import { HymnalService } from '../core/hymnal.service';
import { PreferencesService } from '../core/preferences.service';
import type { Hymn } from '../core/hymn.model';
import { HymnCardComponent } from '../shared/hymn-card.component';
import { SearchBoxComponent } from '../shared/search-box.component';

@Component({ selector: 'app-home-page', standalone: true, imports: [RouterLink, IonIcon, HymnCardComponent, SearchBoxComponent], template: `
  <section class="home-page page-wrap">
    <div class="home-welcome"><span class="eyebrow">IEUCB MACKENNA</span><h1>La fe también<br><em>se canta.</em></h1><p>Encuentra las palabras que acompañan tu camino.</p></div>
    <form class="home-search" aria-label="Buscar en el himnario" (submit)="search($event)"><app-search-box [value]="query" (valueChange)="query = $event" /><button class="home-search-submit" type="submit" aria-label="Buscar himnos"><ion-icon name="arrow-forward"></ion-icon></button></form>
    <div class="home-feature">
      <div class="feature-copy"><span class="feature-kicker"><ion-icon name="sparkles-outline"></ion-icon> PARA COMENZAR</span><h2>{{ featured?.title || 'Un himno para cada momento' }}</h2><p>{{ featured ? 'Himno ' + featured.number + ' · Abre el himnario y comienza a leer.' : 'Explora el catálogo y encuentra tu próximo himno.' }}</p><a [routerLink]="featured ? ['/himno', featured.id] : ['/himnos']" class="button button-cream">{{ preferences.value().recent.length ? 'Continuar lectura' : 'Leer himno' }} <ion-icon name="arrow-forward"></ion-icon></a></div>
      <div class="feature-art" aria-hidden="true"><div class="sun-disc"></div><div class="hill hill-back"></div><div class="hill hill-front"></div><span>♪</span></div>
    </div>
    <div class="quick-links"><a routerLink="/himnos"><span class="quick-icon"><ion-icon name="book-outline"></ion-icon></span><span><strong>Todos los himnos</strong><small>{{ hymnal.hymns().length }} en el catálogo</small></span><ion-icon class="quick-arrow" name="arrow-forward"></ion-icon></a><a routerLink="/favoritos"><span class="quick-icon"><ion-icon name="heart-outline"></ion-icon></span><span><strong>Tus favoritos</strong><small>{{ preferences.value().favorites.length }} {{ preferences.value().favorites.length === 1 ? 'guardado' : 'guardados' }}</small></span><ion-icon class="quick-arrow" name="arrow-forward"></ion-icon></a></div>
    @if (recent.length) { <section class="section-block"><div class="section-heading"><div><span class="eyebrow">A MANO</span><h2>Leídos hace poco</h2></div><a routerLink="/himnos" class="text-link">Ver todos</a></div><div class="hymn-list">@for (hymn of recent; track hymn.id) { <app-hymn-card [hymn]="hymn" /> }</div></section> }
    <p class="home-note">Hecho para acompañar cada encuentro de nuestra comunidad.</p>
  </section>
` })
export class HomePageComponent {
  readonly hymnal = inject(HymnalService);
  readonly preferences = inject(PreferencesService);
  private readonly router = inject(Router);
  query = '';
  constructor() { addIcons({ arrowForward, bookOutline, heartOutline, searchOutline, sparklesOutline }); }
  get featured(): Hymn | undefined { return this.hymnal.find(this.preferences.value().recent[0]) ?? this.hymnal.hymns()[0]; }
  get recent() { return this.preferences.value().recent.map((id) => this.hymnal.find(id)).filter((hymn) => !!hymn).slice(0, 3); }
  search(event: Event): void { event.preventDefault(); if (this.query.trim()) void this.router.navigate(['/himnos'], { queryParams: { q: this.query } }); else void this.router.navigate(['/himnos']); }
}
