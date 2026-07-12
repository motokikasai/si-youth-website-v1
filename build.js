#!/usr/bin/env node
/* ============================================================
 * Multilingual site builder — zero dependencies. See BUILD.md.
 *
 *   node build.js        (or: npm run build)
 *
 * Renders templates/index.template.html once per language in
 * i18n/, and generates:
 *   /<lang>/index.html   one page per language
 *   /index.html          root language detector (JS redirect)
 *   /sitemap.xml         all languages + hreflang alternates
 * ============================================================ */
"use strict";
const fs = require("fs");
const path = require("path");

/* ---- configuration ------------------------------------------------ */
// Canonical domain (no trailing slash). Used for canonical, hreflang,
// Open Graph and sitemap URLs. Change it here and re-run the build.
const ORIGIN = "https://youth.schillerinstitute.com";

// Language order here = order in the language switcher and footer.
const LANGS = ["en", "es", "fr", "pt", "de", "ar", "da", "it", "ja", "zh"];
const DEFAULT_LANG = "en"; // also the hreflang x-default target

/* ---- helpers ------------------------------------------------------ */
const ROOT = __dirname;
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);

// {{key}} substitution; throws on unknown keys so typos fail the build.
function render(template, vars, label) {
  const missing = new Set();
  const out = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) return vars[key];
    missing.add(key);
    return "";
  });
  if (missing.size) {
    throw new Error(`[${label}] missing key(s): ${[...missing].join(", ")}`);
  }
  return out;
}

function hreflangLinks() {
  const lines = LANGS.map(
    (l) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l}/">`
  );
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${ORIGIN}/${DEFAULT_LANG}/">`
  );
  return lines.join("\n");
}

/* ---- load inputs --------------------------------------------------- */
const template = read("templates/index.template.html");
const redirectTemplate = read("templates/redirect.template.html");
// Optional v2 preview of the redesigned Sign-Up section: if the v2 template
// exists it is additionally rendered to /v2/<lang>/ (noindex, not in the
// sitemap) so old and new can be compared side by side. See BUILD.md.
const V2_TEMPLATE = "templates/index.template.v2.html";
const templateV2 = fs.existsSync(path.join(ROOT, V2_TEMPLATE)) ? read(V2_TEMPLATE) : null;
const dicts = {};
for (const lang of LANGS) {
  dicts[lang] = JSON.parse(read(`i18n/${lang}.json`));
}

/* ---- per-language pages -------------------------------------------- */
const templateKeys = new Set(
  [...(template + (templateV2 || "")).matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
);
const computedKeys = new Set([
  "lang", "dir", "origin", "lang_upper", "lang_native", "lang_label",
  "hreflang_links", "lang_menu", "footer_langs", "i18n_json",
]);

for (const lang of LANGS) {
  const dict = dicts[lang];

  // nav dropdown + footer language rows (relative ../xx/ works from any /xx/)
  const langMenu = LANGS.map((l) => {
    const current = l === lang ? ' class="current" aria-current="true"' : "";
    return `<li><a href="../${l}/" lang="${l}" hreflang="${l}"${current}>${dicts[l].lang_native}</a></li>`;
  }).join("\n      ");
  const footerLangs = LANGS.map((l) => {
    const current = l === lang ? ' class="current" aria-current="true"' : "";
    return `<a href="../${l}/" lang="${l}" hreflang="${l}"${current}>${dicts[l].lang_native}</a>`;
  }).join("\n      ");

  // js_* keys are exposed to main.js as window.I18N
  const jsStrings = {};
  for (const key of Object.keys(dict)) {
    if (key.startsWith("js_")) jsStrings[key] = dict[key];
  }

  const vars = {
    ...dict,
    lang,
    origin: ORIGIN,
    lang_upper: lang.toUpperCase(),
    hreflang_links: hreflangLinks(),
    lang_menu: langMenu,
    footer_langs: footerLangs,
    i18n_json: JSON.stringify(jsStrings).replace(/</g, "\\u003c"), // safe inside <script>
  };

  // warn (don't fail) about dictionary keys the template never uses
  const unused = Object.keys(dict).filter(
    (k) => !templateKeys.has(k) && !computedKeys.has(k) && !k.startsWith("js_")
  );
  if (unused.length) {
    console.warn(`⚠ ${lang}.json has unused key(s): ${unused.join(", ")}`);
  }

  fs.mkdirSync(path.join(ROOT, lang), { recursive: true });
  write(`${lang}/index.html`, render(template, vars, `${lang}/index.html`));

  if (templateV2) {
    // v2 pages sit one level deeper (/v2/<lang>/). The v2 template already uses
    // ../../ itself; dictionary strings, however, reference root files as ../
    // (correct for /<lang>/) — bump only those. Language links (../es/ …) must
    // stay untouched: relative to /v2/en/ they correctly stay inside /v2/.
    const html = render(templateV2, vars, `v2/${lang}/index.html`).replace(
      /(["'(]|\\")\.\.\/(assets\/|styles\.css|main\.js|privacy\.html|impressum\.html)/g,
      "$1../../$2"
    );
    fs.mkdirSync(path.join(ROOT, "v2", lang), { recursive: true });
    write(`v2/${lang}/index.html`, html);
  }
}

/* ---- root language detector ---------------------------------------- */
const plainLinks = LANGS.map(
  (l) => `<li><a href="${l}/" lang="${l}" hreflang="${l}">${dicts[l].lang_native}</a></li>`
).join("\n    ");
write(
  "index.html",
  render(
    redirectTemplate,
    {
      origin: ORIGIN,
      default_lang: DEFAULT_LANG,
      langs_json: JSON.stringify(LANGS),
      hreflang_links: hreflangLinks(),
      plain_links: plainLinks,
    },
    "index.html"
  )
);

/* ---- sitemap -------------------------------------------------------- */
const today = new Date().toISOString().slice(0, 10);
const xhtmlAlternates = LANGS.map(
  (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGIN}/${l}/"/>`
)
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/${DEFAULT_LANG}/"/>`)
  .join("\n");
const urls = LANGS.map(
  (l) => `  <url>
    <loc>${ORIGIN}/${l}/</loc>
${xhtmlAlternates}
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${l === DEFAULT_LANG ? "1.0" : "0.9"}</priority>
  </url>`
).join("\n");
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<!-- GENERATED by build.js — do not edit by hand -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`
);

console.log(`✓ built ${LANGS.length} language pages (${LANGS.join(", ")})`);
if (templateV2) console.log(`✓ built /v2/ preview pages (redesigned Sign-Up section, noindex)`);
console.log(`✓ built index.html (root language detector) and sitemap.xml`);
console.log(`  canonical origin: ${ORIGIN}`);
