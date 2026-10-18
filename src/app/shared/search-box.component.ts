import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/ion-icon';
import { addIcons } from 'ionicons';
import { searchOutline, closeCircle } from 'ionicons/icons';

@Component({ selector: 'app-search-box', standalone: true, imports: [FormsModule, IonIcon], template: `
    <div class="search-box" role="search"><ion-icon name="search-outline" aria-hidden="true"></ion-icon><input [ngModel]="value()" (ngModelChange)="valueChange.emit($event)" type="search" inputmode="search" autocomplete="off" aria-label="Buscar himnos por número o letra" placeholder="Número, título o una frase…" /><button type="button" class="clear-search" [class.visible]="!!value()" aria-label="Borrar búsqueda" (click)="valueChange.emit('')"><ion-icon name="close-circle" aria-hidden="true"></ion-icon></button></div>
` })
export class SearchBoxComponent {
  readonly value = input('');
  readonly valueChange = output<string>();
  constructor() { addIcons({ searchOutline, closeCircle }); }
}
