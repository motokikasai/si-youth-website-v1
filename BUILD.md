# Building the multilingual site

The site ships in **10 languages** (en, es, fr, pt, de, ar, da, it, ja, zh). The
language pages under `/en/ … /zh/` are **generated — never edit them by hand.**

## TL;DR

```sh
node build.js        # or: npm run build   (Node ≥ 14, no dependencies)
./serve.sh           # preview at http://localhost:8080
```

Run the build after editing anything in `templates/` or `i18n/`, and commit the
regenerated output together with your change.

## What edits what

| You want to change… | Edit this | Then |
|---|---|---|
| Text in one language | `i18n/<lang>.json` | `node build.js` |
| Page structure / markup (all languages) | `templates/index.template.html` | `node build.js` |
| The root auto-detect page | `templates/redirect.template.html` | `node build.js` |
| The canonical domain | `ORIGIN` constant at top of `build.js` | `node build.js`, then update `robots.txt`, `privacy.html`, `impressum.html` (3 files, not generated) |
| Add/remove a language | `LANGS` in `build.js` + add `i18n/<lang>.json` | `node build.js`, add a `/<lang>/*` block to `_headers` |
| Shared styling / behavior | `styles.css` / `main.js` (root, shared by all languages) | nothing to rebuild |

## How it works

- `templates/index.template.html` contains `{{placeholders}}`; each
  `i18n/<lang>.json` is a flat key→string map. `build.js` renders the template
  once per language into `/<lang>/index.html`. A missing key **fails the
  build** (typo protection); unused keys only print a warning.
- Keys prefixed `js_` are additionally inlined into each page as
  `window.I18N`, which `main.js` reads for the strings it injects at runtime
  (map-pin modals, YouTube consent notices, aria-labels).
- Each page gets `<html lang dir>`, a canonical URL, and the full
  `hreflang` alternate set (plus `x-default` → `/en/`) automatically.
- `sitemap.xml` (all 10 URLs with alternates) and the root `index.html` are
  also generated on every build.

## Language auto-detection (root `/`)

`/index.html` is a tiny detector page (noindex): it checks `localStorage`
for a previously chosen language (the switcher stores one), otherwise matches
`navigator.languages` against the supported list, then redirects to `/<lang>/`,
falling back to `/en/`. With JavaScript disabled, a `<noscript>` meta-refresh
sends visitors to `/en/`, and the page body shows plain language links.

No server configuration is required. If the host is decided later, a
server-side 302 (`.htaccess` `RedirectMatch`, or a `_redirects` file with
`Accept-Language` rules on Netlify/Cloudflare) can replace the detector page.

## Arabic (RTL)

`ar.json` sets `"dir": "rtl"`, which becomes `<html dir="rtl">`. The
stylesheet uses CSS logical properties, so the layout mirrors automatically;
an `[dir="rtl"]` section at the bottom of `styles.css` handles the rest
(Arabic font fallbacks, no letter-spacing, mirrored decorations,
Arabic-Indic numerals). Direction-sensitive arrows (→ ↗) are already
mirrored inside the Arabic strings — keep that in mind when editing them.

## Translation notes

- Values may contain inline HTML (`<em>`, `<b>`, links) where the English
  original does — keep the tags, translate the text.
- `{title}` in `js_play_aria` is substituted at runtime — keep it verbatim.
- Keys ending in `_aria` are screen-reader labels; `og_*`/`twitter_*`/`meta_*`
  feed social cards and search results (plain text, no HTML).
- The 9 non-English files were machine-drafted (2026-07) and should get a
  native-speaker review before launch.
