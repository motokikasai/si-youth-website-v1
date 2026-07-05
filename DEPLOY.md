# Deployment Guide

A fully static site — upload everything in this folder (except `serve.sh` and this file,
which are harmless but unnecessary) to any static host: Cloudflare Pages, Netlify,
GitHub Pages, or classic hosting. **HTTPS is required** (YouTube embeds need a real
HTTPS origin to play).

## 1. When the domain is confirmed

Search & replace **`PLACEHOLDER-DOMAIN.example`** with the real domain (no trailing slash
changes needed — occurrences include the scheme). It appears in:

| File | What it affects |
|---|---|
| `index.html` | canonical URL, Open Graph / Twitter URLs + social card image, JSON-LD |
| `privacy.html` | canonical URL |
| `impressum.html` | canonical URL |
| `robots.txt` | sitemap pointer |
| `sitemap.xml` | page URL |

One-liner (run in the site folder):

```sh
grep -rl 'PLACEHOLDER-DOMAIN.example' . | xargs sed -i 's/PLACEHOLDER-DOMAIN.example/your-real-domain.org/g'
```

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
      `index.html`.
- [ ] Update `sitemap.xml` `<lastmod>` when content changes meaningfully.

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
