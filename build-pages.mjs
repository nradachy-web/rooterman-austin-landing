#!/usr/bin/env node
/**
 * Generates service + city landing pages for Rooter-Man of Austin.
 * Shared chrome mirrors index.html; styles in assets/site.css.
 * Run: node build-pages.mjs
 */
import { writeFileSync, mkdirSync } from "fs";

const R = "../"; // generated pages live one level deep

const BASE = "https://rootermanofaustin.com/";
const PHONE_DISPLAY = "(512) 645-1441";
const PHONE_TEL = "tel:+15126451441";
const SMS_URL = "sms:+15126451441";
// Secondary CTA. The old Scorpion booking overlay is gone with the Scorpion site.
// Interim = text-to-schedule. Swap to the client's ServiceTitan Scheduling Pro
// scheduler (data-api-key + data-schedulerid) or book.servicetitan.com link when provided.
const BOOK_URL = R + "book/";
const GOOGLE_REVIEWS = "https://www.google.com/search?q=Rooter-Man+Plumbing+Austin+TX+15503+Patrica+St+reviews";
const YELP_REVIEWS = "https://www.yelp.com/biz/rooterman-plumbing-austin";

const PHONE_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>`;
const CHECK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const PIN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

const REVIEWS = {
  james:  { q: "Efficient, professional, and friendly. Cleared our slow kitchen drain easily, with a transparent up-front estimate and no upsell pressure.", who: "James L." },
  karen:  { q: "Eddie arrived quickly. He is extremely knowledgeable, friendly, and the prices are awesome for the quality of repairs. I'm never using another plumber.", who: "Karen D." },
  gabe:   { q: "Josh and his team did a great job replacing our water heater. We called on a Saturday, and by Sunday afternoon we had a new water heater installed. Thank you!", who: "Gabe R." },
  william:{ q: "Eddie made time and came over the same day. He was thorough in diagnosing my water heater issue and finding its root cause. If I ever have a plumbing issue, I'm definitely calling Rooter-Man.", who: "William N." },
  katie:  { q: "Highly recommend. Joshua explained everything very clearly and gave great advice. He updated our water heater so it was to code, and the work was great!", who: "Katie G." },
  aragon: { q: "Eddie was honest and explained everything. I had a corroded shower faucet and he quickly diagnosed and replaced it. Money well spent to avoid a major pipe bust.", who: "Aragon A." },
  leyna:  { q: "Eddie did an amazing job installing four faucets. Thorough, friendly, and efficient from start to finish. He left everything clean and neat, and the results look fantastic.", who: "Leyna O." },
  pankaj: { q: "Josh was excellent. He was thorough and knowledgeable and knew exactly what he needed to do to fix the problem.", who: "Pankaj C." },
  adam:   { q: "Joshua was very transparent about the whole process. He assured us the problem would be resolved.", who: "Adam G." },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function head(title, desc, slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18245522940"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-18245522940');
</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${BASE}${slug}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<link rel="icon" type="image/png" href="${R}assets/client/rm-mascot.png" />
<link rel="stylesheet" href="${R}assets/site.css" />
</head>
<body>`;
}

const UTIL = `
<div class="util">
  <div class="wrap">
    <div class="left"><span>Licensed Austin Plumbers Since 2012</span><span class="sep">·</span><span>License M40109</span><span class="sep">·</span><span>Same-Day Scheduling</span><span class="sep">·</span><span>Hablamos Español</span></div>
    <div class="right">Call: <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a></div>
  </div>
</div>`;

const HEADER = `
<header id="hdr">
  <div class="wrap nav">
    <a class="brand" href="${R}" aria-label="Rooter-Man of Austin"><img src="${R}assets/client/rooterman-wordmark.png" alt="Rooter-Man of Austin — To the Rescue" style="height:40px" /></a>
    <nav class="nav-links">
      <div class="has-menu">
        <a href="${R}#services">Services</a>
        <div class="menu" role="menu">
        <a href="${R}drain-cleaning/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg></span><span class="label"><span class="t">Drain Cleaning</span><span class="d">Clogs, hydro jetting, camera inspection</span></span></a>
        <a href="${R}water-heaters/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="4"/><path d="M9 7h6M12 13v4"/></svg></span><span class="label"><span class="t">Water Heaters</span><span class="d">Tank &amp; tankless. $100 off install</span></span></a>
        <a href="${R}plumbing-repair/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.06 5.06L3 18v3h3l6.64-6.64a4 4 0 0 0 5.06-5.06L15 12l-3-3 2.7-2.7Z"/></svg></span><span class="label"><span class="t">Plumbing Repair</span><span class="d">Leaks, pressure, fixtures, repipes</span></span></a>
        <a href="${R}sewer-septic/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M6 18V9a6 6 0 0 1 12 0v9M12 3v3"/></svg></span><span class="label"><span class="t">Sewer &amp; Septic</span><span class="d">Trenchless repair &amp; septic pumping</span></span></a>
        <a href="${R}emergency-plumber/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><span class="label"><span class="t">Emergency Plumber</span><span class="d">Answered 24/7, first-available dispatch</span></span></a>
        <a href="${R}commercial-plumbing/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1M10 21v-4h4v4"/></svg></span><span class="label"><span class="t">Commercial Plumbing</span><span class="d">Restaurants, offices, multi-unit</span></span></a>
        </div>
      </div>
      <div class="has-menu">
        <a href="${R}#areas">Service Areas</a>
        <div class="menu menu-areas" role="menu">
        <a href="${R}#areas"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Austin</span></span></a>
        <a href="${R}plumber-cedar-park/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Cedar Park</span></span></a>
        <a href="${R}plumber-round-rock/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Round Rock</span></span></a>
        <a href="${R}plumber-georgetown/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Georgetown</span></span></a>
        <a href="${R}plumber-pflugerville/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Pflugerville</span></span></a>
        <a href="${R}plumber-leander/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Leander</span></span></a>
        <a href="${R}plumber-lakeway/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Lakeway</span></span></a>
        <a href="${R}plumber-hutto/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Hutto</span></span></a>
        <a href="${R}plumber-brushy-creek/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Brushy Creek</span></span></a>
        <a href="${R}plumber-wells-branch/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">Wells Branch</span></span></a>
        </div>
      </div>
      <a href="${R}#reviews">Reviews</a>
      <a href="${R}#coupons">Coupons</a>
      <a href="${R}#faq">FAQ</a>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-book" href="${PHONE_TEL}">${PHONE_SVG} ${PHONE_DISPLAY}</a>
      <a class="btn btn-ghost" href="${BOOK_URL}" onclick="STWidgetManager('ws-open');return false;">Book Online</a>
      <button class="nav-toggle" aria-label="Open menu" aria-expanded="false"><span class="bars"></span></button>
    </div>
  </div>
</header>

<!-- MOBILE MENU -->
<div class="mobile-menu" role="dialog" aria-label="Menu">
  <button class="close-x" aria-label="Close menu">✕</button>
  <nav>
    <div class="grp">Services</div>
      <a href="${R}drain-cleaning/">Drain Cleaning <span aria-hidden="true">→</span></a>
      <a href="${R}water-heaters/">Water Heaters <span aria-hidden="true">→</span></a>
      <a href="${R}plumbing-repair/">Plumbing Repair <span aria-hidden="true">→</span></a>
      <a href="${R}sewer-septic/">Sewer &amp; Septic <span aria-hidden="true">→</span></a>
      <a href="${R}emergency-plumber/">Emergency Plumber <span aria-hidden="true">→</span></a>
      <a href="${R}commercial-plumbing/">Commercial Plumbing <span aria-hidden="true">→</span></a>
    <div class="grp">Service Areas</div>
      <a href="${R}#areas">Austin <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-cedar-park/">Cedar Park <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-round-rock/">Round Rock <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-georgetown/">Georgetown <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-pflugerville/">Pflugerville <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-leander/">Leander <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-lakeway/">Lakeway <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-hutto/">Hutto <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-brushy-creek/">Brushy Creek <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-wells-branch/">Wells Branch <span aria-hidden="true">→</span></a>
    <div class="grp">More</div>
    <a href="${R}#reviews">Reviews <span aria-hidden="true">→</span></a>
    <a href="${R}#coupons">Coupons <span aria-hidden="true">→</span></a>
    <a href="${R}#faq">FAQ <span aria-hidden="true">→</span></a>
  </nav>
  <div class="mobile-foot">
    <a class="phone" href="tel:+15126451441">(512) 645-1441</a>
    <a class="btn btn-book" href="${BOOK_URL}" onclick="STWidgetManager('ws-open');return false;">Book Online</a>
  </div>
</div>`;

