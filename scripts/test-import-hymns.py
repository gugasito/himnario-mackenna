#!/usr/bin/env python3
"""Regression tests for PDF page boundaries, variants, and stanza semantics."""
import importlib.util, tempfile, unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('import_hymns',Path(__file__).with_name('import-hymns.py'))
module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)

class ImportTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.hymns,cls.anomalies,cls.pages,cls.toc,cls.title_differences=module.extract()
    def setUp(self): self.by_id={h['id']:h for h in self.hymns}
    def test_pdf_extent_and_contents_correspondence(self):
        self.assertEqual(self.pages,413); self.assertEqual(self.anomalies,[])
        self.assertEqual(len(self.toc),385); self.assertEqual(len(self.hymns),385)
        self.assertEqual([module.hymn_id(n) for n in self.toc],[h['id'] for h in self.hymns])
    def test_variant_labels_preserve_display_and_normalize_only_ids(self):
        for hymn_id in ('10-a','10-b','11-a','11-b'): self.assertIn(hymn_id,self.by_id)
        self.assertEqual(self.by_id['10-a']['number'],'10-A')
        self.assertEqual(self.by_id['104-a-y-b']['number'],'104 A y B')
        self.assertEqual(self.by_id['104-a-y-b']['title'],'CARIÑOSO SALVADOR')
        self.assertEqual(self.by_id['261-b']['number'],'261-B')
        self.assertEqual(self.by_id['261-b']['title'],'')
        self.assertEqual(self.by_id['288-y-289']['number'],'288 y 289')
        self.assertEqual(self.by_id['288-y-289']['title'],'¡ESTAD POR CRISTO FIRMES!')
    def test_chorus_is_one_block_and_following_stanzas_are_verses(self):
        blocks=self.by_id['3']['verses']
        self.assertEqual([b['kind'] for b in blocks],['verse','chorus','verse','verse','verse'])
        self.assertEqual([len(b['lines']) for b in blocks],[2,2,2,2,2])
    def test_continuation_page_starts_new_verse_after_chorus_boundary(self):
        hymn={'verses':[]}
        module.append_blocks(hymn,['CORO:','','coro línea','','estrofa siguiente'])
        module.append_blocks(hymn,['estrofa de continuación'])
        self.assertEqual([b['kind'] for b in hymn['verses']],['chorus','verse','verse'])
    def test_wrapped_title_and_punctuation_are_preserved(self):
        self.assertEqual(self.by_id['340']['title'],'NO HABRÁ SOMBRAS EN EL VALLE DE LA MUERTE')
        self.assertEqual(self.by_id['103']['title'],'¿HAS HALLADO EN CRISTO TU BUEN SALVADOR?')
        self.assertEqual(self.by_id['103']['verses'][0]['lines'][0],'¿Has hallado en Cristo tu buen Salvador?')
        for hymn_id,ending in {'142':'MAL?','173':'VENCER?','236':'APARTARA?','282':'PENAS?'}.items():
            self.assertTrue(self.by_id[hymn_id]['title'].endswith(ending),hymn_id)
        self.assertEqual(self.by_id['357']['title'],'¡OH, CRISTO, TU AYUDA QUISIERA')
    def test_title_audit_only_flags_source_index_differences(self):
        self.assertEqual([(d['number'],d['printedTitle'],d['contentsTitle']) for d in self.title_differences],[
            ('205','OÍ BENDITA HISTORIA','BENDITA HISTORIA'),
            ('303','¡CAMARADAS! EN LOS CIELOS VED LA ENSEÑA YA','iCAMARADAS! EN LOS CIELOS VED LA ENSEÑA YA'),
        ])
    def test_last_lyric_page_included_and_alphabetical_index_excluded(self):
        self.assertEqual(self.by_id['382']['sourcePage'],398)
        self.assertNotIn('399',self.by_id)
    def test_anomalies_never_replace_existing_catalog(self):
        with tempfile.TemporaryDirectory() as temp:
            target=Path(temp)/'hymns.json'; target.write_text('previous valid catalog\n',encoding='utf8')
            with self.assertRaisesRegex(ValueError,'refusing to write'):
                module.atomic_write_catalog({'version':1},['simulated extraction anomaly'],target)
            self.assertEqual(target.read_text(encoding='utf8'),'previous valid catalog\n')

if __name__=='__main__': unittest.main()
