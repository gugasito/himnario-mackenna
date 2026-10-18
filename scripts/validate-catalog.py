#!/usr/bin/env python3
"""Cross-check generated JSON against source PDF, its numbered contents, and hash."""
import importlib.util, json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'data/source/himnario.pdf'; JSON_PATH=ROOT/'public/data/hymns.json'
spec=importlib.util.spec_from_file_location('import_hymns',ROOT/'scripts/import-hymns.py')
imp=importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
actual=json.loads(JSON_PATH.read_text(encoding='utf8'))
expected,anomalies,pages,toc,title_differences=imp.build_catalog(PDF)
assert actual['version']==1 and actual['source']['reviewRequired'] is True
assert actual['source']['sha256']==hashlib.sha256(PDF.read_bytes()).hexdigest()
actual_check=json.loads(json.dumps(actual)); actual_check.get('source',{}).pop('importedAt',None)
expected_check=json.loads(json.dumps(expected)); expected_check.get('source',{}).pop('importedAt',None)
assert actual_check==expected_check, 'generated catalog differs from current source PDF; run python3 scripts/import-hymns.py'
ids=[h['id'] for h in actual['hymns']]
assert len(ids)==len(set(ids)), 'duplicate ids'
assert len(toc)==len(actual['hymns']), f'contents list has {len(toc)} entries; catalog has {len(actual["hymns"])}'
assert [imp.hymn_id(n) for n in toc]==ids, 'catalog order or displayed number labels differ from contents list'
for h in actual['hymns']:
    assert h['id']==imp.hymn_id(h['number'])
    assert isinstance(h['sourcePage'],int) and imp.LYRIC_FIRST_PAGE<=h['sourcePage']<=imp.LYRIC_LAST_PAGE
    assert isinstance(h['title'],str) and h['verses']
    assert all(v['kind'] in ('verse','chorus') and v['lines'] and all(x.strip() for x in v['lines']) for v in h['verses'])
assert not anomalies, '\n'.join(anomalies)
print(f'Valid and fresh catalog: {len(actual["hymns"])} hymns match {len(toc)} numbered contents entries across {pages} physical pages; {sum(len(h["verses"]) for h in actual["hymns"])} stanza blocks; SHA-256 matches.')
for difference in title_differences:
    print(f'Title differs between lyric-page heading and contents for {difference["number"]}: {difference["printedTitle"]!r} / {difference["contentsTitle"]!r}')
untitled=[h['number'] for h in actual['hymns'] if not h['title'].strip()]
if untitled: print('Source titles absent (retained empty): '+', '.join(untitled))
