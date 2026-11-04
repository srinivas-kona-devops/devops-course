# DocHub

Confluence-style documentation portal that runs as a static GitHub Pages site.

## Run locally

```bash
cd docs-hub
npm ci
npm run dev      # http://localhost:5173
npm test
npm run build    # dist/
```

## Publish

1. Repo Settings → Pages → Source = **GitHub Actions**.
2. Push to `main`. `.github/workflows/pages.yml` runs tests, builds, and deploys.

## Notes

- Uploads stay in the visitor's browser (IndexedDB). Shared content must be committed to the repo.
- Uploaded HTML runs in a sandboxed iframe with no access to the portal.

See [docs/DOCHUB_FEATURES.md](docs/DOCHUB_FEATURES.md) for what exists and what does not.