const TRUSTBAR = `
<div class="trustbar">
  <div class="wrap">
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg></div><b>Licensed M40109</b><span>Texas-licensed plumbing pros</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg></div><b>Local Since 2012</b><span>Family-owned in Greater Austin</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><b>Same-Day Scheduling</b><span>On the schedule today when we can</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><b>Warranty-Backed</b><span>Every job stands behind our guarantee</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 12h6"/></svg></div><b>Hablamos Español</b><span>Full bilingual service</span></div>
  </div>
</div>`;

const STEPS = `
<section>
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">How it works</span>
      <h2>Simple, honest, same-day when we can.</h2>
    </div>
    <div class="steps">
      <div class="step reveal"><div class="n">1</div><h3>Call Us</h3><p>Our line is answered around the clock at ${PHONE_DISPLAY}. Tell us what is going on and we give you the next available options, often same-day.</p></div>
      <div class="step reveal"><div class="n">2</div><h3>Upfront Diagnosis &amp; Pricing</h3><p>A licensed plumber inspects the real problem and explains it plainly, English or Spanish. You see the price before any work begins. No surprises, no upsell pressure.</p></div>
      <div class="step reveal"><div class="n">3</div><h3>The Job Done Right</h3><p>We do the work cleanly and to code, test it, and leave your space the way we found it. Every job is backed by our warranty.</p></div>
    </div>
  </div>
</section>`;

function coupons(focus) {
  const c1 = `<div class="coupon reveal">
        <div class="big">10% OFF</div>
        <h3>For New Customers</h3>
        <p>New to Rooter-Man of Austin? Save 10% on your first service.</p>
        <span class="fine">Cannot be combined with any other coupon. Restrictions may apply. Valid Jan 1 through Dec 31, 2026.</span>
        <a class="btn btn-call" href="${PHONE_TEL}">Call to Claim ${PHONE_DISPLAY}</a>
      </div>`;
  const c2 = `<div class="coupon blue reveal">
        <div class="big">$100 OFF</div>
        <h3>Water Heater Install</h3>
        <p>Replacing or installing a water heater? Take $100 off with Rooter-Man.</p>
        <span class="fine">Cannot be combined with any other coupon. Restrictions may apply. Valid Jan 1 through Dec 31, 2026.</span>
        <a class="btn btn-book" href="${PHONE_TEL}">Call to Claim ${PHONE_DISPLAY}</a>
      </div>`;
  return `
<section class="coupons">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Save on your next service</span>
      <h2>Current Rooter-Man offers.</h2>
    </div>
    <div class="wrap with-mascot" style="padding:0;display:grid;gap:22px;margin-top:38px">
      <div class="mascot-col reveal"><img src="${R}assets/client/rm-mascot.png" alt="Rooter-Man mascot" loading="lazy" /></div>
      ${focus === "wh" ? c2 + c1 : c1 + c2}
    </div>
  </div>
</section>`;
}

function reviewsBlock(keys, title) {
  const cards = keys.map((k) => `<div class="rev reveal"><div class="stars">★★★★★</div><p>"${REVIEWS[k].q}"</p><div class="who">${REVIEWS[k].who}</div></div>`).join("\n      ");
  return `
<section class="reviews">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Neighbors trust us</span>
      <h2>${title}</h2>
    </div>
    <div class="rev-grid">
      ${cards}
    </div>
    <div class="agg reveal">
      <span class="g-badge"><span class="num">4.9</span><span class="stars">★★★★★</span><span>1,200+ Google reviews</span></span>
    </div>
    <div class="rev-src reveal">
      <span class="lbl">Read our reviews on</span>
      <a class="src-chip" href="${GOOGLE_REVIEWS}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1H12v2.9h5.35c-.5 2.5-2.6 4.3-5.35 4.3a5.8 5.8 0 1 1 0-11.6c1.5 0 2.8.55 3.8 1.45l2.15-2.15A8.7 8.7 0 1 0 12 20.7c5 0 8.7-3.5 8.7-8.7 0-.3 0-.6-.05-.9Z"/></svg> Google</a>
      <a class="src-chip" href="${YELP_REVIEWS}" target="_blank" rel="noopener">Yelp</a>
      <a class="src-chip" href="https://rootermanofaustin.com/reviews/" target="_blank" rel="noopener">All reviews</a>
    </div>
  </div>
</section>`;
}

function faqBlock(faqs) {
  const items = faqs.map((f, i) => `<details class="faq"${i === 0 ? " open" : ""}><summary>${f.q}<span class="pl">+</span></summary><p>${f.a}</p></details>`).join("\n      ");
  return `
<section id="faq-sec">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Good to know</span>
      <h2>Frequently asked questions.</h2>
    </div>
    <div class="faq-list">
      ${items}
    </div>
  </div>
</section>`;
}

function finalCta(h, p) {
  return `
<section class="final" id="book">
  <div class="bg"><img src="${R}assets/generated/trust-family-water.png" alt="" /></div>
  <div class="wrap">
    <span class="eyebrow on-dark reveal">Ready when you are</span>
    <h2 class="reveal" style="margin-top:.5rem">${h}</h2>
    <p class="reveal">${p}</p>
    <div class="hero-cta reveal">
      <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Call ${PHONE_DISPLAY}</a>
      <a class="btn btn-book btn-lg" href="${BOOK_URL}" onclick="STWidgetManager('ws-open');return false;">Book Online</a>
    </div>
    <div class="fine reveal">Calls answered 24/7 · Hablamos Español</div>
  </div>
</section>`;
}

