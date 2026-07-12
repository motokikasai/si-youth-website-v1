/* ============ i18n ============
 * Pages live at /<lang>/index.html; each one inlines its dictionary as
 * window.I18N (built from the js_* keys of i18n/<lang>.json — see build.js).
 * t() falls back to English so the script still works standalone. */
const I18N = window.I18N || {};
const t = (key, fallback) => (I18N[key] !== undefined ? I18N[key] : fallback);

/* Pages live at /<lang>/ (one level deep) or /v2/<lang>/ (two levels, preview build).
 * Resolve shared root files relative to this script's own src ("../main.js" or
 * "../../main.js") so runtime-injected media works at either depth. */
const ASSET_ROOT = (() => {
  const s = document.querySelector('script[src$="main.js"]');
  return s ? s.getAttribute("src").replace(/main\.js$/, "") : "../";
})();

/* ============ Featured projects: map pins + modal content ============
 * Map pin positions: edit the PIN coordinates in the PROJECTS
 * object near the bottom of this file (values are % of map image).
 * Pin x/y are % of the map image — tune freely. */
const PROJECTS = {
  mideast: {
    x: 17.5, y: 54.3, color: "#d99a33",
    region: t("js_mideast_region", "Middle East"),
    title: t("js_mideast_title", "The Oasis Plan"),
    text: t("js_mideast_text", "LaRouche's fifty-year development plan for Palestine and Israel: nuclear-powered desalination, new water, transport and power infrastructure — peace built on physical development."),
    media: { type: "video", id: "VNoinK0TY7c", thumb: ASSET_ROOT + "assets/yt-thumb-oasis.jpg" }
  },
  africa: {
    x: 14.5, y: 65, color: "#2c8b8b",
    region: t("js_africa_region", "Africa"),
    title: t("js_africa_title", "Transaqua"),
    text: t("js_africa_text", "Water transfer from the Congo River basin to refill Lake Chad — a 2,400 km navigable canal benefiting some 40 million people across 12 nations, with hydropower, irrigation, and inland navigation."),
    media: { type: "video", id: "VNoinK0TY7c", thumb: ASSET_ROOT + "assets/yt-thumb-oasis.jpg" } // demo ID
  },
  samerica: {
    x: 85.4, y: 65.2, color: "#c05b3f",
    region: t("js_samerica_region", "South America"),
    title: t("js_samerica_title", "Chancay Port & Bioceanic Corridor"),
    text: t("js_samerica_text", "The deepest-water port in South America joined to a Pacific–Atlantic rail corridor across Peru and Brazil — 8,000+ direct jobs and a gateway connecting the continent to the World Land-Bridge. (Draft selection — final featured project pending.)"),
    media: { type: "video", id: "VNoinK0TY7c", thumb: ASSET_ROOT + "assets/yt-thumb-oasis.jpg" } // demo ID
  },
  bronx: {
    x: 85.2, y: 43.8, color: "#2e6b4f",
    region: t("js_bronx_region", "The Bronx · New York"),
    title: t("js_bronx_title", "Development Begins at Home"),
    text: t("js_bronx_text", "The youth movement's local organizing hub — the featured Bronx development project will be announced. This marker links the neighborhood to the world."),
    media: { type: "video", id: "VNoinK0TY7c", thumb: ASSET_ROOT + "assets/yt-thumb-oasis.jpg" } // demo ID
  }
};

/* ---------- build map pins ---------- */
const mapFrame = document.getElementById("mapFrame");
Object.entries(PROJECTS).forEach(([key, p], i) => {
  const b = document.createElement("button");
  b.className = "pin";
  b.style.left = p.x + "%";
  b.style.top = p.y + "%";
  b.style.setProperty("--pin-c", p.color);
  b.style.setProperty("--pd", (i * 0.55) + "s");
  b.setAttribute("aria-label", p.title + " — " + p.region);
  b.innerHTML = `<span class="tip">${p.title}</span>`;
  b.addEventListener("click", () => openModal(key));
  mapFrame.appendChild(b);
});

