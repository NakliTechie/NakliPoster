# NakliPoster

**Local-first API client. No account. No cloud. No install.**

A single HTML file that replaces Postman for solo developers and small teams.

→ **[nakliposter.naklitechie.com](https://nakliposter.naklitechie.com)**

---

## Why

Postman is free to use alone. But it now requires an account, runs as a heavyweight Electron app, syncs to the cloud, and gates AI features behind credits. The core API client has become a hostage.

NakliPoster is the escape route.

---

## Features

### Tier 1 — Core API Client
- HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- URL bar with `{{variable}}` interpolation
- Params, Headers, Body (JSON / XML / text / form-data / urlencoded), Auth (Bearer / Basic / API Key)
- Syntax-highlighted JSON response viewer (Pretty / Raw / Preview)
- Multiple tabs, session restored on reload
- Request history with search

### Tier 2 — Collections & Environments
- Collections stored as **Postman v2.1 JSON files on your disk** via File System Access API
- Continuous autosave, directory watcher (new files auto-imported)
- Environments + Globals with `{{variable}}` interpolation
- Import: Postman v2.1, cURL, OpenAPI 3.x
- Export any collection as `.postman_collection.json`
- Code generation: cURL, JS fetch, axios, Python, Go, HTTPie

### Tier 3 — Serverless Collaboration
Share a request or collection with a teammate via a single link. **No server involved — ever.**

```
JSON → lz-string compress → #fragment
                ↕ optional
        AES-256-GCM encrypt (Web Crypto API, PBKDF2 200k rounds)
```

- Unencrypted: `#np:<compressed>`
- Encrypted: `#npe:<salt>.<iv>.<ciphertext>`
- QR code generated client-side for short links
- Recipient opens link → preview → one-click import
- Share the passphrase separately (Signal, etc.)

The `#fragment` never reaches a server. It lives only in the link.

---

## Usage

Open [nakliposter.naklitechie.com](https://nakliposter.naklitechie.com) in any modern browser. Or:

```bash
git clone https://github.com/NakliTechie/NakliPoster
cd NakliPoster
python3 -m http.server
# open http://localhost:8000
```

No build step. No npm. No account.

---

## Architecture

| Concern | Solution |
|---|---|
| Distribution | Single `index.html` |
| Storage | File System Access API (primary) + localStorage (fallback) |
| Collection format | Postman v2.1 JSON |
| Collaboration | lz-string + AES-256-GCM (Web Crypto API) |
| Syntax highlighting | Custom JSON highlighter (no CDN dependency) |
| CDN deps (lazy-loaded) | lz-string, qrcodejs — only loaded when sharing |

---

## Roadmap

- [ ] Tier 4: Pre/post-request scripts with `pm` API (Postman-compatible), Collection Runner
- [ ] Tier 5: AI test generation, debugging, documentation (WebGPU local model — no keys)
- [ ] Tier 5b: WebSocket client, Cookie manager, in-browser git history

---

## Part of the NakliTechie series

Browser-native tools that respect your privacy. No server. No API keys. No data leaving your device.

[naklitechie.github.io](https://naklitechie.github.io) · Built by Chirag Patnaik · Built with Claude