const FOOTER = `
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <span class="foot-logochip"><img src="${R}assets/client/rooterman-wordmark.png" alt="Rooter-Man — To the Rescue" /></span>
        <p style="max-width:32ch">Fast, honest plumbing for Greater Austin. Licensed M40109, family-owned since 2012.</p>
        <img class="foot-mascot" src="${R}assets/client/rm-mascot.png" alt="Rooter-Man mascot" loading="lazy" />
      </div>
      <div>
        <h4>Services</h4>
        <div class="foot-list">
          <a href=R + "drain-cleaning/">Drain Cleaning</a>
          <a href=R + "plumbing-repair/">Plumbing Repair</a>
          <a href=R + "water-heaters/">Water Heaters</a>
          <a href=R + "sewer-septic/">Sewer &amp; Septic</a>
          <a href=R + "emergency-plumber/">Emergency Plumber</a>
          <a href=R + "commercial-plumbing/">Commercial Plumbing</a>
        </div>
      </div>
      <div>
        <h4>Service Areas</h4>
        <div class="foot-list">
          <a href="${R}#areas">Austin</a>
          <a href="${R}plumber-cedar-park/">Cedar Park</a>
          <a href="${R}plumber-round-rock/">Round Rock</a>
          <a href="${R}plumber-georgetown/">Georgetown</a>
          <a href="${R}plumber-pflugerville/">Pflugerville</a>
          <a href="${R}plumber-leander/">Leander</a>
        </div>
      </div>
      <div>
        <h4>Contact</h4>
        <div class="foot-list">
          <a class="foot-phone" href="${PHONE_TEL}">${PHONE_DISPLAY}</a>
          <span>15503 Patrica St</span>
          <span>Austin, TX 78759</span>
          <span>Calls answered 24/7</span>
          <span>Hablamos Español</span>
        </div>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span id="yr"></span> Rooter-Man of Austin · License M40109</span>
      <span>Website &amp; marketing by <a href="https://modernapexstrategies.com" target="_blank" rel="noopener" style="color:#9fb6cf;font-weight:700">Modern Apex Strategies</a></span>
      <span>Privacy · Terms</span>
    </div>
    <p class="sms">By submitting a request, you agree to receive text messages from Rooter-Man of Austin at the number provided, including those related to your inquiry, follow-ups, and review requests, via automated technology. Consent is not a condition of purchase. Msg &amp; data rates may apply. Msg frequency may vary. Reply STOP to cancel or HELP for assistance.</p>
  </div>
</footer>

<div class="callbar">
  <a class="btn btn-call" href="${PHONE_TEL}">${PHONE_SVG} Call Now</a>
  <a class="btn btn-book" href="${BOOK_URL}" onclick="STWidgetManager('ws-open');return false;">Book Online</a>
</div>`;

function schema(pageName, slug, faqs, extraAreas) {
  const plumber = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: "Rooter-Man of Austin",
    image: "https://rootermanofaustin.com/images/logos/Logo.png",
    telephone: "+1-512-645-1441",
    url: BASE + slug,
    address: { "@type": "PostalAddress", streetAddress: "15503 Patrica St", addressLocality: "Austin", addressRegion: "TX", postalCode: "78728", addressCountry: "US" },
    areaServed: extraAreas || ["Austin", "Cedar Park", "Round Rock", "Georgetown", "Pflugerville", "Leander", "Lakeway", "Hutto", "Brushy Creek", "Wells Branch"],
    foundingDate: "2012",
    knowsLanguage: ["en", "es"],
    slogan: "Rooter-Man To the Rescue",
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a.replace(/<[^>]+>/g, "") } })),
  };
  return `<script type="application/ld+json">${JSON.stringify(plumber)}</script>\n<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`;
}

const TAIL = `<!-- ServiceTitan Web Scheduler -->
<script>
  (function(q,w,e,r,t,y,u){q[t]=q[t]||function(){(q[t].q=q[t].q||[]).push(arguments)};
    q[t].l=1*new Date();y=w.createElement(e);u=w.getElementsByTagName(e)[0];y.async=true;
    y.src=r;u.parentNode.insertBefore(y,u);q[t]('init','f1337b8d-084b-4d33-b180-7dc5cd74e597');
  })(window,document,'script','https://static.servicetitan.com/webscheduler/shim.js','STWidgetManager');
</script>
<script src="${R}assets/site.js"></script>\n</body>\n</html>\n`;

/* ============================= SERVICE PAGES ============================= */

const COMMON_FAQS = {
  licensed: { q: "Are you licensed?", a: `Yes. Rooter-Man of Austin is fully licensed, Texas plumbing license M40109, and we have served the Greater Austin area as a family-owned company since 2012.` },
  cost: { q: "How much will my service cost?", a: `It depends on the job, but we believe in transparent, upfront pricing. For many services we can give you a ballpark estimate over the phone, and you always see the price before any work begins. No upsell pressure.` },
  hours: { q: "Can I call any time?", a: `Yes. Our phone line is answered 24/7, so you can call day or night to describe the problem and get on the schedule. Our crews run during regular service hours, and we work to get a licensed plumber out at the first available appointment, same-day whenever possible.` },
  spanish: { q: "Do you speak Spanish?", a: `Yes. We offer full bilingual service in English and Spanish. When you call, just let us know which you prefer and we will review the problem, pricing, and warranty in that language.` },
};

