// Speed pass for every page (2026-11-09). Runs at the end of build-pages.mjs and can be run alone:
//   node optimize-html.mjs
// It rewrites the built HTML in place, and it is safe to run again on already-optimized files
// (index.html is hand-maintained, so it is processed in place too).
//
// What it does to each page:
//   1. Inlines assets/site.css (minified) plus the self-hosted fonts (assets/fonts/fonts.css) in one <style id="site-css">,
//      and drops the Google Fonts links. Edit assets/site.css, then rerun this script to refresh every page.
//   2. Wraps each <img> in <picture> with AVIF + WebP sources from assets/opt/ (built by tools/build-images.py),
//      adds width/height, lazy-loads everything below the hero, and preloads the hero image.
//   3. Moves the third-party scripts into one loader (<script id="tp-loader">):
//        CallRail swap.js   loads when the browser is idle after page load (numbers must swap before a tap)
//        gtag.js (Ads + GA4) and the ServiceTitan scheduler shim load on the first interaction or 3.5 s after load
//        (on /book/ the ServiceTitan shim loads with CallRail, so the scheduler button works on the first tap)
//      The inline gtag() / STWidgetManager() queues stay in the page, so events fired early are kept and sent on load.
//   4. Points the favicon at a small copy of the mascot.
// Anything it cannot optimize is listed in the output. Nothing is skipped silently.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const MANIFEST = JSON.parse(readFileSync("assets/opt/manifest.json", "utf8"));
const GTAG_SRC = "https://www.googletagmanager.com/gtag/js?id=AW-18245522940";
const ST_SHIM = "https://static.servicetitan.com/webscheduler/shim.js";
const LATE_MS = 3500;

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .replace(/:\s+/g, ":")
    .replace(/;}/g, "}")
    .trim();
}
const SITE_CSS = minifyCss(readFileSync("assets/site.css", "utf8"));
const FONT_CSS = minifyCss(readFileSync("assets/fonts/fonts.css", "utf8"));

const report = { pages: 0, skipped: [], imgs: 0, unoptimized: new Set(), missingFiles: new Set(), noHero: [] };

const srcset = (R, e, ext) => e.widths.map((w) => `${R}assets/opt/${e.stem}-${w}.${ext} ${w}w`).join(", ");

function sizesFor(before, attrs, key) {
  const w = attrs.match(/\bwidth="(\d+)"/);
  if (w) return `${w[1]}px`;
  if (/tp-mascot/.test(attrs)) return "112px";
  if (/foot-mascot/.test(attrs)) return "64px";
  if (/hero-mascot/.test(attrs)) return "212px";
  if (/rooterman-wordmark/.test(key)) return "132px";
  const ctx = before.slice(-220);
  const last = (re) => { let m, i = -1; const g = new RegExp(re, "g"); while ((m = g.exec(ctx))) i = m.index; return i; };
  const hits = [
    // Homepage hero sits under a 70-82% dark overlay on phones, so a smaller file is indistinguishable there.
    [last('class="hero-bg"'), "(max-width:760px) 60vw, 100vw"],
    [last('class="(?:hero-img|phero-img)"'), "(max-width:760px) 110vw, 100vw"],
    [last('class="(?:emerg-bg|bg)"'), "(max-width:760px) 110vw, 100vw"],
    [last('class="mascot-col'), "150px"],
    [last('class="van-card'), "(max-width:1040px) 92vw, 520px"],
    [last('class="ph"'), "(max-width:760px) 92vw, (max-width:1040px) 46vw, 280px"],
    [last('class="ph reveal"'), "(max-width:760px) 92vw, 560px"],
    [last('class="shot'), "(max-width:760px) 92vw, 380px"],
  ].filter((h) => h[0] >= 0).sort((a, b) => b[0] - a[0]);
  return hits.length ? hits[0][1] : "(max-width:760px) 92vw, 600px";
}

