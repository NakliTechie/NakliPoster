# NakliPoster

**Local-first API client. No account. No cloud. No install.**

A single HTML file that replaces Postman for solo developers and small teams.

→ **[nakliposter.naklitechie.com](https://nakliposter.naklitechie.com)**

---

## Why

Postman is free to use alone. But it now requires an account, runs as a heavyweight Electron app, syncs to the cloud, and gates AI features behind credits. The core API client has become a hostage.

NakliPoster is the escape route. Everything runs in the browser — your requests, your collections, your API keys, your history — none of it leaves your machine.

---

## Features

### Core API Client
- HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, **WS (WebSocket)**
- URL bar with `{{variable}}` interpolation
- Params, Headers, Body (JSON / XML / text / form-data / urlencoded)
- Auth: Bearer token, Basic, API Key
- Syntax-highlighted response viewer (Pretty / Raw / Preview)
- Multiple tabs, session restored on reload
- Request history with full-text search
- Global search across collections, history, and URLs (⌘K / Ctrl+K)

### Collections & Workspaces
- Collections stored as **Postman v2.1 JSON files on your local disk** via File System Access API — open a folder, work directly in it, no sync, no account
- Continuous autosave, directory watcher (new files auto-imported)
- Environments + Globals with `{{variable}}` interpolation
- Cookie manager — domain-scoped cookies auto-injected as `Cookie:` header
- Import: Postman v2.1, cURL, OpenAPI 3.x
- Export any collection as `.postman_collection.json`
- Code generation: cURL, JS fetch, axios, Python, Go, HTTPie
- In-browser git history — browse and restore past versions of any collection (requires `git init` in the workspace folder)

### Scripting & Testing
- Pre-request scripts — run JS before each request (variable manipulation, dynamic auth)
- Test scripts — Chai-style assertions (`pm.expect(res.json().id).to.be.a('number')`)
- Collection Runner — execute all requests in a collection sequentially with variable chaining

### AI Assistant
Context-aware AI — knows your active request, last response, and environment variables.

- **Local model**: Gemma 4 E2B/E4B, Qwen 2.5 1.5B, SmolLM 2 1.7B — WebGPU, runs entirely on device, no keys
- **API mode**: any OpenAI-compatible endpoint — LM Studio, Ollama, OpenRouter, OpenAI
- Generates test scripts, pre-request scripts, and documentation
- Output inserts directly into the relevant editor tab

---

## Serverless Collaboration

Share any request or collection with a teammate via a single link. **No server involved — ever.**

```
JSON  →  lz-string compress  →  URL #fragment
                  ↕ optional
          AES-256-GCM encrypt
          (Web Crypto API, PBKDF2 200k rounds)
```

Two modes:

| Mode | Fragment prefix | Who can read |
|------|----------------|--------------|
| Unencrypted | `#np:<compressed>` | Anyone with the link |
| Passphrase-encrypted | `#npe:<salt>.<iv>.<ciphertext>` | Anyone with the link + passphrase |

The `#fragment` is never sent to a server — it exists only in the URL. Share the link via email or Slack; share the passphrase separately via Signal. The recipient opens the link, sees a preview, and imports in one click. A QR code is generated client-side for short requests.

**Why this works**: browsers don't include the URL fragment in HTTP requests. The entire payload stays client-side from the moment it's encoded to the moment it's decoded.

---

## Usage

Open [nakliposter.naklitechie.com](https://nakliposter.naklitechie.com) in any modern browser. Or run it locally:

```bash
git clone https://github.com/NakliTechie/NakliPoster
cd NakliPoster
python3 -m http.server
# open http://localhost:8000
```

No build step. No npm. No account.

---

## CORS

NakliPoster runs in the browser and is therefore subject to the same CORS restrictions as any browser-based client. If an API doesn't include the appropriate `Access-Control-Allow-Origin` headers, the browser will block the request — this is a browser security constraint, not a NakliPoster limitation.

**In practice this affects:**
- Internal/private APIs not configured for browser access
- Some third-party APIs that only expect server-to-server calls

**Workarounds:**
- Run a local CORS proxy: `npx local-cors-proxy --proxyUrl https://api.example.com`
- Use a browser extension that relaxes CORS for local development
- For APIs you control: add `Access-Control-Allow-Origin: *` (or a specific origin) to responses

Public APIs and well-configured developer APIs generally work without issue.

---

## Architecture

| Concern | Solution |
|---|---|
| Distribution | Single `index.html` — no build step, no dependencies to install |
| Storage | File System Access API (primary) + localStorage (fallback) |
| Collection format | Postman v2.1 JSON (compatible with Postman import/export) |
| Collaboration | lz-string + AES-256-GCM via Web Crypto API |
| Git history | isomorphic-git (lazy-loaded from CDN, ~220KB cached) |
| AI inference | Transformers.js v4 via WebGPU |
| Syntax highlighting | Custom JSON highlighter (zero CDN dependency) |
| CDN deps (lazy-loaded) | lz-string, qrcodejs — only loaded when sharing |

---

## Part of the NakliTechie series

Browser-native tools that respect your privacy. No server. No API keys. No data leaving your device.

[naklitechie.github.io](https://naklitechie.github.io) · Built by Chirag Patnaik · Built with Claude