const services = [
  {
    slug: "drain-cleaning/",
    title: "Drain Cleaning in Austin, TX | Rooter-Man of Austin | Licensed M40109",
    desc: "Austin drain cleaning by licensed plumbers. Clogs cleared at the source, hydro jetting, camera inspection, honest pricing. New customers save 10%. Call (512) 645-1441.",
    crumb: "Drain Cleaning",
    h1: `Drain Cleaning in Austin, <span class="accent">cleared at the source.</span>`,
    sub: "Slow drains, gurgling sinks, and backups cleared by licensed plumbers with the right method for the job, from a routine cleanout to full hydro jetting. Honest recommendations, no upsell pressure.",
    img: "assets/generated/svc-drain-cleaning.png",
    imgAlt: "Rooter-Man of Austin technician clearing a kitchen drain",
    checks: [
      ["Clogged &amp; slow drains", "Kitchen sinks, bathroom sinks, tubs, showers, and floor drains cleared at the root of the problem."],
      ["Hydro jetting", "High-pressure water scours grease, mineral scale, and root fibers out of the entire pipe wall."],
      ["Camera inspection", "See the true condition of your line before you decide on any further work."],
      ["Drain repair", "Recurring clogs usually have a cause. We find it, fix it, and back it with our warranty."],
      ["Main line stoppages", "Whole-house backups traced and cleared, with trenchless options if the line itself has failed."],
      ["Honest advice on chemicals", "Chemical cleaners can damage pipes and rarely fix the cause. We solve it for good."],
    ],
    bandImg: "assets/generated/svc-hydro-jetting.png",
    bandAlt: "Hydro jetting a clogged drain line in Austin",
    bandH: "Why Austin drains clog harder.",
    bandCopy: `<p>Austin's mineral-heavy water leaves scale inside every pipe it touches, and the mature trees in neighborhoods like Hyde Park and Travis Heights send roots straight into aging drain lines. A cable machine punches a hole through the clog; that is why it comes back.</p><p>We diagnose what is actually happening in your line, clear it with the right method, and show you the proof on camera when it matters. If hydro jetting or a repair is the honest answer, you will know exactly why and exactly what it costs before we start.</p>`,
    reviews: ["james", "karen", "pankaj"],
    faqs: [
      { q: "Do you offer same-day drain cleaning in Austin?", a: "Yes, we strive for same-day scheduling whenever possible. Our phone line is answered 24/7, so call (512) 645-1441 any time and we will give you the next available options." },
      { q: "Are chemical drain cleaners safe to use?", a: "We generally advise against them. Chemical cleaners can damage certain pipes and usually do not remove the underlying cause, like grease buildup or roots. A professional evaluation is the safest path to a lasting fix." },
      { q: "What is hydro jetting and do I need it?", a: "Hydro jetting uses high-pressure water to scrub the entire pipe wall, flushing out grease, scale, and roots that a cable machine leaves behind. It is the right call for recurring clogs and greasy kitchen lines. We will tell you honestly whether a standard cleanout is enough." },
      COMMON_FAQS.cost,
      COMMON_FAQS.licensed,
    ],
    couponFocus: "new",
    finalH: "Get that drain flowing today.",
    finalP: `Licensed, local, and family-owned since 2012. Same-day scheduling whenever possible, upfront pricing, and every job backed by our warranty. New customers save 10%.`,
  },
  {
    slug: "water-heaters/",
    title: "Water Heater Repair & Installation in Austin, TX | $100 Off Install | Rooter-Man",
    desc: "Austin water heater repair and installation. Gas, electric, and tankless. Honest repair-or-replace advice, $100 off installs. Licensed M40109. Call (512) 645-1441.",
    crumb: "Water Heaters",
    h1: `No hot water? <span class="accent">Save $100 on a new water heater.</span>`,
    sub: "Repair and installation for gas, electric, and tankless systems, with an honest answer on whether repair or replacement is the smarter spend. Called Saturday, installed Sunday is not a slogan here. It is what our customers say.",
    img: "assets/generated/svc-water-heater.png",
    imgAlt: "New water heater installed by Rooter-Man of Austin",
    checks: [
      ["Water heater repair", "No hot water, lukewarm showers, pilot or element issues diagnosed and fixed."],
      ["Tank replacement", "Gas and electric tanks swapped, hauled away, and installed to code."],
      ["Tankless systems", "Endless hot water and lower bills. We install and service tankless too."],
      ["Honest repair-or-replace advice", "Under ~10 years old, repair often wins. Over that, we show you the math."],
      ["Code &amp; safety updates", "Expansion tanks, pans, straps, and venting brought up to code with the install."],
      ["$100 off install", "Water heater installs come with $100 off, valid through Dec 31, 2026."],
    ],
    bandImg: "assets/client/work-water-heater.jpg",
    bandAlt: "Water heater installed by Rooter-Man of Austin, real job photo",
    bandH: "Austin's hard water eats water heaters early.",
    bandCopy: `<p>Mineral scale from Austin's hard water builds up inside the tank, making it pop, rumble, run lukewarm, and fail years before its time. A flush can buy time; past a point, replacement is the honest answer.</p><p>We tell you which one you actually need. A licensed plumber checks the unit, explains it plainly, and gives you the price before any work begins. If it is a replacement, most standard installs are done the same or next day, warranty-backed, with $100 off.</p>`,
    reviews: ["gabe", "william", "katie"],
    faqs: [
      { q: "Should I repair or replace my water heater?", a: "Generally, repair makes sense when the unit is under about 10 years old and only a few components are involved. Replacement is often smarter when it is over 10 years old, has needed multiple repairs, or efficiency has dropped. We give you an honest recommendation, not a sales pitch." },
      { q: "How fast can you install a new water heater in Austin?", a: "Most standard replacements are completed same-day or next-day once you approve the price. One of our customers called on a Saturday and had a new water heater installed by Sunday afternoon." },
      { q: "Do you install tankless water heaters?", a: "Yes. We repair and install gas, electric, and tankless systems, and we will tell you honestly whether tankless makes sense for your home and usage." },
      { q: "Is there really $100 off?", a: "Yes. Take $100 off a water heater install with Rooter-Man, valid through Dec 31, 2026. It cannot be combined with other coupons, and new customers can use their 10% discount instead if it saves more." },
      COMMON_FAQS.hours,
    ],
    couponFocus: "wh",
    finalH: "Hot water back, $100 kept.",
    finalP: `Licensed M40109, family-owned since 2012. Honest repair-or-replace advice, upfront pricing, warranty-backed installs, and $100 off water heater installs through 2026.`,
  },
  {
    slug: "emergency-plumber/",
    title: "Emergency Plumber in Austin, TX | Calls Answered 24/7 | Rooter-Man of Austin",
    desc: "Plumbing emergency in Austin? Our line is answered 24/7 and we dispatch licensed plumbers at the first available appointment, same-day whenever possible. Call (512) 645-1441.",
    crumb: "Emergency Plumber",
    h1: `Plumbing emergency? <span class="accent">We answer 24/7.</span>`,
    sub: "Burst pipe, no hot water, sewage backing up into the house? Call any time, day or night. A real person answers, gets you on the schedule immediately, and we dispatch a licensed plumber at the first available appointment, same-day whenever we can.",
    img: "assets/generated/emergency-night-van.png",
    imgAlt: "Rooter-Man of Austin service van ready to respond",
    checks: [
      ["Burst &amp; leaking pipes", "Shut it down, stop the damage, and make the lasting repair."],
      ["Sewage backups", "Backups into tubs and floor drains cleared and the cause diagnosed."],
      ["No hot water", "Water heater failures diagnosed fast, with same-day replacement when needed."],
      ["Major leaks &amp; flooding", "Slab, wall, and yard leaks pinpointed with acoustic and thermal tools."],
      ["Gas water heater safety", "Venting and connection issues handled by licensed pros, to code."],
      ["Straight answers first", "We tell you what to shut off and what to expect before we arrive."],
    ],
    bandImg: "assets/generated/hero-image-van-tech.png",
    bandAlt: "Rooter-Man of Austin technician arriving at a home",
    bandH: "What to do the minute something bursts.",
    bandCopy: `<p>First: close the fixture's shutoff valve, or the main shutoff by the meter if you cannot isolate it. Kill the water heater breaker (or set a gas unit to pilot) if the tank is leaking. Then call us at ${PHONE_DISPLAY}.</p><p>Our answering line picks up around the clock, walks your details to the schedule immediately, and we get a licensed plumber out at the first available appointment. We are honest about timing: crews run during service hours, so we do not promise a 2am arrival. We promise you will never wait until Monday to be heard.</p>`,
    reviews: ["william", "karen", "adam"],
    faqs: [
      { q: "Are you open 24/7?", a: "Our phone line is answered 24/7, so you can always reach a real person, describe the emergency, and get booked immediately. Our plumbers run during regular service hours, and we dispatch at the first available appointment, same-day whenever possible." },
      { q: "What counts as a plumbing emergency?", a: "Anything actively causing damage or making the home unlivable: a burst or spraying pipe, sewage backing up inside, a failed water heater with no hot water, or a major leak you cannot shut off. When in doubt, call and we will help you triage it on the phone." },
      { q: "What should I do while I wait?", a: "Shut off the nearest valve, or the main shutoff at the meter if you cannot isolate the fixture. For a leaking water heater, turn off its breaker or set the gas control to pilot. Move belongings out of the water's path. We will walk you through it on the phone." },
      COMMON_FAQS.cost,
      COMMON_FAQS.licensed,
    ],
    couponFocus: "new",
    finalH: "Call now. A real person answers.",
    finalP: `Our line is answered 24/7 and a licensed, warranty-backed Austin plumber is dispatched at the first available appointment, same-day whenever possible. New customers save 10%.`,
  },
  {
    slug: "plumbing-repair/",
    title: "Plumbing Repair in Austin, TX | Leaks, Pressure, Fixtures | Rooter-Man of Austin",
    desc: "Austin plumbing repair: leak detection, water pressure, repiping, toilets, faucets, garbage disposals. Licensed M40109, upfront pricing. Call (512) 645-1441.",
    crumb: "Plumbing Repair",
    h1: `Plumbing repair, <span class="accent">diagnosed right the first time.</span>`,
    sub: "Leaks found without tearing your home apart, pressure problems traced to the real cause, fixtures repaired or replaced with upfront pricing and a warranty on the work.",
    img: "assets/generated/svc-leak-detection.png",
    imgAlt: "Leak detection equipment locating a hidden leak in an Austin home",
    checks: [
      ["Leak detection &amp; repair", "Slab, wall, yard, and fixture leaks pinpointed with acoustic sensors and thermal imaging."],
      ["Water pressure repair", "Failing regulators, hidden leaks, and scale buildup diagnosed and corrected."],
      ["Piping &amp; repiping", "Failing lines evaluated honestly: targeted repair vs. full repipe, with financing available."],
      ["Toilets &amp; faucets", "Repairs and installs done in hours, backed by a strong labor warranty."],
      ["Garbage disposals", "Jam, leak, or hum? Honest repair-or-replace call, handled same-day or next available."],
      ["Water line repair", "Main line issues located with professional testing gear, often fixed in a single day."],
    ],
    bandImg: "assets/client/work-media-17.jpg",
    bandAlt: "Finished shower valve replacement by Rooter-Man of Austin",
    bandBeforeImg: "assets/client/work-media-14.jpg",
    bandBeforeAlt: "Corroded shower valve opened up for replacement",
    bandH: "Real repair, from opened wall to finished chrome.",
    bandCopy: `<p>This is a real Rooter-Man job: a corroded, failing shower valve opened up cleanly, rebuilt with a new pressure-balanced valve, and finished to look like nothing ever happened.</p><p>That is the standard on every repair we make. A licensed plumber explains what failed and why, you approve the exact price before work begins, and the finished job carries our warranty. Austin's hard water and shifting clay soil are tough on plumbing. Your repairs should not be the weak link.</p>`,
    reviews: ["aragon", "leyna", "karen"],
    faqs: [
      { q: "How do you find hidden leaks?", a: "We use non-invasive acoustic sensors and thermal imaging to pinpoint yard leaks, slab leaks, wall leaks, and fixture leaks without tearing your home apart guessing. You often get a ballpark estimate right over the phone." },
      { q: "My water pressure suddenly dropped. What is it?", a: "Sudden pressure loss almost always points to something specific: a hidden leak, a failing pressure regulator, mineral buildup from Austin's hard water, or a main line problem. We diagnose the real cause instead of guessing, then fix it." },
      { q: "Do I need a full repipe?", a: "Not always. Frequent leaks, rusty water, or weak pressure across the whole house can mean pipes are at the end of their life, but we evaluate whether a targeted repair solves it first. If a repipe is the honest answer, we lay out the pros, cons, and financing options." },
      COMMON_FAQS.cost,
      COMMON_FAQS.hours,
    ],
    couponFocus: "new",
    finalH: "One call fixes it for good.",
    finalP: `Licensed, local, and family-owned since 2012. Upfront pricing, no upsell pressure, and every repair backed by our warranty. New customers save 10%.`,
  },
  {
    slug: "sewer-septic/",
    title: "Sewer Line Repair & Septic Pumping in Austin, TX | Trenchless | Rooter-Man",
    desc: "Austin sewer line repair, trenchless replacement, tunneling, and same-day septic pumping. Licensed M40109, warranty-backed. Call (512) 645-1441.",
    crumb: "Sewer & Septic",
    h1: `Sewer &amp; septic, fixed <span class="accent">without wrecking your yard.</span>`,
    sub: "Camera-verified sewer diagnosis, trenchless repair through one or two small access points, precision tunneling under slabs, and same-day septic pumping across Greater Austin.",
    img: "assets/generated/svc-sewer-trenchless.png",
    imgAlt: "Trenchless sewer repair equipment in an Austin yard",
    checks: [
      ["Sewer line repair", "Breaks, bellies, and root intrusion diagnosed on camera and repaired to code."],
      ["Trenchless replacement", "Rehabilitate or replace the line through small access points, sparing yards, trees, and patios."],
      ["Under-slab tunneling", "Precision tunneling reaches lines under slab foundations without breaking up your home."],
      ["Septic pumping", "Same-day pumping, inspection, and straight guidance on keeping the system healthy."],
      ["Grinder &amp; ejector pumps", "Pump service and replacement for basements and below-grade fixtures."],
      ["Camera inspections", "See the real condition of the line before you approve any work."],
    ],
    bandImg: "assets/client/work-slab-sewer.jpg",
    bandAlt: "Rooter-Man of Austin plumber laying new drain lines beneath a slab foundation, real job photo",
    bandH: "Real slab work, by our own crew.",
    bandCopy: `<p>This is a Rooter-Man tech re-running drain lines beneath a broken-out Austin slab. Central Texas builds on slab foundations over clay and limestone that swell and shift with the weather, and mature trees in older neighborhoods push roots straight into aging sewer lines.</p><p>That mix takes more than a rental trencher. We camera-verify the failure, choose the least destructive fix, trenchless where the line allows it, precision tunneling where it does not, and back the work with our warranty.</p>`,
    reviews: ["pankaj", "adam", "james"],
    faqs: [
      { q: "What are the signs my sewer line is failing?", a: "Slow drains throughout the house, gurgling toilets, sewage odors, wet or unusually green patches in the yard, and backups into tubs or floor drains. A camera inspection shows the real condition before you spend anything on repairs." },
      { q: "What is trenchless sewer repair?", a: "Trenchless methods rehabilitate or replace your sewer line through one or two small access points instead of digging a trench across the whole yard. In established Austin neighborhoods full of trees, patios, and slab foundations, that matters." },
      { q: "How often should my septic tank be pumped?", a: "Most household tanks need pumping every 3 to 5 years depending on size and usage. Slow drains everywhere, gurgling, odors, or soggy spots near the drain field mean it is due. We offer same-day septic pumping across Greater Austin." },
      COMMON_FAQS.cost,
      COMMON_FAQS.licensed,
    ],
    couponFocus: "new",
    finalH: "Get eyes on the line today.",
    finalP: `Camera-verified diagnosis, trenchless options, and warranty-backed work from a licensed, family-owned Austin crew. Financing available on larger projects. New customers save 10%.`,
  },
  {
    slug: "commercial-plumbing/",
    title: "Commercial Plumbing in Austin, TX | Rooter-Man of Austin | Licensed M40109",
    desc: "Commercial plumbing for Austin businesses: drain lines, water heaters, fixtures, sewer and grease line jetting. Licensed M40109, warranty-backed. Call (512) 645-1441.",
    crumb: "Commercial Plumbing",
    h1: `Commercial plumbing that <span class="accent">keeps you open.</span>`,
    sub: "Restaurants, offices, retail, and multi-unit properties across Greater Austin. Fast diagnosis, code-compliant work, and pricing you approve before anything starts.",
    img: "assets/generated/trust-van-neighborhood.png",
    imgAlt: "Rooter-Man of Austin service van on a commercial call",
    checks: [
      ["Commercial drain &amp; sewer", "Floor drains, main lines, and grease-heavy kitchen lines cleared and jetted."],
      ["Hydro jetting programs", "Scheduled jetting keeps restaurant and multi-unit lines from backing up mid-service."],
      ["Commercial water heaters", "High-capacity and tankless systems repaired and replaced to code."],
      ["Fixtures &amp; ADA updates", "Toilets, urinals, faucets, and flush valves repaired or upgraded."],
      ["Leak detection", "Non-invasive location of slab and wall leaks, minimizing downtime and demo."],
      ["Camera inspections", "Documented line condition for owners, managers, and due diligence."],
    ],
    bandImg: "assets/generated/trust-finished-work.png",
    bandAlt: "Clean finished commercial plumbing work",
    bandH: "Downtime is the real invoice.",
    bandCopy: `<p>A backed-up line in a restaurant or an office restroom out of order costs more per hour than the repair. We diagnose fast, give you the price upfront, and do clean, code-compliant work that holds.</p><p>Rooter-Man of Austin is licensed (M40109), family-owned, bilingual, and has served Greater Austin businesses since 2012. Every job is warranty-backed, and financing is available on larger projects.</p>`,
    reviews: ["pankaj", "leyna", "adam"],
    faqs: [
      { q: "Do you work with restaurants?", a: "Yes. Grease-heavy kitchen drain lines are exactly where hydro jetting earns its keep, and scheduled jetting programs keep lines from backing up mid-service. We also handle commercial water heaters, fixtures, and sewer lines." },
      { q: "Can you work around our business hours?", a: "We schedule to minimize your downtime, and our phone line is answered 24/7 so you can book the moment something comes up. Tell us your constraints and we will plan the visit around them." },
      { q: "Are you licensed and insured for commercial work?", a: "Yes. Rooter-Man of Austin holds Texas plumbing license M40109 and our work is code-compliant and warranty-backed. Documentation for property managers is no problem." },
      COMMON_FAQS.cost,
      COMMON_FAQS.spanish,
    ],
    couponFocus: "new",
    finalH: "Keep the doors open.",
    finalP: `Licensed M40109, family-owned since 2012, and trusted by Greater Austin businesses. Upfront pricing, warranty-backed work, and a line that is answered 24/7.`,
  },
];