/* ---------- modal ---------- */
const overlay = document.getElementById("modalOverlay");
const modalBox = document.getElementById("modalBox");
let lastFocus = null, currentKey = null;
function openModal(key){
  const p = PROJECTS[key];
  currentKey = key;
  lastFocus = document.activeElement;
  document.getElementById("modalRegion").textContent = p.region;
  document.getElementById("modalTitle").textContent = p.title;
  document.getElementById("modalText").textContent = p.text;
  const media = document.getElementById("modalMedia");
  if(p.media.type === "video"){
    media.innerHTML = ytFacadeHTML(p.media.id, p.title, p.media.thumb);
  } else {
    media.innerHTML = `<div class="ph"><span class="ph-ar">16:9</span><span class="ph-ico">🎬</span><span class="ph-label">${p.media.label}</span><span class="ph-note">${p.media.note}</span></div>`;
  }
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  document.getElementById("modalClose").focus();
}
function closeModal(){
  overlay.classList.remove("open");
  modalBox.classList.remove("modal--video");
  document.body.style.overflow = "";
  document.getElementById("modalMedia").innerHTML = ""; // stop videos
  if(lastFocus) lastFocus.focus();
}
document.getElementById("modalClose").addEventListener("click", closeModal);
overlay.addEventListener("click", e => { if(e.target === overlay) closeModal(); });
document.addEventListener("keydown", e => { if(e.key === "Escape" && overlay.classList.contains("open")) closeModal(); });
document.getElementById("modalGo").addEventListener("click", () => {
  const key = currentKey;
  if(!key) return;
  closeModal();
  activateTab(key);
  document.getElementById("tabs").scrollIntoView({behavior:"smooth", block:"start"});
});

/* ---------- signup: conference-highlights video modal ----------
   Video-only variant of the project modal; same two-click GDPR flow — opening the
   modal shows the local thumbnail facade, nothing loads from Google until the
   facade itself is clicked. */
const HIGHLIGHTS = {
  id: "40gKXu-rpm0",
  title: t("js_highlights_title", "International Online Youth Conference — Young People of the World, Unite!"),
  thumb: ASSET_ROOT + "assets/yt-thumb-youth.jpg"
};
function openVideoModal(v){
  currentKey = null;
  lastFocus = document.activeElement;
  document.getElementById("modalTitle").textContent = v.title; // feeds aria-labelledby while the body stays hidden
  document.getElementById("modalMedia").innerHTML = ytFacadeHTML(v.id, v.title, v.thumb);
  modalBox.classList.add("modal--video");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  document.getElementById("modalClose").focus();
}
document.querySelectorAll(".js-highlights").forEach(el => el.addEventListener("click", () => openVideoModal(HIGHLIGHTS)));

/* ---------- tabs ---------- */
const tabBtns = document.querySelectorAll(".tab-btn");
function activateTab(key){
  tabBtns.forEach(b => {
    const on = b.dataset.tab === key;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on);
  });
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === "panel-" + key));
}
tabBtns.forEach(b => b.addEventListener("click", () => activateTab(b.dataset.tab)));

/* ---------- hero: title word-stagger + starfield ---------- */
const h1 = document.getElementById("heroTitle");
(() => {
  // wrap each word (preserving the <em> segment) for staggered reveal
  const wrapWords = (node) => {
    [...node.childNodes].forEach(child => {
      if(child.nodeType === 3){
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(tok => {
          if(/^\s*$/.test(tok)){ frag.appendChild(document.createTextNode(tok)); return; }
          const s = document.createElement("span");
          s.className = "w"; s.textContent = tok;
          frag.appendChild(s);
        });
        node.replaceChild(frag, child);
      } else if(child.nodeType === 1){ wrapWords(child); }
    });
  };
  wrapWords(h1);
  h1.querySelectorAll(".w").forEach((w,i) => w.style.setProperty("--i", i));
})();

const stars = document.getElementById("stars");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!reduceMotion){
  for(let i = 0; i < 90; i++){
    const s = document.createElement("i");
    const size = Math.random() * 2.2 + .8;
    s.style.width = s.style.height = size + "px";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 72 + "%";
    s.style.setProperty("--d", (2.5 + Math.random() * 5) + "s");
    s.style.setProperty("--dl", (Math.random() * 6) + "s");
    s.style.setProperty("--o", .35 + Math.random() * .6);
    stars.appendChild(s);
  }
}

/* ---------- nav: solid on scroll, burger, scrollspy ---------- */
const nav = document.getElementById("nav");
const onNavScroll = () => nav.classList.toggle("solid", window.scrollY > 8);
window.addEventListener("scroll", onNavScroll, { passive: true });
onNavScroll();

const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
burger.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

const spyLinks = [...navLinks.querySelectorAll("a[href^='#']")].filter(a => a.getAttribute("href").length > 1);
const spyMap = new Map(spyLinks.map(a => [a.getAttribute("href").slice(1), a]));
(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        spyLinks.forEach(a => a.classList.remove("active"));
        const link = spyMap.get(e.target.id);
        if(link) link.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  spyMap.forEach((_, id) => { const el = document.getElementById(id); if(el) obs.observe(el); });
})();

