# Deployment Guide

A fully static, **10-language** site (see `BUILD.md` for how pages are generated) —
run `node build.js`, then upload everything in this folder except `serve.sh`,
`build.js`, `templates/`, `i18n/` and the `*.md` files (they are harmless but
unnecessary) to any static host: Cloudflare Pages, Netlify, GitHub Pages, or classic
hosting. **HTTPS is required** (YouTube embeds need a real HTTPS origin to play).

The root `/` auto-detects the browser language via JavaScript and redirects to
`/en/ … /zh/` — no server configuration needed (see BUILD.md § auto-detection).

## 1. Domain

Current canonical domain: **`https://youth.schillerinstitute.com`** (working decision,
2026-07 — a subdomain of the parent org). If it changes:

| File | What to do |
|---|---|
| `build.js` | change the `ORIGIN` constant, run `node build.js` (regenerates all canonical/hreflang/OG URLs and `sitemap.xml`) |
| `robots.txt` | update the `Sitemap:` line |
| `privacy.html` | update the canonical URL |
| `impressum.html` | update the canonical URL |

## 2. Headers

`_headers` works out of the box on Netlify and Cloudflare Pages (security headers + caching).
On Apache/Nginx, port the same values to `.htaccess` / server config. Notes:
- Do **not** set `Referrer-Policy: no-referrer` — YouTube embeds stop working.
- The CSP allows frames only from `youtube-nocookie.com` and scripts/styles/fonts/images
  only from this site itself.

## 3. Before real launch (content checklist)

- [ ] Replace draft `#` links (WhatsApp group, EIR subscription, highlights video) — they
      currently show a "draft" toast; remove the `js-draft` class when wiring real URLs.
- [ ] Remove the "Draft site" note in the footer and the hero placeholder badge.
- [ ] Fill the ⬡ placeholder blocks in `privacy.html` and `impressum.html`
      (legal review recommended) and set the "last updated" date.
- [ ] Wire the sign-up form to a backend/list service; keep the consent checkbox; add a
      honeypot field for spam if the service doesn't provide one.
- [ ] Swap placeholder tiles (marked with dashed outlines) as final assets arrive.
- [ ] Hero video: drop `assets/hero-landbridge.mp4`, uncomment the `<video>` tag in
      `templates/index.template.html`, rebuild.
- [ ] Have native speakers review the machine-drafted translations in `i18n/`.
- [ ] `sitemap.xml` `<lastmod>` updates automatically on every `node build.js`.

## 4. After launch (verification)

- Share-card check: paste the URL into https://www.opengraph.xyz/ (or LinkedIn Post
  Inspector / X card validator) — should show the earth night image card.
- Search Console: submit `sitemap.xml`.
- Lighthouse run (Chrome DevTools) — performance/SEO/accessibility should all be green;
  the site is ~600 KB fully loaded with no third-party requests until a video is clicked.
- Confirm the YouTube facade: no requests to any google/youtube domain appear in the
  network tab until a video is clicked.

## GDPR summary (current state)

- No cookies, no analytics, self-hosted fonts → **no cookie banner needed**.
- YouTube loads only after an explicit click (two-click consent facade).
- Sign-up form has an unticked consent checkbox; backend still to be wired.
- `privacy.html` / `impressum.html` are scaffolds — finalize before launch.
- If analytics are ever added, prefer Plausible/Matomo (cookieless) to keep the
  no-banner status; Google Analytics would require a consent banner.