/* ============================= CITY PAGES ============================= */

const cities = [
  { slug: "plumber-cedar-park/", city: "Cedar Park", angle: "Cedar Park's newer slab-built homes sit on Hill Country limestone, and the same hard water that scales up the rest of Central Texas is quietly shortening the life of builder-grade water heaters across the city. Many of those systems are now hitting the age where honest repair-or-replace advice matters most." },
  { slug: "plumber-round-rock/", city: "Round Rock", angle: "Round Rock's water is famously hard, and the big waves of homes built from the 1990s through the 2000s are now running original water heaters, regulators, and fixtures well into their second decade. Scale buildup and aging pressure regulators are the two problems we see most." },
  { slug: "plumber-georgetown/", city: "Georgetown", angle: "From the historic homes near the Square to the fast-growing new neighborhoods, Georgetown plumbing spans a century of pipe materials sitting on shifting limestone. Older drain lines meet mature tree roots; newer slabs meet moving soil. We work on both every week." },
  { slug: "plumber-pflugerville/", city: "Pflugerville", angle: "Pflugerville sits on blackland clay that swells with every storm and shrinks through every drought, working buried water and sewer lines back and forth year after year. That soil movement is behind many of the slab leaks and line breaks we repair here." },
  { slug: "plumber-leander/", city: "Leander", angle: "Leander is one of the fastest-growing corridors in Texas, and fast growth means new-build plumbing: pressure regulators on hilly terrain, builder-grade fixtures, and warranty-season punch lists. We give straight answers on what is a real problem and what can wait." },
  { slug: "plumber-lakeway/", city: "Lakeway", angle: "Lakeway's Hill Country terrain means elevation changes, pressure zones, and long private lines serving lake-area homes. Pressure problems and hidden leaks on those long runs are our bread and butter here, found with acoustic and thermal tools instead of guesswork." },
  { slug: "plumber-hutto/", city: "Hutto", angle: "Hutto sits squarely on blackland prairie clay, some of the most expansive soil in Central Texas. As the city's newer neighborhoods settle, that clay works on slabs and buried lines, and catching the early warning signs saves thousands over waiting for a flood." },
  { slug: "plumber-brushy-creek/", city: "Brushy Creek", angle: "Brushy Creek's established neighborhoods from the 1980s and 90s have two things in abundance: mature trees and original plumbing. Roots find their way into aging sewer lines, and first-generation water heaters and valves are due for honest evaluation." },
  { slug: "plumber-wells-branch/", city: "Wells Branch", angle: "Wells Branch's homes largely date to the 1980s, which means original drain lines, aging supply pipes, and water heaters on their second or third replacement cycle, all shaded by some of the most mature trees north of Austin. We know exactly what to look for here." },
];