/* ---------- scroll reveals ---------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); revealObs.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));
if(reduceMotion) document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));

/* ---------- misc ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();
/* ---------- video consent facades (GDPR two-click) ----------
   No request goes to Google until the visitor clicks a facade. The first click counts
   as consent for that provider's embeds site-wide: the consent notices disappear from
   that provider's other facades, and the choice is remembered in localStorage. Storing
   the visitor's own consent decision is "strictly necessary" under the ePrivacy rules,
   so it needs no consent of its own — and it is not a cookie (nothing is sent to any
   server). Providers: YouTube (data-yt-id) and Google Drive (data-embed-src). */
const CONSENT_KEYS = { yt: "yt-embed-consent", drive: "drive-embed-consent" };
const providerOf = (facade) => facade.dataset.embedSrc ? "drive" : "yt";
function hasConsent(provider){
  try { return localStorage.getItem(CONSENT_KEYS[provider]) === "granted"; } catch(e){ return false; }
}
function grantConsent(provider){
  try { localStorage.setItem(CONSENT_KEYS[provider], "granted"); } catch(e){ /* private mode etc. — session-only */ }
  document.querySelectorAll(".yt-facade").forEach(f => {
    if(providerOf(f) !== provider) return;
    const n = f.querySelector(".yt-consent");
    if(n) n.remove();
  });
}
function ytFacadeHTML(id, title, thumb){
  const notice = hasConsent("yt") ? "" :
    `<span class="yt-consent">${t("js_consent_html", `▶ Click to play — video loads from YouTube (Google). <a href="${ASSET_ROOT}privacy.html">Privacy</a>`)}</span>`;
  const playAria = t("js_play_aria", "Play: {title}. Loads the video from YouTube.").replace("{title}", title);
  return `<div class="video-embed yt-facade" data-yt-id="${id}" data-yt-title="${title}" role="button" tabindex="0" aria-label="${playAria}">
    <img src="${thumb}" alt="" loading="lazy" decoding="async">
    <span class="yt-play" aria-hidden="true"><i>▶</i></span>
    ${notice}
  </div>`;
}
function loadYt(facade){
  const provider = providerOf(facade);
  const title = facade.dataset.ytTitle || t("js_yt_title", "YouTube video");
  const wrap = document.createElement("div");
  wrap.className = "video-embed";
  const iframe = document.createElement("iframe");
  iframe.src = provider === "drive"
    ? facade.dataset.embedSrc // Google Drive player URL (…/preview), stated in the markup
    : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(facade.dataset.ytId)}?autoplay=1`;
  iframe.title = title;
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  wrap.appendChild(iframe);
  facade.replaceWith(wrap);
  grantConsent(provider);
}
document.addEventListener("click", e => {
  const f = e.target.closest(".yt-facade");
  if(f && !e.target.closest("a")) loadYt(f);
});
document.addEventListener("keydown", e => {
  if((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("yt-facade")){
    e.preventDefault(); loadYt(e.target);
  }
});

const toast = document.getElementById("toast");
let toastTimer;
function draftToast(e){
  e.preventDefault();
  if(!toast) return; // toast element is currently commented out in the template
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* draft links/forms — placeholders until real destinations exist (bound here, not inline, for CSP) */
document.querySelectorAll(".js-draft").forEach(el => el.addEventListener("click", draftToast));
document.querySelectorAll("form.signup-form").forEach(f => f.addEventListener("submit", draftToast));

/* returning visitor who already consented: show plain play buttons, no notices */
Object.keys(CONSENT_KEYS).forEach(p => { if(hasConsent(p)) grantConsent(p); });

/* ---------- language switcher ----------
   Remember an explicit choice so the root detector (/index.html) respects it
   on the next visit instead of re-guessing from the browser language. */
document.querySelectorAll(".lang-switch a, .foot-langs a").forEach(a => {
  a.addEventListener("click", () => {
    try { localStorage.setItem("site-lang", a.getAttribute("lang")); } catch(e){ /* private mode */ }
  });
});
const langSwitch = document.getElementById("langSwitch");
if(langSwitch){
  document.addEventListener("click", e => {
    if(langSwitch.open && !langSwitch.contains(e.target)) langSwitch.removeAttribute("open");
  });
  document.addEventListener("keydown", e => {
    if(e.key === "Escape" && langSwitch.open) langSwitch.removeAttribute("open");
  });
}
