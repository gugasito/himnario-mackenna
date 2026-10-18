import type { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home.page';
import { CatalogPageComponent } from './pages/catalog.page';
import { ReaderPageComponent } from './pages/reader.page';
import { FavoritesPageComponent } from './pages/favorites.page';
import { SettingsPageComponent } from './pages/settings.page';

export const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Inicio · Himnario Mackenna' },
  { path: 'himnos', component: CatalogPageComponent, title: 'Himnos · Himnario Mackenna' },
  { path: 'himno/:id', component: ReaderPageComponent, title: 'Lectura · Himnario Mackenna' },
  { path: 'favoritos', component: FavoritesPageComponent, title: 'Favoritos · Himnario Mackenna' },
  { path: 'ajustes', component: SettingsPageComponent, title: 'Ajustes · Himnario Mackenna' },
  { path: '**', redirectTo: '' }
];
