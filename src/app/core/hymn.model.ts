export interface HymnVerse {
  readonly kind: 'verse' | 'chorus';
  readonly lines: readonly string[];
}

export interface Hymn {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly verses: readonly HymnVerse[];
  /** Physical, one-based page in the source PDF. */
  readonly sourcePage: number;
}

export interface HymnalCatalog {
  readonly version: 1;
  readonly source: {
    readonly name: string;
    readonly url: string;
    readonly sha256: string;
    readonly importedAt: string;
    readonly reviewRequired: true;
  };
  readonly hymns: readonly Hymn[];
}
