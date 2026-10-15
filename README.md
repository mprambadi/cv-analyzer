# CV Atlas

Private, browser-based resume clarity review. Static site; no server or file uploads. Supports PDF (selectable text), DOCX, TXT and MD up to 10 MB. Scanned PDFs need OCR before analysis.

```sh
npm install
npm run dev
```

Run `npm test` for analysis checks and `npm run build` to generate static `dist/` for Netlify or another static host. Netlify build command: `npm run build`; publish directory: `dist`.

Sections, contact details, bullet points, measurable results, and optional job-description words feed transparent heuristic scores. Scores are not actual ATS results. Generated DOCX preserves extracted text and normalizes recognized headings; it does not invent work history. Review exported documents before use. PDF report includes findings and suggestions. PDF parsing, DOCX parsing, and exports run locally after app assets load. Google Fonts load online when available; system fonts work offline.
