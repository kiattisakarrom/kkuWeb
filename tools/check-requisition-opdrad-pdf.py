from pathlib import Path
import json, re, subprocess
import pdfplumber

root = Path(__file__).resolve().parents[1] / 'tmp' / 'pdfs'
poppler = Path('C:/Users/fAm NoteBook/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe')
reports = {}
for kind in ['sample', 'stress', 'missing']:
    pdf_path = root / f'requisition-opdrad-{kind}.pdf'
    with pdfplumber.open(pdf_path) as pdf:
        texts = [page.extract_text() or '' for page in pdf.pages]
        outside = [(i + 1, ch['text']) for i, page in enumerate(pdf.pages) for ch in page.chars
                   if ch['x0'] < -1 or ch['x1'] > page.width + 1 or ch['top'] < -1 or ch['bottom'] > page.height + 1]
        assert not outside, f'{kind}: out-of-bounds text'
        if kind != 'missing':
            assert all('OPDRAD23102026' in text for text in texts)
        joined = '\n'.join(texts)
        if kind == 'stress':
            assert len(set(re.findall(r'OPDRAD-MED-\d{3}', joined))) == 120
            assert joined.count('END-OPDRAD-MED') == 4
        if kind == 'missing':
            assert len(set(re.findall(r'OPDRAD-MISSING-\d{3}', joined))) == 90
            assert joined.count('END-OPDRAD-MISSING') == 3
        reports[kind] = {'pages': len(pdf.pages), 'textInBounds': True}
        targets = [1] if kind == 'sample' else sorted(set([1, (len(pdf.pages) + 1)//2, len(pdf.pages)]))
        for number in targets:
            subprocess.run([str(poppler), '-f', str(number), '-l', str(number), '-singlefile', '-scale-to', '1500', '-png', str(pdf_path), str(root / f'opdrad-{kind}-{number}')], check=True, capture_output=True)
print(json.dumps(reports))
