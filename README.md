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
- HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, **WS (WebSocket)**, **GQL (GraphQL)**
- URL bar with `{{variable}}` interpolation
- Params, Headers, Body (JSON / XML / text / form-data / urlencoded)
- Auth: Bearer token, Basic, API Key, **OAuth 2.0** (Authorization Code + Client Credentials)
- **GraphQL** — dedicated query editor, variables panel, operation name; schema explorer via introspection (⟳ Schema); sends standard `POST {query, variables, operationName}` body; auth and headers work normally
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
- **Response variable extraction** — click any JSON value in the response to set it as an environment variable, no scripting required; optionally auto-appends `pm.environment.set()` to the Tests script for the runner

### JavaScript API & Cross-Tab Injection
- Optional `window.nakliposter` API for scripting and cross-tab collection injection (enable in Settings → Developer)
- `importCollection(json)` — inject a Postman v2.1 or OpenAPI collection programmatically
- `listCollections()` — enumerate loaded collections
- `exportCollection(id)` — retrieve a collection as Postman v2.1 JSON
- **Cross-tab `postMessage` listener** — other tabs or bookmarklets can push collections into NakliPoster without switching tabs
- **"Send to NakliPoster" bookmarklet** — drag from Help → Others to your bookmarks bar. Select collection JSON on any page, click the bookmarklet, and it opens NakliPoster and imports automatically

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
| Scripting API | `window.nakliposter` — opt-in frozen object + cross-tab `postMessage` listener |
| Syntax highlighting | Custom JSON highlighter (zero CDN dependency) |
| CDN deps (lazy-loaded) | lz-string, qrcodejs — only loaded when sharing |

## Palette

Coloured with **`india_east-12 · KANCHENJUNGA PRE-DAWN`** — first light from Tiger Hill on the world's third-highest mountain, never summited out of respect. Pre-dawn navy-black body, saffron ink, peachy-amber accent — the late-night-API-debug session as it tips over into morning. (HTTP method colours and JSON-syntax highlights stay literal — they're a developer-conventions API.)

Palette pulled from [**Rangrez**](https://github.com/NakliTechie/rangrez), the global colour-palette library that backs all NakliTechie projects.

---

## Security model

NakliPoster runs entirely in your browser. Nothing leaves your machine unless you explicitly hit Send. That's the whole model — there is no NakliPoster server, no account, no telemetry, no sync.

A few things are worth understanding if you intend to trust the tool with real credentials:

- **Your environment variables and auth tokens live in this browser profile** — in `localStorage` and, if you've opened a workspace, in the JSON files inside the folder you picked. Anyone with access to that profile or that folder can read them. Don't point NakliPoster at a folder synced to a service you don't fully trust.
- **Pre-request and test scripts run as real JavaScript in this page.** A malicious script can read every environment variable (including secret-tagged ones), every saved request, and every token in storage — then send them anywhere. **Only paste scripts from sources you trust.** Treat a `pm` script the same way you'd treat `eval()` on your credentials. If the AI Assistant generates a test script, read it before accepting it.
- **Imports don't carry scripts.** Postman collection imports and NakliPoster share links deliberately strip pre-request and test scripts on the way in, so a shared collection cannot smuggle code into your browser. Scripts only ever exist on tabs you've authored yourself.
- **Share links are client-encrypted.** Optional passphrase protection uses AES-256-GCM via Web Crypto. Tabs with stored credentials show a warning before sharing; secret-tagged environment variables are excluded from shared links by default.
- **The JavaScript API is opt-in and same-origin.** `window.nakliposter` only exists when you enable it in Settings → Developer. The cross-tab `postMessage` listener only processes `np_import` messages when the API is enabled. Imported collections go through the same `pmToInternal()` parser as manual imports — no script execution, no eval.
- **No auto-updates and no remote code.** The tool is one static HTML file. Two small libraries (`lz-string`, `qrcodejs`) are lazy-loaded from a CDN only when you use sharing; everything else, including the syntax highlighter, is inline.

If you find a security issue, please open an issue at [github.com/NakliTechie/NakliPoster](https://github.com/NakliTechie/NakliPoster).

---

## Part of the NakliTechie series

Browser-native tools that respect your privacy. No server. No API keys. No data leaving your device.

[naklitechie.github.io](https://naklitechie.github.io) · Built by Chirag Patnaik · Built with Claude
