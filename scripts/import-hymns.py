#!/usr/bin/env python3
"""Extract the PDF hymnal into a reproducible, review-required JSON catalog."""
import argparse, datetime, hashlib, json, os, re, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/source/himnario.pdf'
OUTPUT = ROOT / 'public/data/hymns.json'
URL = 'https://ucbmackenna.org/assets/himnario.pdf'
NUMBER_PATTERN = r'\d{1,3}(?:\s+y\s+\d{1,3}|\s*[-–]\s*[A-Za-z]|\s+[A-Za-z]\s+y\s+[A-Za-z])?'
HEADER = re.compile(r'^\s*(' + NUMBER_PATTERN + r')\s{1,}(\S.*)$')
BARE_VARIANT = re.compile(r'^\s*(\d{1,3}\s*[-–]\s*[A-Za-z])\s*$')
CHORUS = re.compile(r'^\s*(?:CORO|ESTRIBILLO)\s*:?\s*$', re.I)
LYRIC_FIRST_PAGE, LYRIC_LAST_PAGE = 14, 398
EXPECTED_PHYSICAL_PAGES = 413

def hymn_id(number):
    number = re.sub(r'\s*[-–]\s*', '-', number.strip())
    number = re.sub(r'\s+', '-', number)
    return number.lower()

def display_number(number):
    return re.sub(r'\s+', ' ', number.strip()).replace('–', '-')

def read_pdf(pdf):
    raw = subprocess.run(['pdftotext','-layout',str(pdf),'-'],check=True,stdout=subprocess.PIPE).stdout.decode('utf-8')
    return raw.split('\f')

def validate_layout(pages):
    physical_pages=len(pages)-1
    if physical_pages != EXPECTED_PHYSICAL_PAGES:
        raise ValueError(f'unsupported PDF layout: expected {EXPECTED_PHYSICAL_PAGES} physical pages, found {physical_pages}')
    last_header=parse_header(pages[LYRIC_LAST_PAGE-1].splitlines())
    if not last_header or hymn_id(last_header[1]) != '382':
        raise ValueError(f'unsupported PDF layout: expected hymn 382 on physical page {LYRIC_LAST_PAGE}')
    first_index=next((line.strip() for line in pages[LYRIC_LAST_PAGE].splitlines() if line.strip()),'')
    if first_index.upper() != 'INDICE ALFABETICO':
        raise ValueError(f'unsupported PDF layout: expected alphabetical index on physical page {LYRIC_LAST_PAGE+1}')

def parse_header(lines):
    for ix,line in enumerate(lines):
        if not line.strip(): continue
        m=HEADER.match(line)
        bare=BARE_VARIANT.match(line)
        if not m and not bare: return None
        number=display_number(m.group(1) if m else bare.group(1))
        title=m.group(2).strip() if m else ''
        # The explicit “104 A y B” is a single printed number/label, not title text.
        return ix,number,title
    return None

def title_continuation(lines, first_ix):
    i=first_ix+1
    # Only consume the contiguous heading line before the first blank paragraph boundary.
    title_line=lines[i].strip() if i<len(lines) else ''
    if title_line and re.fullmatch(r'[A-ZÁÉÍÓÚÜÑ0-9][A-ZÁÉÍÓÚÜÑ0-9\s.,;:!?¡¿()\[\]"“”\'’/\-]+',title_line):
        return i,lines[i].strip()
    return None,None

def append_blocks(hymn, body):
    # Blank lines delimit stanza blocks. A chorus label marks the next nonempty
    # block only; after its following blank boundary, stanzas return to verse.
    kind='verse'; pending_chorus=False; buf=[]
    def flush():
        nonlocal buf,kind,pending_chorus
        if buf:
            hymn['verses'].append({'kind':kind,'lines':buf})
            buf=[]
            if kind=='chorus': kind='verse'
    for line in body:
        if CHORUS.match(line):
            flush(); pending_chorus=True; continue
        if not line.strip():
            flush(); continue
        if pending_chorus:
            kind='chorus'; pending_chorus=False
        buf.append(line.strip())
    flush()

def toc_entries(pages):
    found=[]
    for raw in pages[2:13]:
        for line in raw.splitlines():
            if not re.search(r'\.{4,}',line): continue
            m=re.match(r'^\s*(' + NUMBER_PATTERN + r')\s*(.*?)\s*\.{4,}',line)
            if m: found.append({'number':display_number(m.group(1)),'title':m.group(2).strip()})
    return found

def toc_numbers(pages):
    return [entry['number'] for entry in toc_entries(pages)]

def normalize_title(title):
    return ''.join(char.casefold() for char in title if char.isalnum())

def compare_toc_titles(hymns,pages):
    toc={hymn_id(entry['number']):entry['title'] for entry in toc_entries(pages)}
    differences=[]
    for hymn in hymns:
        indexed_title=toc.get(hymn['id'])
        if indexed_title is not None and normalize_title(hymn['title']) != normalize_title(indexed_title):
            differences.append({'number':hymn['number'],'printedTitle':hymn['title'],'contentsTitle':indexed_title})
    return differences