function serviceLinksGrid() {
  const items = [
    ["Drain Cleaning", R + "drain-cleaning/", "Clogs cleared at the source, hydro jetting, camera inspection."],
    ["Plumbing Repair", R + "plumbing-repair/", "Leaks, water pressure, repiping, toilets, faucets, disposals."],
    ["Water Heaters", R + "water-heaters/", "Repair and install, tank and tankless. $100 off install."],
    ["Sewer & Septic", R + "sewer-septic/", "Trenchless repair, tunneling, same-day septic pumping."],
    ["Emergency Plumber", R + "emergency-plumber/", "Calls answered 24/7, first-available dispatch."],
    ["Commercial Plumbing", R + "commercial-plumbing/", "Restaurants, offices, retail, and multi-unit properties."],
  ];
  return items.map(([t, href, d]) => `<a class="svc reveal" href="${href}"><h3>${t}</h3><p>${d}</p><div class="links"><span style="color:var(--blue)">Learn More →</span></div></a>`).join("\n      ");
}

function buildServicePage(s) {
  const checks = s.checks.map(([b, t]) => `<div class="check reveal">${CHECK_SVG}<div><b>${b}</b><span>${t}</span></div></div>`).join("\n      ");
  const beforeAfter = s.bandBeforeImg
    ? `<div class="ph reveal" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;aspect-ratio:auto;box-shadow:none;overflow:visible;border-radius:0">
        <div class="shot"><span class="tag">Before</span><img src="${R}${s.bandBeforeImg}" alt="${esc(s.bandBeforeAlt)}" loading="lazy" /></div>
        <div class="shot"><span class="tag after">After</span><img src="${R}${s.bandImg}" alt="${esc(s.bandAlt)}" loading="lazy" /></div>
      </div>`
    : `<div class="ph reveal"><img src="${R}${s.bandImg}" alt="${esc(s.bandAlt)}" loading="lazy" /></div>`;

  const html = `${head(s.title, s.desc, s.slug)}
${UTIL}
${HEADER}

<section class="phero" id="top">
  <div class="phero-img"><img src="${R}${s.img}" alt="${esc(s.imgAlt)}" /></div>
  <div class="wrap">
    <div class="phero-inner">
      <div class="crumb"><a href="${R}">Home</a><span class="sep">/</span><a href="${R}#services">Services</a><span class="sep">/</span><span>${s.crumb}</span></div>
      <h1>${s.h1}</h1>
      <p class="sub">${s.sub}</p>
      <div class="offers">
        <span class="offer-chip"><span class="dot"></span>New customers save 10%</span>
        <span class="offer-chip"><span class="dot blue"></span>$100 off water heater install</span>
        <span class="fine">Mention online. Valid through Dec 31, 2026. Cannot be combined.</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-book btn-lg" href="${BOOK_URL}" onclick="STWidgetManager('ws-open');return false;">Book Online</a>
      </div>
      <div class="hero-micro"><span class="pulse"></span> Licensed M40109 · Warranty-Backed · Bilingual · Calls Answered 24/7</div>
    </div>
  </div>
</section>

${TRUSTBAR}

<section class="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">What we handle</span>
      <h2>${s.crumb}, end to end.</h2>
    </div>
    <div class="checks">
      ${checks}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    ${beforeAfter}
    <div class="reveal body-copy">
      <span class="eyebrow">The Austin angle</span>
      <h2>${s.bandH}</h2>
      ${s.bandCopy}
      <div class="hero-cta" style="margin-top:1.3rem">
        <a class="btn btn-call" href="${PHONE_TEL}">${PHONE_SVG} ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </div>
</section>

${STEPS}
${reviewsBlock(s.reviews, "What Austin homeowners say about Rooter-Man.")}
${coupons(s.couponFocus)}
${faqBlock(s.faqs)}
${finalCta(s.finalH, s.finalP)}
${FOOTER}
${schema(s.crumb, s.slug, s.faqs)}
${TAIL}`;
  const dir = s.slug.replace(/\/$/, "");
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + "/index.html", html);
  console.log("wrote", s.slug);
}

