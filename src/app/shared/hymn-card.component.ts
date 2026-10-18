import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/ion-icon';
import { chevronForward } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import type { Hymn } from '../core/hymn.model';

@Component({ selector: 'app-hymn-card', standalone: true, imports: [RouterLink, IonIcon], template: `
  <a class="hymn-card" [routerLink]="['/himno', hymn().id]" [attr.aria-label]="'Himno ' + hymn().number + ': ' + hymn().title">
    <span class="hymn-number">{{ hymn().number }}</span><span class="hymn-card-copy"><strong>{{ hymn().title || 'Himno ' + hymn().number }}</strong><small>{{ preview() }}</small></span><ion-icon name="chevron-forward" aria-hidden="true"></ion-icon>
  </a>
` })
export class HymnCardComponent {
  readonly hymn = input.required<Hymn>();
  constructor() { addIcons({ chevronForward }); }
  preview(): string { return this.hymn().verses[0]?.lines.slice(0, 2).join(' ') ?? 'Letra pendiente de revisión'; }
}
