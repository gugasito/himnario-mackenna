import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { heartOutline, bookOutline } from 'ionicons/icons';
import { HymnalService } from '../core/hymnal.service';
import { PreferencesService } from '../core/preferences.service';
import { HymnCardComponent } from '../shared/hymn-card.component';

@Component({ selector: 'app-favorites-page', standalone: true, imports: [RouterLink, IonIcon, HymnCardComponent], template: `
  <section class="favorites-page page-wrap">
    <div class="page-heading"><span class="eyebrow">TU COLECCIÓN</span><h1>Favoritos</h1><p>Los himnos que quieres tener cerca.</p></div>
    @if (favorites().length) { <p class="result-count">{{ favorites().length }} {{ favorites().length === 1 ? 'guardado' : 'guardados' }}</p><div class="hymn-list">@for (hymn of favorites(); track hymn.id) { <app-hymn-card [hymn]="hymn" /> }</div> }
    @else { <div class="empty-state"><span class="empty-mark"><ion-icon name="heart-outline"></ion-icon></span><h2>Aún no tienes favoritos</h2><p>Guarda los himnos que quieras volver a encontrar. Toca el corazón mientras lees.</p><a routerLink="/himnos" class="button button-soft"><ion-icon name="book-outline"></ion-icon> Explorar himnos</a></div> }
  </section>
` })
export class FavoritesPageComponent {
  private readonly hymnal = inject(HymnalService);
  private readonly preferences = inject(PreferencesService);
  readonly favorites = computed(() => this.preferences.value().favorites.map((id) => this.hymnal.find(id)).filter((hymn) => !!hymn));
  constructor() { addIcons({ heartOutline, bookOutline }); }
}
