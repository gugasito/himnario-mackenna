import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HymnalService, filterHymns } from '../core/hymnal.service';
import { HymnCardComponent } from '../shared/hymn-card.component';
import { SearchBoxComponent } from '../shared/search-box.component';

@Component({ selector: 'app-catalog-page', standalone: true, imports: [HymnCardComponent, SearchBoxComponent], template: `
  <section class="catalog-page page-wrap">
    <div class="page-heading"><span class="eyebrow">EL CATÁLOGO</span><h1>Himnos</h1><p>Palabras para recordar, compartir y cantar.</p></div>
    <app-search-box [value]="query()" (valueChange)="query.set($event)" />
    <p class="result-count" aria-live="polite">{{ results().length }} {{ results().length === 1 ? 'himno' : 'himnos' }}{{ query() ? (results().length === 1 ? ' encontrado' : ' encontrados') : '' }}</p>
    @if (results().length) { <div class="hymn-list">@for (hymn of results(); track hymn.id) { <app-hymn-card [hymn]="hymn" /> }</div> }
    @else { <div class="empty-state"><span class="empty-mark">⌕</span><h2>No encontramos ese himno</h2><p>Prueba con otro número, una palabra del título o una frase de la letra.</p><button class="button button-soft" (click)="query.set('')">Ver todos los himnos</button></div> }
  </section>
` })
export class CatalogPageComponent {
  readonly hymnal = inject(HymnalService);
  readonly query = signal('');
  readonly results = computed(() => filterHymns(this.hymnal.hymns(), this.query()));
  constructor(route: ActivatedRoute) { route.queryParamMap.subscribe((params) => this.query.set(params.get('q') ?? '')); }
}
