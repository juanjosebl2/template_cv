# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a personal CV repository. The CV is authored as a single self-contained HTML file (`CV-HTML.html`) and exported to PDF via a Playwright-based script.

## Generating the PDF

```bash
cd cv-pdf-export
npm run pdf
```

Output is written to `cv-pdf-export/output/Juan-Jose-Barrera-Linde.pdf`.

First-time setup (installs Chromium browser for Playwright):
```bash
cd cv-pdf-export
npm run install:pw
```

## Architecture

- **`CV-HTML.html`** — The single source of truth for the CV. All content, styles, and print CSS live here. It includes a floating download button (`.download-btn`) that is hidden before PDF export.
- **`cv-pdf-export/export-pdf.mjs`** — Node.js ESM script that:
  1. Spins up a local HTTP server (port 3007) serving the CV directory via `serve-handler`
  2. Launches headless Chromium via Playwright
  3. Emulates print media, removes the download button, then exports an A4 PDF with 0.75in margins
- **`cv-pdf-export/package.json`** — ESM package (`"type": "module"`) with `playwright` and `serve-handler` as dev dependencies.

## Key Details

- The HTML file uses `@page` print CSS for layout control; PDF margins in `export-pdf.mjs` should stay in sync with those rules.
- The export script hardcodes the CV directory path to `C:\Users\juanjose\Desktop\CV` — update `cvDir` in `export-pdf.mjs` if the project is moved.
- `deviceScaleFactor: 2` and `locale: 'es-ES'` are set in the Playwright browser context.
