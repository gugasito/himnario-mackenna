// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
const preferencesMock = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn()
}));
vi.mock('@capacitor/preferences', () => ({ Preferences: preferencesMock }));
import { PreferencesService } from './preferences.service';

describe('PreferencesService', () => {
  let stored: string | null;
  beforeEach(() => {
    stored = null;
    preferencesMock.get.mockImplementation(async () => ({ key: 'himnario.preferences.v1', value: stored }));
    preferencesMock.set.mockImplementation(async ({ value }) => { stored = value; });
  });

  it('persists favorites, reading size, theme and recent hymns across service instances', async () => {
    const first = new PreferencesService();
    await first.load();
    await first.toggleFavorite('10-a');
    await first.patch({ fontSize: 30, theme: 'dark', readingFont: 'serif' });
    await first.remember('10-a');

    const second = new PreferencesService();
    await second.load();
    expect(second.value()).toEqual({ favorites: ['10-a'], recent: ['10-a'], fontSize: 30, theme: 'dark', readingFont: 'serif' });
    expect(second.readingFontFamily()).toBe('Georgia, "Times New Roman", serif');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
  });

  it('keeps usable defaults and reports persistence failures', async () => {
    preferencesMock.set.mockRejectedValueOnce(new Error('unavailable'));
    const service = new PreferencesService();
    await service.load();
    await service.patch({ fontSize: 26 });
    expect(service.value().fontSize).toBe(26);
    expect(service.persistenceWarning()).toBe(true);
  });

  it('migrates stored preferences without a reading font to the system font', async () => {
    stored = JSON.stringify({ favorites: ['10-a'], recent: ['10-a'], fontSize: 28, theme: 'light' });
    const service = new PreferencesService();
    await service.load();
    expect(service.value().readingFont).toBe('system');
    expect(service.readingFontFamily()).toBe('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif');
  });

  it('replaces an unknown stored reading font with the system font', async () => {
    stored = JSON.stringify({ readingFont: 'fantasy' });
    const service = new PreferencesService();
    await service.load();
    expect(service.value().readingFont).toBe('system');
    expect(service.readingFontFamily()).toBe('-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif');
  });
});
