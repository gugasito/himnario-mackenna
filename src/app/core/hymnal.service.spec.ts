import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Hymn, HymnalCatalog } from './hymn.model';
import { filterHymns } from './hymnal.service';

const hymns: Hymn[] = [
  { id: '10-a', number: '10-A', title: '¡Dios es fiel!', verses: [{ kind: 'verse', lines: ['Cantaré su amor'] }], sourcePage: 20 },
  { id: '10-b', number: '10-B', title: 'Alabemos al Señor', verses: [{ kind: 'verse', lines: ['Gloria a Dios'] }], sourcePage: 21 },
  { id: '104-a-y-b', number: '104 A y B', title: '', verses: [], sourcePage: 30 },
  { id: '20', number: '20', title: 'Esperanza', verses: [{ kind: 'chorus', lines: ['Jesús es mi esperanza'] }], sourcePage: 40 }
];
const actualCatalog = JSON.parse(readFileSync('public/data/hymns.json', 'utf8')) as HymnalCatalog;

describe('filterHymns', () => {
  it('matches number variants regardless of spaces and punctuation', () => {
    expect(filterHymns(hymns, '10a').map((hymn) => hymn.id)).toEqual(['10-a']);
    expect(filterHymns(hymns, '10 B').map((hymn) => hymn.id)).toEqual(['10-b']);
    expect(filterHymns([...hymns, { ...hymns[0], id: '310', number: '310', title: 'Otro' }], '10 A').map((hymn) => hymn.id)).toEqual(['10-a']);
    expect(filterHymns(hymns, '104a').map((hymn) => hymn.id)).toEqual(['104-a-y-b']);
  });

  it('searches titles and lyrics without case or accent differences', () => {
    expect(filterHymns(hymns, 'DIOS ES FIEL').map((hymn) => hymn.id)).toContain('10-a');
    expect(filterHymns(hymns, 'jesus es mi ESPERANZA').map((hymn) => hymn.id)).toContain('20');
  });

  it('matches the real catalog variant and number-only entries', () => {
    expect(filterHymns(actualCatalog.hymns, '10a').map((hymn) => hymn.id)).toEqual(['10-a']);
    expect(filterHymns(actualCatalog.hymns, '104a').map((hymn) => hymn.id)).toEqual(['104-a-y-b']);
    expect(filterHymns(actualCatalog.hymns, '288').some((hymn) => hymn.number.includes('289'))).toBe(true);
  });
});
