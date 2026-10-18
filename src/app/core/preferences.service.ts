import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type ThemeChoice = 'system' | 'light' | 'dark';
export interface UserPreferences {
  readonly favorites: readonly string[];
  readonly recent: readonly string[];
  readonly fontSize: number;
  readonly theme: ThemeChoice;
}

const DEFAULTS: UserPreferences = { favorites: [], recent: [], fontSize: 24, theme: 'system' };

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly value = signal<UserPreferences>(DEFAULTS);
  readonly persistenceWarning = signal(false);
  private readonly systemTheme = matchMedia('(prefers-color-scheme: dark)');
  private readonly onSystemThemeChange = (): void => { if (this.value().theme === 'system') this.applyTheme(); };

  constructor() { this.systemTheme.addEventListener('change', this.onSystemThemeChange); }

  async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: 'himnario.preferences.v1' });
      if (value) {
        const saved = JSON.parse(value) as Partial<UserPreferences>;
        this.value.set({ ...DEFAULTS, ...saved, favorites: Array.isArray(saved.favorites) ? saved.favorites : [], recent: Array.isArray(saved.recent) ? saved.recent : [] });
      }
    } catch { this.persistenceWarning.set(true); }
    this.applyTheme();
  }

  async patch(patch: Partial<UserPreferences>): Promise<void> {
    this.value.update((current) => ({ ...current, ...patch }));
    this.applyTheme();
    try { await Preferences.set({ key: 'himnario.preferences.v1', value: JSON.stringify(this.value()) }); }
    catch { this.persistenceWarning.set(true); }
  }

  async toggleFavorite(id: string): Promise<void> {
    const current = this.value().favorites;
    await this.patch({ favorites: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
  }

  async remember(id: string): Promise<void> {
    await this.patch({ recent: [id, ...this.value().recent.filter((item) => item !== id)].slice(0, 6) });
  }

  private applyTheme(): void {
    const choice = this.value().theme;
    const dark = choice === 'dark' || (choice === 'system' && this.systemTheme.matches);
    document.documentElement.classList.toggle('theme-dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }
}
