import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { Hymn, HymnalCatalog } from './hymn.model';

export type CatalogStatus = 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class HymnalService {
  readonly hymns = signal<readonly Hymn[]>([]);
  readonly status = signal<CatalogStatus>('loading');
  readonly error = signal('');
  readonly sourceUrl = signal('');

  constructor(private readonly http: HttpClient) {}

  async load(): Promise<void> {
    this.status.set('loading');
    this.error.set('');
    try {
      const catalog = await firstValueFrom(this.http.get<HymnalCatalog>('/data/hymns.json'));
      if (catalog.version !== 1 || !Array.isArray(catalog.hymns)) throw new Error('El catálogo no tiene el formato esperado.');
      this.hymns.set([...catalog.hymns].sort(compareHymnNumbers));
      this.sourceUrl.set(catalog.source.url);
      this.status.set('ready');
    } catch {
      this.error.set('No pudimos abrir el catálogo. Intenta cargarlo nuevamente.');
      this.status.set('error');
    }
  }

  find(id: string): Hymn | undefined { return this.hymns().find((hymn) => hymn.id === id); }
}

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
}

export function filterHymns(hymns: readonly Hymn[], query: string): Hymn[] {
  const term = normalizeSearch(query);
  if (!term) return [...hymns];
  const compact = term.replace(/[\s.-]/g, '');
  const numberQuery = /^(\d+)([a-z])?$/.exec(compact);
  if (numberQuery) {
    const [, digits, variant] = numberQuery;
    return hymns.filter((hymn) => {
      const number = normalizeSearch(hymn.number).replace(/[\s.-]/g, '');
      if (variant) return number.startsWith(`${digits}${variant}`);
      return (hymn.number.match(/\d+/g) ?? []).some((part) => part === digits);
    });
  }
  const results = hymns.filter((hymn) => {
    const text = normalizeSearch(`${hymn.title} ${hymn.verses.flatMap((verse) => verse.lines).join(' ')}`);
    return text.includes(term);
  });
  return results;
}

export function compareHymnNumbers(a: Hymn, b: Hymn): number {
  const numA = Number(a.number.match(/\d+/)?.[0] ?? 0);
  const numB = Number(b.number.match(/\d+/)?.[0] ?? 0);
  if (numA !== numB) return numA - numB;
  return a.number.localeCompare(b.number, 'es', { numeric: true });
}
