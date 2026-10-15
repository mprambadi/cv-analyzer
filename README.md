# CV Atlas

Private, browser-based resume clarity review. Static site; no server or file uploads. Supports PDF (selectable text), DOCX, TXT and MD up to 10 MB. Scanned PDFs need OCR before analysis.

Monorepo also includes `backend/`: separate Cloudflare Worker API for AI agents. Browser UI remains fully local and does not call backend or send CVs to any provider. API callers explicitly send text to a configured 9router OpenAI-compatible model; do not send sensitive CVs without consent.

```sh
npm install
npm run dev
```

Run `npm test` for analysis checks and `npm run build` to generate static `dist/` for Netlify or another static host. Netlify build command: `npm run build`; publish directory: `dist`.

Sections, contact details, bullet points, measurable results, and optional job-description words feed transparent heuristic scores. Scores are not actual ATS results. Generated DOCX preserves extracted text and normalizes recognized headings; it does not invent work history. Review exported documents before use. PDF report includes findings and suggestions. PDF parsing, DOCX parsing, and exports run locally after app assets load. Google Fonts load online when available; system fonts work offline.

## Agent API

API contract: [`backend/openapi.yaml`](backend/openapi.yaml). `POST /v1/analyze` accepts JSON `resumeText` (80–30,000 chars), optional `jobDescription` (up to 12,000 chars), optional `language` (`en` or `id`). Entire JSON capped at 50 KB. Returns `{ "heuristics": { ... }, "ai": { "summary": "...", "strengths": [], "prioritizedFixes": [], "suggestedEdits": [] } }`. Requires `Authorization: Bearer <AGENT_TOKEN>`. Errors use `{ "error": { "code": "...", "message": "..." } }`. Model suggestions need human verification: structured output does not guarantee factual accuracy. API has no rate limiting; rotate token if shared.

```sh
curl -X POST https://cv-analyzer-api.mprambadi.workers.dev/v1/analyze \
  -H "Authorization: Bearer $AGENT_TOKEN" -H 'Content-Type: application/json' \
  --data-binary @request.json
```

Create `request.json` with resume text; do not commit CVs or tokens. For local development run `npx wrangler dev --config backend/wrangler.jsonc`; for deployment run `npx wrangler deploy --config backend/wrangler.jsonc`. Set secrets using `npx wrangler secret put NAME --config backend/wrangler.jsonc` for each of `AGENT_TOKEN`, `NINEROUTER_API_KEY`, `NINEROUTER_BASE_URL`, and `NINEROUTER_MODEL`. Base URL must be HTTPS OpenAI-compatible API root, including `/v1` if provider needs it; Worker appends `/chat/completions`. Do not put secrets in Git, committed `.env` files, or Pages frontend. Until secrets are configured, `/health` reports `configured: false`; with token set but missing provider config, authenticated analysis returns 503. Worker rejects requests without a valid token and does not enable browser CORS. Provider requests time out after 30 seconds. No persistence or analytics configured.