function buildCityPage(c) {
  const title = `Plumber in ${c.city}, TX | Rooter-Man of Austin | Licensed M40109`;
  const desc = `Licensed plumbers serving ${c.city}, TX: drain cleaning, water heaters, leak detection, sewer and septic. Family-owned since 2012. New customers save 10%. Call (512) 645-1441.`;
  const faqs = [
    { q: `Do you serve ${c.city}?`, a: `Yes. ${c.city} is part of our regular Greater Austin service area, alongside Austin, Cedar Park, Round Rock, Georgetown, Pflugerville, Leander, Lakeway, Hutto, Brushy Creek, and Wells Branch.` },
    { q: `Can I get same-day plumbing service in ${c.city}?`, a: `We strive for same-day scheduling whenever possible, and our phone line is answered 24/7 so you can call any time and get on the schedule at (512) 645-1441.` },
    COMMON_FAQS.licensed,
    COMMON_FAQS.cost,
  ];
  const html = `${head(title, desc, c.slug)}
${UTIL}
${HEADER}

<section class="phero" id="top">
  <div class="phero-img"><img src="${R}assets/generated/hero-image-van-tech.png" alt="Rooter-Man of Austin service van arriving in ${esc(c.city)}" /></div>
  <div class="wrap">
    <div class="phero-inner">
      <div class="crumb"><a href="${R}">Home</a><span class="sep">/</span><a href="${R}#areas">Service Areas</a><span class="sep">/</span><span>${c.city}</span></div>
      <h1>Plumbers in ${c.city}, <span class="accent">on the way.</span></h1>
      <p class="sub">Fast, honest, licensed plumbers for ${c.city} homes and businesses: drains, water heaters, leaks, sewer and septic. Same-day scheduling whenever possible, upfront pricing, warranty-backed work.</p>
      <div class="offers">
        <span class="offer-chip"><span class="dot"></span>New customers save 10%</span>
        <span class="offer-chip"><span class="dot blue"></span>$100 off water heater install</span>
        <span class="fine">Mention online. Valid through Dec 31, 2026. Cannot be combined.</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-book btn-lg" href="${BOOK_URL}" onclick="STWidgetManager('ws-open');return false;">Book Online</a>
      </div>
      <div class="hero-micro"><span class="pulse"></span> Licensed M40109 · Warranty-Backed · Bilingual · Calls Answered 24/7</div>
    </div>
  </div>
</section>

${TRUSTBAR}

<section class="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">Serving ${c.city}</span>
      <h2>Every service, right here in ${c.city}.</h2>
      <p>${c.angle}</p>
    </div>
    <div class="svc-grid" style="grid-template-columns:repeat(3,1fr)">
      ${serviceLinksGrid()}
    </div>
  </div>
</section>

${STEPS}
${reviewsBlock(["karen", "gabe", "james"], `What your neighbors say about Rooter-Man.`)}
${coupons("new")}
${faqBlock(faqs)}
${finalCta(`Get a ${c.city} plumber on the way.`, `Licensed, local, and family-owned since 2012. Same-day scheduling whenever possible, upfront pricing, and every job backed by our warranty. New customers save 10%.`)}
${FOOTER}
${schema(c.city, c.slug, faqs, [c.city, "Austin"])}
${TAIL}`;
  const dir = c.slug.replace(/\/$/, "");
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + "/index.html", html);
  console.log("wrote", c.slug);
}

