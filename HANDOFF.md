# Handoff: Multilingual Static Event Website

## Context
I have a simple static HTML website for an event. It needs to support **10 languages**. Currently there is a single `index.html` (English) at the root. The site should stay simple static HTML (no client-side translation framework), but the structure should map cleanly to a future WordPress migration (WPML/Polylang-style URL layout).

## Agreed Architecture

### URL / folder structure (symmetric across all languages)
```
/en/index.html
/de/index.html
/fr/index.html
... (10 languages total)
index.html or server redirect at /  → redirects to /en/
/assets/  (shared CSS, JS, images — one copy at root)
```

- English moves into `/en/` like every other language (do NOT keep English at root).
- Root `/` should 302-redirect to `/en/` (e.g. `.htaccess` `RedirectMatch 302 ^/$ /en/`, or a `_redirects` file on Netlify/Cloudflare Pages). Optionally later: JS auto-detection via `navigator.language` with `/en/` fallback.

### Build system (avoid maintaining 10 copies by hand)
- **One HTML template per page** with placeholders like `{{event_title}}`.
- **One translation file per language**: `i18n/en.json`, `i18n/de.json`, etc., flat key→string maps, e.g.:
  ```json
  { "event_title": "Sommerfest 2026", "register_button": "Jetzt anmelden" }
  ```
- **A small build script** (~30 lines, Python or Node) that renders the template with each language's strings and writes the output folders. No static site generator needed (Eleventy/Hugo considered but deemed overkill for a single event site).

### Per-page requirements (every generated page)
- Correct `<html lang="xx">` attribute.
- `hreflang` alternate links to all language versions, plus:
  ```html
  <link rel="alternate" hreflang="x-default" href="https://SITE/en/">
  ```
- A visible language switcher (plain links) in the header — needed because auto-detection guesses wrong (VPNs, expats, shared machines).

## Tasks for Claude Code
1. Inspect the existing `index.html` and extract all user-facing text into `i18n/en.json`.
2. Convert `index.html` into a template with `{{placeholders}}`.
3. Write the build script that generates `/xx/index.html` for each language in `i18n/`.
4. Generate stub JSON files for the other 9 languages (copy English values as placeholders, to be translated).
5. Add the root redirect (ask which host is used: Apache, Netlify, Cloudflare Pages, etc.).
6. Add hreflang tags and language switcher to the template.

## Open questions to confirm with the user
- Which 10 languages exactly?
- How many pages does the site have (single page or several)?
- Hosting platform (determines redirect mechanism)?
- Canonical domain for absolute hreflang URLs?
