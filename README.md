# DevOps Course Documentation Hub

Interactive documentation hub and learning materials for modern DevOps practices, architecture patterns, and hands-on labs.

## Overview

- **Interactive Docs Hub**: Built with React, Vite, Tailwind CSS, KaTeX, and Mermaid.js for rich in-document diagrams and notes.
- **Automated Deployment**: Deploys automatically to GitHub Pages via GitHub Actions workflow on every push to `main`.

## Local Development

```bash
cd docs-hub
npm install
npm test
npm run dev
```

## Production Build

```bash
cd docs-hub
npm run build
```

## Hands-On Course (`course/`)

Standalone offline HTML labs (no CDN) with diagrams and copy-ready commands. Published at `/course/` on GitHub Pages.

Linux, Git, Docker, Kubernetes, Helm, Istio, Ansible, Jenkins, Terraform, AWS, plus two capstone application deployments.

```bash
python3 course/diagrams.py   # insert generated diagrams into course/_src (idempotent)
python3 course/build.py      # render course/*.html from course/_src
open course/index.html
```

Edit pages in `course/_src/`, then rebuild. The `course/*.html` files are generated and committed so the site works without a build step.
