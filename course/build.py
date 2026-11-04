#!/usr/bin/env python3
"""Wrap _src/NN-slug.html body fragments into standalone offline pages."""
import re, pathlib
root = pathlib.Path(__file__).parent
pages = sorted(root.glob('_src/[0-9]*.html'))
meta = []
for p in pages:
    t = re.search(r'<!--title:(.*?)\|(.*?)\|(.*?)-->', p.read_text())
    meta.append((p.stem, *[x.strip() for x in t.groups()]))  # slug, title, subtitle, color
def shell(i):
    slug, title, sub, _ = meta[i]
    nav = '<h2>DevOps Course</h2><a href="index.html">Home</a>' + ''.join(
        f'<a href="{s}.html"{" class=on" if j==i else ""}>{t}</a>' for j,(s,t,_,_) in enumerate(meta))
    prev = f'<a href="{meta[i-1][0]}.html">&larr; {meta[i-1][1]}</a>' if i else '<span></span>'
    nxt = f'<a href="{meta[i+1][0]}.html">{meta[i+1][1]} &rarr;</a>' if i < len(meta)-1 else '<span></span>'
    body = re.sub(r'<!--title:.*?-->', '', pages[i].read_text())
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | DevOps Course</title><link rel="stylesheet" href="assets/course.css"></head><body>
<nav class="side">{nav}</nav><main><header class="hero"><h1>{title}</h1><p>{sub}</p></header>{body}
<div class="pager">{prev}{nxt}</div></main><script src="assets/course.js"></script></body></html>'''
for i,(slug,*_) in enumerate(meta):
    (root/f'{slug}.html').write_text(shell(i))
tiles = ''.join(f'<a class="tile" href="{s}.html" style="background:{c}">{t}<small>{sub}</small></a>' for s,t,sub,c in meta)
idx = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>DevOps Course</title><link rel="stylesheet" href="assets/course.css"></head><body><main>
<header class="hero"><h1>DevOps Hands-On Course</h1><p>Linux, Git, Docker, Kubernetes, Helm, Istio, Ansible, Jenkins, Terraform and AWS. Each page is an offline HTML lab with diagrams and copy-ready commands.</p></header>
<div class="card lab"><div class="t">Lab environment</div>One Ubuntu 24.04 VM with root (Multipass, VirtualBox, EC2 t3.large or similar, 4 vCPU / 8 GB RAM / 40 GB disk recommended). Follow the pages in order.</div>
<div class="grid">{tiles}</div></main><script src="assets/course.js"></script></body></html>'''
(root/'index.html').write_text(idx)
print(len(meta), 'pages built')
