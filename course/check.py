#!/usr/bin/env python3
"""Validate the generated course: well-formed SVG, links, balanced <pre>, unique ids, icon refs, no CDN.

Exit code 1 on any problem. Run after build.py (also used by CI).
"""
import glob
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter

os.chdir(os.path.dirname(os.path.abspath(__file__)))
errors = []
pages = sorted(glob.glob('[0-9]*.html')) + ['index.html']

for f in pages:
    t = open(f).read()
    # svg well-formedness
    for s in re.findall(r'<svg.*?</svg>', t, re.S):
        try:
            ET.fromstring(s)
        except ET.ParseError as e:
            errors.append(f'{f}: invalid SVG ({e})')
    # pre balance
    if t.count('<pre>') != t.count('</pre>'):
        errors.append(f'{f}: unbalanced <pre>')
    # links
    for h in re.findall(r'href="([^"#:]+\.(?:html|css))"', t):
        if not os.path.exists(h):
            errors.append(f'{f}: broken link {h}')
    # duplicate ids
    ids = Counter(re.findall(r'\sid="([^"]+)"', t))
    for k, n in ids.items():
        if n > 1:
            errors.append(f'{f}: duplicate id "{k}" x{n}')
    # icon references resolve to a symbol
    for ref in set(re.findall(r'<use href="#([^"]+)"', t)):
        if f'id="{ref}"' not in t:
            errors.append(f'{f}: missing icon symbol {ref}')
    # offline rule
    if re.search(r'(?:src|href)="https?://[^"]*(?:cdn|googleapis|unpkg|jsdelivr)', t):
        errors.append(f'{f}: external CDN reference')

for e in errors:
    print('ERROR', e)
print(f'checked {len(pages)} pages, {len(errors)} problem(s)')
sys.exit(1 if errors else 0)