function buildBookingPage() {
  const title = "Book Online | Rooter-Man of Austin | Request a Plumbing Appointment";
  const desc = "Book your Austin plumbing appointment online. Tell us what you need and your preferred time, and we will call to confirm. Licensed M40109, family-owned since 2012, calls answered 24/7.";
  const SERVICE_OPTS = [
    "Drain cleaning",
    "Water heater (repair or install)",
    "Leak detection or repair",
    "Sewer or septic",
    "Toilet, faucet, or fixture",
    "Emergency plumbing",
    "Something else / not sure",
  ].map((s) => `<option>${s}</option>`).join("");
  const TIME_OPTS = [
    "As soon as possible",
    "Morning (8am to 12pm)",
    "Afternoon (12pm to 4pm)",
    "Evening (4pm to 8pm)",
  ].map((s) => `<option>${s}</option>`).join("");

  const html = `${head(title, desc, "book/")}
<style>
  .book-wrap{max-width:1120px;margin:0 auto;padding:0 20px}
  .book-hero{background:#0e2a47;color:#eaf1f8;padding:64px 0 40px;text-align:center}
  .book-hero .eyebrow{color:#ff5a4d}
  .book-hero h1{font-family:Poppins,sans-serif;font-weight:800;font-size:clamp(2rem,5vw,3rem);line-height:1.05;margin:.4rem 0 .6rem;color:#fff}
  .book-hero p{max-width:60ch;margin:0 auto;color:#c2d2e2;font-size:1.05rem}
  .book-hero .trust{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;margin-top:18px;font-size:.85rem;color:#9fb6cf;font-weight:600}
  .book-main{padding:44px 0 72px;background:#f4f7fb}
  .book-grid{display:grid;grid-template-columns:1.35fr .9fr;gap:34px;align-items:start}
  @media(max-width:820px){.book-grid{grid-template-columns:1fr}}
  .book-card{background:#fff;border:1px solid #e2e9f1;border-radius:14px;padding:28px;box-shadow:0 10px 30px rgba(15,42,71,.06)}
  .book-form .fg{margin-bottom:15px}
  .book-form .fg2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  @media(max-width:520px){.book-form .fg2{grid-template-columns:1fr}}
  .book-form label{display:block;font-weight:700;font-size:.82rem;color:#0e2a47;margin-bottom:5px}
  .book-form input,.book-form select,.book-form textarea{width:100%;padding:11px 12px;border:1px solid #cdd8e4;border-radius:9px;font:inherit;font-size:.95rem;color:#0e2a47;background:#fff;box-sizing:border-box}
  .book-form input:focus,.book-form select:focus,.book-form textarea:focus{outline:none;border-color:#1f6fd6;box-shadow:0 0 0 3px rgba(31,111,214,.15)}
  .book-form button[type=submit]{width:100%;margin-top:6px;justify-content:center}
  .book-fine{font-size:.82rem;color:#5a6b7d;margin-top:12px;text-align:center}
  .book-fine a{color:#c0261f;font-weight:700;text-decoration:none}
  .book-ok{background:#fff;border:1px solid #cfe6d3;border-radius:14px;padding:40px 28px;text-align:center}
  .book-ok .chk{width:56px;height:56px;border-radius:50%;background:#e7f6ea;color:#1e9e4a;display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
  .book-ok h2{font-family:Poppins,sans-serif;color:#0e2a47;margin:0 0 8px}
  .book-ok p{color:#5a6b7d;max-width:44ch;margin:0 auto 6px}
  .book-side h3{font-family:Poppins,sans-serif;color:#0e2a47;font-size:1.15rem;margin:0 0 12px}
  .book-side ol{margin:0 0 22px;padding-left:1.1rem;color:#3a4b5c;line-height:1.6}
  .book-side ol li{margin-bottom:8px}
  .book-side .call-box{background:#0e2a47;color:#eaf1f8;border-radius:12px;padding:20px;text-align:center}
  .book-side .call-box .num{font-family:Poppins,sans-serif;font-weight:800;font-size:1.5rem;display:block;margin:6px 0 2px}
  .book-side .call-box a{color:#fff;text-decoration:none}
  .book-side .call-box .sub{font-size:.8rem;color:#9fb6cf}
</style>
${UTIL}
${HEADER}

<section class="book-hero" id="top">
  <div class="book-wrap">
    <span class="eyebrow">Book online</span>
    <h1>Request your Austin plumbing appointment.</h1>
    <p>Tell us what is going on and when works for you. We will call to confirm your time, often same-day. Prefer to talk now? Call ${PHONE_DISPLAY}.</p>
    <div class="trust"><span>Licensed M40109</span><span>Family-owned since 2012</span><span>Calls answered 24/7</span><span>Hablamos Español</span></div>
  </div>
</section>

<section class="book-main">
  <div class="book-wrap book-grid">
    <div class="book-card">
      <h2 style="font-family:Poppins,sans-serif;color:#0e2a47;margin:0 0 8px;font-size:1.4rem">Pick a time that works for you.</h2>
      <p style="color:#5a6b7d;margin:0 0 22px">Open our online scheduler, choose your service and an appointment window, and we confirm your visit, often same-day.</p>
      <button type="button" class="btn btn-book btn-lg" onclick="STWidgetManager('ws-open');return false;" style="width:100%;justify-content:center">Schedule My Appointment</button>
      <p class="book-fine">We answer 24/7. For an active emergency, call <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>.</p>
    </div>
        <aside class="book-side">
      <h3>What happens next</h3>
      <ol>
        <li>We review your request and call to confirm the time that works best, often same-day.</li>
        <li>A licensed plumber arrives and gives you upfront pricing before any work begins.</li>
        <li>The job is done right, backed by our warranty. New customers save 10%.</li>
      </ol>
      <div class="call-box">
        <span>Rather book by phone?</span>
        <a class="num" href="${PHONE_TEL}">${PHONE_DISPLAY}</a>
        <span class="sub">Answered 24/7 · Hablamos Español</span>
      </div>
    </aside>
  </div>
</section>

${FOOTER}
${TAIL}`;
  mkdirSync("book", { recursive: true });
  writeFileSync("book/index.html", html);
  console.log("wrote", "book/");
}

services.forEach(buildServicePage);
cities.forEach(buildCityPage);
buildBookingPage();
console.log("done:", services.length + cities.length + 1, "pages");
