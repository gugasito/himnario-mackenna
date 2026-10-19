import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { arrowBack, heart, heartOutline, removeOutline, addOutline, arrowForward, alertCircleOutline } from 'ionicons/icons';
import { HymnalService } from '../core/hymnal.service';
import { PreferencesService } from '../core/preferences.service';

@Component({ selector: 'app-reader-page', standalone: true, imports: [RouterLink, IonIcon], template: `
  @if (hymn()) {
    <article class="reader-page" [style.--reader-font-size.px]="preferences.value().fontSize" [style.--reader-font-family]="preferences.readingFontFamily()">
      <header class="reader-toolbar"><a routerLink="/himnos" class="icon-button" aria-label="Volver al catálogo"><ion-icon name="arrow-back"></ion-icon></a><span class="reader-toolbar-label">LECTURA</span><div class="reader-tools"><button class="icon-button" (click)="changeSize(-1)" [disabled]="preferences.value().fontSize <= 22" aria-label="Reducir tamaño de letra"><ion-icon name="remove-outline"></ion-icon></button><button class="icon-button" (click)="changeSize(1)" [disabled]="preferences.value().fontSize >= 34" aria-label="Aumentar tamaño de letra"><ion-icon name="add-outline"></ion-icon></button><button class="icon-button favorite-toggle" [class.is-favorite]="isFavorite()" (click)="toggleFavorite()" [attr.aria-label]="isFavorite() ? 'Quitar de favoritos' : 'Guardar en favoritos'" [attr.aria-pressed]="isFavorite()"><ion-icon [name]="isFavorite() ? 'heart' : 'heart-outline'"></ion-icon></button></div></header>
      <div class="reader-content"><div class="reader-number">HIMNO {{ hymn()!.number }}</div><h1>{{ hymn()!.title || 'Himno ' + hymn()!.number }}</h1><div class="reader-rule"><span></span> ✦ <span></span></div>
        @if (hymn()!.verses.length) { @for (verse of hymn()!.verses; track $index) { <section class="stanza" [class.chorus]="verse.kind === 'chorus'"><span class="stanza-label">{{ verse.kind === 'chorus' ? 'CORO' : 'ESTROFA ' + verseNumber($index) }}</span><div class="stanza-lines">@for (line of verse.lines; track $index) { <p>{{ line }}</p> }</div></section> } }
        @else { <div class="reader-draft"><span class="draft-mark">✦</span><p>La letra de este himno aún no está disponible en la edición digital.</p><small>Consulta la fuente impresa para la versión completa.</small></div> }
        <small class="source-page">Página {{ hymn()!.sourcePage }} de la fuente</small>
      </div>
      <footer class="reader-pagination"><button class="page-turn" (click)="move(-1)" [disabled]="!previous()"><span>← Anterior</span><small>{{ previous()?.number ?? '—' }}</small></button><button class="page-turn next" (click)="move(1)" [disabled]="!next()"><span>Siguiente →</span><small>{{ next()?.number ?? '—' }}</small></button></footer>
    </article>
  } @else { <section class="state-panel error-panel invalid-hymn" role="alert"><div class="state-icon"><ion-icon name="alert-circle-outline"></ion-icon></div><h1>Este himno no está disponible</h1><p>El número solicitado no existe en el catálogo actual.</p><a routerLink="/himnos" class="button button-primary">Volver al himnario</a></section> }
` })
export class ReaderPageComponent {
  readonly hymnal = inject(HymnalService);
  readonly preferences = inject(PreferencesService);
  readonly id = signal('');
  readonly hymn = signal(this.hymnal.find(this.id()));
  private readonly router = inject(Router);
  constructor(route: ActivatedRoute) {
    addIcons({ arrowBack, heart, heartOutline, removeOutline, addOutline, arrowForward, alertCircleOutline });
    route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      this.id.set(id);
      this.hymn.set(this.hymnal.find(id));
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (this.hymn()) void this.preferences.remember(id);
    });
    effect(() => this.hymn.set(this.hymnal.find(this.id())));
  }
  isFavorite(): boolean { return this.preferences.value().favorites.includes(this.id()); }
  async toggleFavorite(): Promise<void> { await this.preferences.toggleFavorite(this.id()); }
  async changeSize(amount: number): Promise<void> { await this.preferences.patch({ fontSize: Math.min(34, Math.max(22, this.preferences.value().fontSize + amount)) }); }
  previous() { const list = this.hymnal.hymns(); const index = list.findIndex((item) => item.id === this.id()); return index > 0 ? list[index - 1] : undefined; }
  next() { const list = this.hymnal.hymns(); const index = list.findIndex((item) => item.id === this.id()); return index >= 0 ? list[index + 1] : undefined; }
  move(direction: -1 | 1): void { const hymn = direction < 0 ? this.previous() : this.next(); if (hymn) void this.router.navigate(['/himno', hymn.id]); }
  verseNumber(index: number): number { return this.hymnal.find(this.id())?.verses.slice(0, index + 1).filter((verse) => verse.kind === 'verse').length ?? index + 1; }
}