def extract(pdf=SOURCE):
    pages=read_pdf(pdf); validate_layout(pages); hymns=[]; anomalies=[]; active=None; seen=set()
    for pageno in range(LYRIC_FIRST_PAGE,LYRIC_LAST_PAGE+1):
        lines=[x.rstrip() for x in pages[pageno-1].splitlines()]
        header=parse_header(lines)
        if header:
            ix,number,title=header; tid=hymn_id(number)
            if tid in seen: anomalies.append(f'physical page {pageno}: duplicate id {tid}')
            seen.add(tid)
            continuation_ix,continuation=title_continuation(lines,ix)
            if continuation:
                title += ' '+continuation
            active={'id':tid,'number':number,'title':title,'verses':[],'sourcePage':pageno}
            hymns.append(active)
            body=[]
            for j,line in enumerate(lines[ix+1:],ix+1):
                if j==continuation_ix: continue
                if re.fullmatch(r'\s*\d{1,3}\s*',line): continue
                # Ignore accidental repeated numbered headers/footers, retaining lyrics otherwise.
                if HEADER.match(line.strip()) or BARE_VARIANT.match(line.strip()): continue
                body.append(line.strip())
            append_blocks(active,body)
        elif active:
            # Continuation page: retain paragraph breaks and detect a chorus label.
            body=[]
            for line in lines:
                if re.fullmatch(r'\s*\d{1,3}\s*',line): continue
                body.append(line.strip())
            append_blocks(active,body)
    ids={h['id'] for h in hymns}
    expected=toc_numbers(pages)
    expected_ids={hymn_id(x) for x in expected}
    missing=sorted(expected_ids-ids)
    extra=sorted(ids-expected_ids)
    if missing: anomalies.append(f'catalog numbers missing from lyric pages: {", ".join(missing)}')
    if extra: anomalies.append(f'lyric entries absent from numbered contents: {", ".join(extra)}')
    for h in hymns:
        if not h['verses']: anomalies.append(f"physical page {h['sourcePage']}: no lyrics extracted for {h['number']}")
    title_differences=compare_toc_titles(hymns,pages)
    return hymns,anomalies,len(pages)-1,expected,title_differences

def build_catalog(pdf=SOURCE):
    hymns,anomalies,pages,expected,title_differences=extract(pdf)
    catalog={'version':1,'source':{'name':'Himnario digital de la Iglesia IEUCB Mackenna','url':URL,'sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'importedAt':datetime.date.today().isoformat(),'reviewRequired':True},'hymns':hymns}
    return catalog,anomalies,pages,expected,title_differences

def atomic_write_catalog(catalog, anomalies, output=OUTPUT):
    if anomalies:
        raise ValueError('refusing to write catalog with extraction anomalies: '+'; '.join(anomalies))
    output=Path(output); output.parent.mkdir(parents=True,exist_ok=True)
    temp_path=None
    try:
        with tempfile.NamedTemporaryFile('w',encoding='utf8',dir=output.parent,delete=False,prefix=f'.{output.name}.') as stream:
            temp_path=Path(stream.name)
            json.dump(catalog,stream,ensure_ascii=False,indent=2)
            stream.write('\n')
            stream.flush(); os.fsync(stream.fileno())
        os.replace(temp_path,output)
    finally:
        if temp_path and temp_path.exists(): temp_path.unlink()

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--check',action='store_true'); args=ap.parse_args()
    catalog,anomalies,pages,expected,title_differences=build_catalog()
    if args.check:
        current=json.loads(OUTPUT.read_text(encoding='utf8')) if OUTPUT.exists() else None
        if current:
            current.get('source',{}).pop('importedAt',None)
            check=catalog.copy(); check['source']=catalog['source'].copy(); check['source'].pop('importedAt',None)
            if current != check: anomalies.append('generated catalog is stale; run python3 scripts/import-hymns.py')
        else: anomalies.append('generated catalog is missing; run python3 scripts/import-hymns.py')
    variants=sum(bool(re.search(r'[- ]+[A-Za-z](?:\s+y\s+[A-Za-z])?$',h['number'],re.I)) for h in catalog['hymns'])
    blocks=sum(len(h['verses']) for h in catalog['hymns'])
    print(f'PDF pages={pages}; numbered contents={len(expected)}; hymns={len(catalog["hymns"])}; variant labels={variants}; blocks={blocks}; anomalies={len(anomalies)}')
    for issue in anomalies: print('ANOMALY:',issue)
    for difference in title_differences:
        print(f'TITLE DIFFERENCE {difference["number"]}: printed={difference["printedTitle"]!r}; contents={difference["contentsTitle"]!r}')
    if not catalog['hymns'] or anomalies: raise SystemExit(1)
    if not args.check: atomic_write_catalog(catalog,anomalies)
if __name__=='__main__': main()
