# NakliPoster guide

The full reference: every feature, how sharing works, how the app is built, and the security model. The [README](README.md) covers getting started.

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
- When hosted by NakliOS, collections plus environments/globals can live in
  the mounted Folder or encrypted Crate through the app-scoped SDK. Browser,
  direct-folder, NakliOS Folder, and Crate workspaces stay separate; changing
  location never performs an implicit migration.
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
- **"Send to NakliPoster" bookmarklet** — drag from Help → Others to your bookmarks bar. Select collection JSON on any page, click the bookmarklet, and NakliPoster opens a confirmation preview

### AI Assistant
Context-aware AI — knows your active request, last response, and environment variables.

- **Local model**: Gemma 4 E2B/E4B, Qwen 2.5 1.5B, SmolLM 2 1.7B — WebGPU, runs entirely on device, no keys
- **API mode**: any OpenAI-compatible endpoint — LM Studio, Ollama, OpenRouter, OpenAI
- Generates test scripts, pre-request scripts, and documentation
- Output inserts directly into the relevant editor tab

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

## Architecture

| Concern | Solution |
|---|---|
| Distribution | Single `index.html` — no build step, no dependencies to install |
| Storage | Standalone: File System Access API + localStorage fallback. Hosted: app-scoped NakliOS Folder or encrypted Crate. |
| Collection format | Postman v2.1 JSON (compatible with Postman import/export) |
| Collaboration | lz-string + AES-256-GCM via Web Crypto API |
| Git history | isomorphic-git (loaded from CDN on first use, exact version with integrity hash) |
| AI inference | Transformers.js v4 via WebGPU |
| Scripting API | Opaque-origin iframe with a copied `pm` capability surface |
| Developer API | `window.nakliposter` — opt-in frozen object + cross-tab `postMessage` listener |
| Syntax highlighting | Custom JSON highlighter (zero CDN dependency) |
| CDN deps (on first use) | lz-string, qrcodejs — when you share or open a share link; exact versions with integrity hashes |

## Palette

Coloured with **`india_east-12 · KANCHENJUNGA PRE-DAWN`** — first light from Tiger Hill on the world's third-highest mountain, never summited out of respect. Pre-dawn navy-black body, saffron ink, peachy-amber accent — the late-night-API-debug session as it tips over into morning. (HTTP method colours and JSON-syntax highlights stay literal — they're a developer-conventions API.)

Palette pulled from [**Rangrez**](https://github.com/NakliTechie/rangrez), the global colour-palette library that backs all NakliTechie projects.

## Security model

NakliPoster runs entirely in your browser. Nothing leaves your machine unless you explicitly hit Send. That's the whole model — there is no NakliPoster server, no account, no telemetry, no sync.

A few things are worth understanding if you intend to trust the tool with real credentials:

- **Your environment variables and auth tokens live in this browser profile** — in `localStorage` and, if you've opened a workspace, in the JSON files inside the folder you picked. Anyone with access to that profile or that folder can read them. Don't point NakliPoster at a folder synced to a service you don't fully trust.
- **Pre-request and test scripts run in a constrained worker sandbox.** Each run receives a structured copy of its request, response, and `pm` variables through a private message channel. The worker sits behind an opaque-origin iframe with a deny-by-default Content Security Policy; it cannot access NakliPoster's DOM, saved tabs, `window.S`, browser storage, parent messaging, or direct network APIs. Scripts can make explicit network requests only through `pm.sendRequest()`, whose parent bridge omits ambient cookies. They can still read values deliberately exposed through `pm` and mutate those values, so only run scripts you trust.
- **Imports don't carry scripts.** Postman collection imports and NakliPoster share links deliberately strip pre-request and test scripts on the way in, so a shared collection cannot smuggle code into your browser. Scripts only ever exist on tabs you've authored yourself.
- **Share links are client-encrypted.** Optional passphrase protection uses AES-256-GCM via Web Crypto. Environment variables are never part of a share link. Saved request auth, credential headers and collection variables are included, and the share dialog warns you when a link holds them.
- **The JavaScript API is opt-in and origin-checked.** `window.nakliposter` only exists when you enable it in Settings → Developer. Same-origin `postMessage` imports may run directly; opaque origins are rejected. The cross-origin bookmarklet is accepted only from the window that opened NakliPoster and always requires confirmation. Imported collections go through the same `pmToInternal()` parser as manual imports — no script execution, no eval.
- **Remote code loads only when you use a feature that needs it.** The tool is one static HTML file, and the page opens with no third-party requests. Sharing loads `lz-string` and `qrcodejs`, and git history loads `isomorphic-git`, each from jsDelivr at an exact version with an integrity hash. Local AI loads Transformers.js in a worker from the `@4` range, with no integrity hash, because a module import cannot carry one. The hosted page changes when this repo changes; a copy you clone changes only when you pull.

If you find a security issue, please open an issue at [github.com/NakliTechie/NakliPoster](https://github.com/NakliTechie/NakliPoster).
