#!/usr/bin/env python3
"""Wrap _src/NN-slug.html body fragments into standalone offline pages.

Each fragment starts with <!--title:Title|Subtitle|#color|icon-->.
"""
import pathlib
import re

from icons import ic, sprite

root = pathlib.Path(__file__).parent
pages = sorted(root.glob('_src/[0-9]*.html'))

meta = []
for p in pages:
    m = re.search(r'<!--title:(.*?)\|(.*?)\|(.*?)\|(.*?)-->', p.read_text())
    if not m:
        raise SystemExit(f'{p.name}: missing or malformed title comment')
    meta.append((p.stem, *[x.strip() for x in m.groups()]))  # slug, title, subtitle, color, icon

CARD_RE = re.compile(r'<div class="card( [a-z]+)?"><div class="t">(.*?)</div>')


def card_icon(cls, title):
    t = title.lower()
    if t.startswith('cost'):
        return 'coin'
    if any(w in t for w in ('security', 'safety', 'secrets are')):
        return 'shield'
    if t.startswith('checkpoint'):
        return 'check'
    return {'tip': 'bulb', 'warn': 'warn', 'bad': 'bad', 'lab': 'flask'}.get((cls or '').strip(), 'info')


def decorate(body):
    return CARD_RE.sub(
        lambda m: f'<div class="card{m.group(1) or ""}"><div class="t">{ic(card_icon(m.group(1), m.group(2)))}{m.group(2)}</div>',
        body)


def head(title):
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{title} | DevOps Course</title><link rel="stylesheet" href="assets/course.css"></head><body>{sprite()}')


def shell(i):
    slug, title, sub, _, icon = meta[i]
    nav = f'<h2>DevOps Course</h2><a href="index.html">{ic("home")}Home</a>' + ''.join(
        f'<a href="{s}.html"{" class=on" if j == i else ""}>{ic(ico)}{t}</a>' for j, (s, t, _, _, ico) in enumerate(meta))
    prev = f'<a href="{meta[i-1][0]}.html">&larr; {meta[i-1][1]}</a>' if i else '<span></span>'
    nxt = f'<a href="{meta[i+1][0]}.html">{meta[i+1][1]} &rarr;</a>' if i < len(meta) - 1 else '<span></span>'
    body = decorate(re.sub(r'<!--title:.*?-->', '', pages[i].read_text()))
    return (f'{head(title)}<nav class="side">{nav}</nav><main>'
            f'<header class="hero">{ic(icon, "hero-ic")}<h1>{title}</h1><p>{sub}</p></header>{body}'
            f'<div class="pager">{prev}{nxt}</div></main><script src="assets/course.js"></script></body></html>')


for i, (slug, *_rest) in enumerate(meta):
    (root / f'{slug}.html').write_text(shell(i))

tiles = ''.join(
    f'<a class="tile" href="{s}.html" style="background:{c}">{ic(ico, "tile-ic")}{t}<small>{sub}</small></a>'
    for s, t, sub, c, ico in meta)
index = (f'{head("Home")}<main><header class="hero">{ic("rocket", "hero-ic")}<h1>DevOps Hands-On Course</h1>'
         f'<p>Linux, Git, Docker, Kubernetes, Helm, Istio, CI/CD, Ansible, Jenkins, Terraform and AWS. '
         f'Each page is an offline HTML lab with diagrams and copy-ready commands.</p></header>'
         f'<div class="card lab"><div class="t">Lab environment</div>One Ubuntu 24.04 VM with root '
         f'(Multipass, VirtualBox, EC2 t3.large or similar; 4 vCPU, 8 GB RAM, 40 GB disk recommended). '
         f'Follow the pages in order.</div>'.replace('<div class="card lab">', '<div class="card lab">', 1)
         + f'<div class="grid">{tiles}</div></main><script src="assets/course.js"></script></body></html>')
index = decorate(index)
(root / 'index.html').write_text(index)
print(len(meta), 'pages built')