export function optimizeHtml(html, R, file) {
  if (!/<body/.test(html) || !(/assets\/site\.css/.test(html) || /id="site-css"/.test(html))) { report.skipped.push(file); return html; }
  report.pages++;

  // 1. CSS + fonts inline, Google Fonts out.
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n?/g, "");
  html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>\n?/g, "");
  const style = `<style id="site-css">${FONT_CSS.replaceAll("%FONTS%", R + "assets/fonts/")}${SITE_CSS}</style>`;
  html = html.replace(/<link rel="stylesheet" href="(?:\.\.\/)*assets\/site\.css" ?\/?>|<style id="site-css">[\s\S]*?<\/style>/, () => style);

  // 4. Favicon.
  html = html.replace(/<link rel="icon" type="image\/png" href="(?:\.\.\/)*assets\/client\/rm-mascot\.png" ?\/?>/,
    () => `<link rel="icon" type="image/png" sizes="64x64" href="${R}assets/opt/favicon-64.png" />\n<link rel="apple-touch-icon" href="${R}assets/opt/favicon-180.png" />`);

  // 2. Images.
  // Undo a previous run first, so reruns pick up new image variants, sizes and dimensions.
  html = html.replace(/<picture><source [^>]*><source [^>]*><img([^>]*?) \/><\/picture>/g, (tag, attrs) => {
    const o = attrs.match(/ data-o="([^"]+)"/);
    if (!o) return tag;
    let a = attrs.replace(/\bsrc="[^"]+"/, `src="${R}${o[1]}"`).replace(/ fetchpriority="high"| loading="lazy"| decoding="async"| data-o="[^"]+"/g, "");
    if (/ data-a\b/.test(a)) a = a.replace(/ width="\d+" height="\d+" data-a/, "");
    return `<img${a} />`;
  });
  const heroEnd = html.indexOf("</section>");
  let preload = "";
  html = html.replace(/<img\b([^>]*?)\s*\/?>/g, (tag, attrs, idx) => {
    const m = attrs.match(/\bsrc="((?:\.\.\/)*)(assets\/[^"]+)"/);
    const e = m && MANIFEST[m[2]];
    if (!e) { report.unoptimized.add(m ? m[2] : tag.slice(0, 80)); return tag; }
    for (const w of e.widths) for (const ext of ["avif", "webp"]) if (!existsSync(`assets/opt/${e.stem}-${w}.${ext}`)) report.missingFiles.add(`${e.stem}-${w}.${ext}`);
    if (!existsSync(`assets/opt/${e.fallback}`)) report.missingFiles.add(e.fallback);
    const before = html.slice(0, idx);
    const sizes = sizesFor(before, attrs, m[2]);
    const inHero = heroEnd < 0 || idx < heroEnd;
    const isLcp = !preload && /class="(?:hero-bg|hero-img|phero-img)"[^<]*$/.test(before.slice(-120));
    let a = attrs.replace(/\bsrc="[^"]+"/, `src="${R}assets/opt/${e.fallback}"`).replace(/\s*\bloading="[^"]*"/, "");
    if (!/\bwidth=/.test(a)) a += ` width="${e.w}" height="${e.h}" data-a`;
    a += isLcp ? ' fetchpriority="high"' : inHero ? "" : ' loading="lazy"';
    a += ` decoding="async" data-o="${m[2]}"`;
    if (isLcp) preload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${srcset(R, e, "avif")}" imagesizes="${sizes}" fetchpriority="high" data-opt />`;
    report.imgs++;
    return `<picture><source type="image/avif" srcset="${srcset(R, e, "avif")}" sizes="${sizes}" /><source type="image/webp" srcset="${srcset(R, e, "webp")}" sizes="${sizes}" /><img${a} /></picture>`;
  });
  if (preload) {
    html = html.replace(/<link rel="preload" as="image"[^>]*data-opt[^>]*>\n?/g, "");
    html = html.replace(/(<meta name="viewport"[^>]*>\n?)/, (x) => x + preload + "\n");
  } else if (!/<link rel="preload" as="image"[^>]*data-opt/.test(html)) report.noHero.push(file);

  // 3. Third parties: keep the queues inline, load the scripts from one loader.
  html = html.replace(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=AW-18245522940"><\/script>\n?/, "");
  html = html.replace(/<script>\s*\(function\(q,w,e,r,t,y,u\)\{[\s\S]*?q\[t\]\('init','([0-9a-f-]+)'\);[\s\S]*?'STWidgetManager'\);\s*<\/script>/,
    (_, token) => `<script>window.STWidgetManager=window.STWidgetManager||function(){(STWidgetManager.q=STWidgetManager.q||[]).push(arguments)};STWidgetManager.l=1*new Date();STWidgetManager('init','${token}');</script>`);
  let callrail = "";
  html = html.replace(/<script type="text\/javascript" src="(?:https:)?(\/\/cdn\.callrail\.com\/companies\/[^"]+\/swap\.js)"><\/script>\n?/, (_, p) => { callrail = "https:" + p; return ""; });
  const old = html.match(/<script id="tp-loader" data-callrail="([^"]*)">[\s\S]*?<\/script>\n?/);
  if (old) { callrail = callrail || old[1]; html = html.replace(old[0], ""); }
  const hasSt = /STWidgetManager\('init'/.test(html);
  // On /book/ the scheduler button is the point of the page: load the shim with the idle group so the first tap opens it.
  const stEarly = hasSt && /id="stopen"/.test(html);
  const loader = `<script id="tp-loader" data-callrail="${callrail}">(function(){var w=window,d=document,late=0,cr=0;` +
    `function add(s){var e=d.createElement('script');e.async=true;e.src=s;d.head.appendChild(e)}` +
    `function callrail(){if(cr)return;cr=1;${callrail ? `add('${callrail}');` : ""}${stEarly ? `add('${ST_SHIM}');` : ""}}` +
    `function go(){if(late)return;late=1;callrail();add('${GTAG_SRC}');${hasSt && !stEarly ? `add('${ST_SHIM}');` : ""}}` +
    `['pointerdown','touchstart','keydown','scroll','mousemove'].forEach(function(t){w.addEventListener(t,go,{once:true,passive:true,capture:true})});` +
    `function ready(){(w.requestIdleCallback||function(f){setTimeout(f,200)})(callrail,{timeout:1500});setTimeout(go,${LATE_MS})}` +
    `if(d.readyState==='complete')ready();else w.addEventListener('load',ready)})();</script>\n`;
  html = html.replace(/<\/body>/, () => loader + "</body>");
  return html;
}

function walk(dir, out = []) {
  for (const n of readdirSync(dir)) {
    if (n.startsWith(".") || n === "node_modules" || n === "assets" || n === "research" || n === "tools") continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (n === "index.html") out.push(p);
  }
  return out;
}

for (const file of walk(".")) {
  const depth = file.split("/").length - 1;
  const src = readFileSync(file, "utf8");
  const out = optimizeHtml(src, "../".repeat(depth), file);
  if (out !== src) writeFileSync(file, out);
}
console.log(`optimize: ${report.pages} pages, ${report.imgs} images rewritten, ${report.skipped.length} files skipped (redirect stubs, no site.css)`);
if (report.unoptimized.size) console.log("optimize: LEFT AS IS (no variant in assets/opt, run tools/build-images.py):", [...report.unoptimized].join(", "));
if (report.noHero.length) console.log("optimize: no hero image to preload on:", report.noHero.join(", "));
if (report.missingFiles.size) { console.error("optimize: MISSING image files:", [...report.missingFiles].join(", ")); process.exit(1); }
