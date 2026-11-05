#!/usr/bin/env node
/**
 * Generates service + city landing pages for Rooter-Man of Austin.
 * Shared chrome mirrors index.html; styles in assets/site.css.
 * Run: node build-pages.mjs
 */
import { writeFileSync, mkdirSync } from "fs";

let R = "../"; // prefix to site root: "../" for one-level pages, "../../" for /{track}/{city}/ pages

const BASE = "https://rootermanofaustin.com/";
const SITEMAP = new Set([""]); // every generated page registers itself in head(); "" = homepage
const PHONE_DISPLAY = "(512) 645-1441";
const PHONE_TEL = "tel:+15126451441";
const SMS_URL = "sms:+15126451441";
// Secondary CTA. The old Scorpion booking overlay is gone with the Scorpion site.
// Interim = text-to-schedule. Swap to the client's ServiceTitan Scheduling Pro
// scheduler (data-api-key + data-schedulerid) or book.servicetitan.com link when provided.
const BOOK_URL = () => R + "book/";
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

function head(title, desc, slug, lang = "en") {
  SITEMAP.add(slug);
  return `<!DOCTYPE html>
<html lang="${lang}">
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
  gtag('config', 'G-7L3LNTM6JM');
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

const UTIL = () => `
<div class="util">
  <div class="wrap">
    <div class="left"><span>Licensed Austin Plumbers Since 2012</span><span class="sep">·</span><span>License M40109</span><span class="sep">·</span><span>Same-Day Scheduling</span><span class="sep">·</span><span>Hablamos Español</span></div>
    <div class="right">Call: <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a></div>
  </div>
</div>`;

const HEADER = () => `
<header id="hdr">
  <div class="wrap nav">
    <a class="brand" href="${R}" aria-label="Rooter-Man of Austin"><img src="${R}assets/client/rooterman-wordmark.png" alt="Rooter-Man of Austin — To the Rescue" style="height:40px" /></a>
    <nav class="nav-links">
      <div class="has-menu">
        <a href="${R}#services">Services</a>
        <div class="menu menu-wide" role="menu">
        <a href="${R}drain-cleaning/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/></svg></span><span class="label"><span class="t">Drain Cleaning</span><span class="d">Clogs, hydro jetting, camera inspection</span></span></a>
        <a href="${R}water-heaters/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="12" height="20" rx="4"/><path d="M9 7h6M12 13v4"/></svg></span><span class="label"><span class="t">Water Heaters</span><span class="d">Tank &amp; tankless. $100 off install</span></span></a>
        <a href="${R}plumbing-repair/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.06 5.06L3 18v3h3l6.64-6.64a4 4 0 0 0 5.06-5.06L15 12l-3-3 2.7-2.7Z"/></svg></span><span class="label"><span class="t">Plumbing Repair</span><span class="d">Leaks, pressure, fixtures, repipes</span></span></a>
        <a href="${R}sewer-septic/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M6 18V9a6 6 0 0 1 12 0v9M12 3v3"/></svg></span><span class="label"><span class="t">Sewer &amp; Septic</span><span class="d">Trenchless repair &amp; septic pumping</span></span></a>
        <a href="${R}emergency-plumber/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><span class="label"><span class="t">Emergency Plumber</span><span class="d">Answered 24/7, first-available dispatch</span></span></a>
        <a href="${R}commercial-plumbing/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M14 9h1M14 13h1M10 21v-4h4v4"/></svg></span><span class="label"><span class="t">Commercial Plumbing</span><span class="d">Restaurants, offices, multi-unit</span></span></a>
        <a href="${R}leak-detection/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/><path d="M9 13h6"/></svg></span><span class="label"><span class="t">Leak Detection</span><span class="d">Slab, wall, and yard leaks pinpointed</span></span></a>
        <a href="${R}slab-leak-repair/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-5h6v5"/></svg></span><span class="label"><span class="t">Slab Leak Repair</span><span class="d">Detection, reroute, tunneling</span></span></a>
        <a href="${R}toilet-repair/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10l-1 7H8L7 4ZM6 11h12v3a6 6 0 0 1-12 0v-3ZM10 21h4"/></svg></span><span class="label"><span class="t">Toilet Repair</span><span class="d">Running, clogged, leaking, new installs</span></span></a>
        <a href="${R}garbage-disposal/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l-1 4H9L8 3ZM6 7h12M9 7l1 5h4l1-5M10 16a2 2 0 1 0 4 0"/></svg></span><span class="label"><span class="t">Garbage Disposals</span><span class="d">Jams, leaks, hums, replacements</span></span></a>
        <a href="${R}tankless-water-heaters/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="14" rx="3"/><path d="M9 8h6M9 12h6M12 17v4"/></svg></span><span class="label"><span class="t">Tankless Water Heaters</span><span class="d">Install, repair, descaling</span></span></a>
        <a href="${R}repiping/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h10a3 3 0 0 1 3 3v10M4 4v6M2 7h4M14 17h6M17 14v6"/></svg></span><span class="label"><span class="t">Repiping &amp; Water Lines</span><span class="d">Whole-home repipes, main line repair</span></span></a>
        <a href="${R}hydro-jetting/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h6M3 8h4M3 16h4"/><path d="M21 12a6 6 0 0 0-6-6h-2v12h2a6 6 0 0 0 6-6Z"/></svg></span><span class="label"><span class="t">Hydro Jetting</span><span class="d">High-pressure cleaning, camera inspection</span></span></a>
        <a href="${R}plomero/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 12h6"/></svg></span><span class="label"><span class="t">Plomero en Austin</span><span class="d">Servicio completo en español</span></span></a>
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
        <a href="${R}plumber-south-austin/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">South Austin</span></span></a>
        <a href="${R}plumber-north-austin/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">North Austin</span></span></a>
        <a href="${R}plumber-east-austin/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">East Austin</span></span></a>
        <a href="${R}plumber-west-lake-hills/"><span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span><span class="label"><span class="t">West Lake Hills</span></span></a>
        </div>
      </div>
      <a href="${R}#reviews">Reviews</a>
      <a href="${R}#coupons">Coupons</a>
      <a href="${R}#faq">FAQ</a>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-book" href="${PHONE_TEL}">${PHONE_SVG} ${PHONE_DISPLAY}</a>
      <a class="btn btn-ghost" href="${BOOK_URL()}">Book Online</a>
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
      <a href="${R}leak-detection/">Leak Detection <span aria-hidden="true">→</span></a>
      <a href="${R}slab-leak-repair/">Slab Leak Repair <span aria-hidden="true">→</span></a>
      <a href="${R}toilet-repair/">Toilet Repair <span aria-hidden="true">→</span></a>
      <a href="${R}garbage-disposal/">Garbage Disposals <span aria-hidden="true">→</span></a>
      <a href="${R}tankless-water-heaters/">Tankless Water Heaters <span aria-hidden="true">→</span></a>
      <a href="${R}repiping/">Repiping &amp; Water Lines <span aria-hidden="true">→</span></a>
      <a href="${R}hydro-jetting/">Hydro Jetting <span aria-hidden="true">→</span></a>
      <a href="${R}plomero/">Plomero en Austin <span aria-hidden="true">→</span></a>
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
      <a href="${R}plumber-south-austin/">South Austin <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-north-austin/">North Austin <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-east-austin/">East Austin <span aria-hidden="true">→</span></a>
      <a href="${R}plumber-west-lake-hills/">West Lake Hills <span aria-hidden="true">→</span></a>
    <div class="grp">More</div>
    <a href="${R}#reviews">Reviews <span aria-hidden="true">→</span></a>
    <a href="${R}#coupons">Coupons <span aria-hidden="true">→</span></a>
    <a href="${R}#faq">FAQ <span aria-hidden="true">→</span></a>
  </nav>
  <div class="mobile-foot">
    <a class="phone" href="tel:+15126451441">(512) 645-1441</a>
    <a class="btn btn-book" href="${BOOK_URL()}">Book Online</a>
  </div>
</div>`;

const TRUSTBAR = () => `
<div class="trustbar">
  <div class="wrap">
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg></div><b>Licensed M40109</b><span>Texas-licensed plumbing pros</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg></div><b>Local Since 2012</b><span>Family-owned in Greater Austin</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><b>Same-Day Scheduling</b><span>On the schedule today when we can</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><b>Warranty-Backed</b><span>Every job stands behind our guarantee</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 12h6"/></svg></div><b>Hablamos Español</b><span>Full bilingual service</span></div>
  </div>
</div>`;

const STEPS = () => `
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
        <div class="big">5% OFF</div>
        <h3>For New Customers</h3>
        <p>New to Rooter-Man of Austin? Save 5% on your first service.</p>
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

// 2026 Best of Round Rock award (Sneha, 2026-11-04). Mirrored in index.html reviews section.
const AWARD = () => `
    <div class="award reveal">
      <img src="${R}assets/client/best-of-round-rock-2026.png" width="112" height="112" loading="lazy" alt="2026 Best of Round Rock winner badge. Rooter-Man placed 2nd for Best Plumbing Service." />
      <div>
        <span class="eyebrow">Voted by the community</span>
        <h3>2nd Place, Best Plumbing Service</h3>
        <p>Rooter-Man took 2nd place for Best Plumbing Service in the 2026 Best of Round Rock awards, with more than 61,000 votes cast. Thank you, Round Rock.</p>
      </div>
    </div>`;

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
    </div>${AWARD()}
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
      <a class="btn btn-book btn-lg" href="${BOOK_URL()}">Book Online</a>
    </div>
    <div class="fine reveal">Calls answered 24/7 · Hablamos Español</div>
  </div>
</section>`;
}

const FOOTER = () => `
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
          <a href="${R}drain-cleaning/">Drain Cleaning</a>
          <a href="${R}plumbing-repair/">Plumbing Repair</a>
          <a href="${R}water-heaters/">Water Heaters</a>
          <a href="${R}sewer-septic/">Sewer &amp; Septic</a>
          <a href="${R}emergency-plumber/">Emergency Plumber</a>
          <a href="${R}commercial-plumbing/">Commercial Plumbing</a>
          <a href="${R}leak-detection/">Leak Detection</a>
          <a href="${R}slab-leak-repair/">Slab Leak Repair</a>
          <a href="${R}toilet-repair/">Toilet Repair</a>
          <a href="${R}garbage-disposal/">Garbage Disposals</a>
          <a href="${R}tankless-water-heaters/">Tankless Water Heaters</a>
          <a href="${R}repiping/">Repiping &amp; Water Lines</a>
          <a href="${R}hydro-jetting/">Hydro Jetting</a>
          <a href="${R}plomero/">Plomero en Austin</a>
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
          <a href="${R}plumber-hutto/">Hutto</a>
          <a href="${R}plumber-brushy-creek/">Brushy Creek</a>
          <a href="${R}plumber-wells-branch/">Wells Branch</a>
          <a href="${R}plumber-south-austin/">South Austin</a>
          <a href="${R}plumber-north-austin/">North Austin</a>
          <a href="${R}plumber-east-austin/">East Austin</a>
          <a href="${R}plumber-west-lake-hills/">West Lake Hills</a>
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
  <a class="btn btn-book" href="${BOOK_URL()}">Book Online</a>
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
    areaServed: extraAreas || AREA_SERVED,
    foundingDate: "2012",
    award: "2nd Place, Best Plumbing Service, 2026 Best of Round Rock",
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

const TAIL = () => `<!-- ServiceTitan Web Scheduler -->
<script>
  (function(q,w,e,r,t,y,u){q[t]=q[t]||function(){(q[t].q=q[t].q||[]).push(arguments)};
    q[t].l=1*new Date();y=w.createElement(e);u=w.getElementsByTagName(e)[0];y.async=true;
    y.src=r;u.parentNode.insertBefore(y,u);q[t]('init','155624fb-92ba-4fa8-bea1-10b034d2927d');
  })(window,document,'script','https://static.servicetitan.com/webscheduler/shim.js','STWidgetManager');
</script>
<script src="${R}assets/site.js"></script>
<!-- Modern Apex attribution: keeps the ad click id with each /book/ request in the lead ledger -->
<script async src="${R}assets/apex-attribution.js" data-token="1be3c411d6010f6643aa12883fa39253"></script>
<!-- CallRail dynamic number insertion -->
<script type="text/javascript" src="//cdn.callrail.com/companies/895224542/8fbad8958ca67ff146a0/12/swap.js"></script>\n</body>\n</html>\n`;

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
    desc: "Austin drain cleaning by licensed plumbers. Clogs cleared at the source, hydro jetting, camera inspection, honest pricing. New customers save 5%. Call (512) 645-1441.",
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
    finalP: `Licensed, local, and family-owned since 2012. Same-day scheduling whenever possible, upfront pricing, and every job backed by our warranty. New customers save 5%.`,
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
      { q: "Is there really $100 off?", a: "Yes. Take $100 off a water heater install with Rooter-Man, valid through Dec 31, 2026. It cannot be combined with other coupons, and new customers can use their 5% discount instead if it saves more." },
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
    finalP: `Our line is answered 24/7 and a licensed, warranty-backed Austin plumber is dispatched at the first available appointment, same-day whenever possible. New customers save 5%.`,
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
    finalP: `Licensed, local, and family-owned since 2012. Upfront pricing, no upsell pressure, and every repair backed by our warranty. New customers save 5%.`,
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
    finalP: `Camera-verified diagnosis, trenchless options, and warranty-backed work from a licensed, family-owned Austin crew. Financing available on larger projects. New customers save 5%.`,
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
${UTIL()}
${HEADER()}

<section class="phero" id="top">
  <div class="phero-img"><img src="${R}${s.img}" alt="${esc(s.imgAlt)}" /></div>
  <div class="wrap">
    <div class="phero-inner">
      <div class="crumb"><a href="${R}">Home</a><span class="sep">/</span><a href="${R}#services">Services</a><span class="sep">/</span><span>${s.crumb}</span></div>
      <h1>${s.h1}</h1>
      <p class="sub">${s.sub}</p>
      <div class="offers">
        <span class="offer-chip"><span class="dot"></span>New customers save 5%</span>
        <span class="offer-chip"><span class="dot blue"></span>$100 off water heater install</span>
        <span class="fine">Mention online. Valid through Dec 31, 2026. Cannot be combined.</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-book btn-lg" href="${BOOK_URL()}">Book Online</a>
      </div>
      <div class="hero-micro"><span class="pulse"></span> Licensed M40109 · Warranty-Backed · Bilingual · Calls Answered 24/7</div>
    </div>
  </div>
</section>

${TRUSTBAR()}

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

${STEPS()}
${reviewsBlock(s.reviews, "What Austin homeowners say about Rooter-Man.")}
${coupons(s.couponFocus)}
${s.byCity ? byCityGrid(s.byCity, s.crumb) : ""}
${faqBlock(s.faqs)}
${finalCta(s.finalH, s.finalP)}
${FOOTER()}
${schema(s.crumb, s.slug, s.faqs)}
${TAIL()}`;
  const dir = s.slug.replace(/\/$/, "");
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + "/index.html", html);
  console.log("wrote", s.slug);
}

function buildCityPage(c) {
  const title = `Plumber in ${c.city}, TX | Rooter-Man of Austin | Licensed M40109`;
  const desc = `Licensed plumbers serving ${c.city}, TX: drain cleaning, water heaters, leak detection, sewer and septic. Family-owned since 2012. New customers save 5%. Call (512) 645-1441.`;
  const faqs = [
    { q: `Do you serve ${c.city}?`, a: `Yes. ${c.city} is part of our regular Greater Austin service area, alongside ${AREA_LIST_TEXT}.` },
    { q: `Can I get same-day plumbing service in ${c.city}?`, a: `We strive for same-day scheduling whenever possible, and our phone line is answered 24/7 so you can call any time and get on the schedule at (512) 645-1441.` },
    COMMON_FAQS.licensed,
    COMMON_FAQS.cost,
  ];
  const html = `${head(title, desc, c.slug)}
${UTIL()}
${HEADER()}

<section class="phero" id="top">
  <div class="phero-img"><img src="${R}assets/generated/hero-image-van-tech.png" alt="Rooter-Man of Austin service van arriving in ${esc(c.city)}" /></div>
  <div class="wrap">
    <div class="phero-inner">
      <div class="crumb"><a href="${R}">Home</a><span class="sep">/</span><a href="${R}#areas">Service Areas</a><span class="sep">/</span><span>${c.city}</span></div>
      <h1>Plumbers in ${c.city}, <span class="accent">on the way.</span></h1>
      <p class="sub">Fast, honest, licensed plumbers for ${c.city} homes and businesses: drains, water heaters, leaks, sewer and septic. Same-day scheduling whenever possible, upfront pricing, warranty-backed work.</p>
      <div class="offers">
        <span class="offer-chip"><span class="dot"></span>New customers save 5%</span>
        <span class="offer-chip"><span class="dot blue"></span>$100 off water heater install</span>
        <span class="fine">Mention online. Valid through Dec 31, 2026. Cannot be combined.</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-book btn-lg" href="${BOOK_URL()}">Book Online</a>
      </div>
      <div class="hero-micro"><span class="pulse"></span> Licensed M40109 · Warranty-Backed · Bilingual · Calls Answered 24/7</div>
    </div>
  </div>
</section>

${TRUSTBAR()}

<section class="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">Serving ${c.city}</span>
      <h2>Every service, right here in ${c.city}.</h2>
      <p>${c.angle}</p>
    </div>
    <div class="svc-grid">
      ${cityServiceGrid(c)}
    </div>
  </div>
</section>

${STEPS()}
${reviewsBlock(["karen", "gabe", "james"], `What your neighbors say about Rooter-Man.`)}
${coupons("new")}
${faqBlock(faqs)}
${finalCta(`Get a ${c.city} plumber on the way.`, `Licensed, local, and family-owned since 2012. Same-day scheduling whenever possible, upfront pricing, and every job backed by our warranty. New customers save 5%.`)}
${FOOTER()}
${schema(c.city, c.slug, faqs, [c.city, "Austin"])}
${TAIL()}`;
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
  .book-or{display:flex;align-items:center;text-align:center;color:#8697a8;font-size:.78rem;margin:22px 0;text-transform:uppercase;letter-spacing:.05em}
  .book-or::before,.book-or::after{content:"";flex:1;height:1px;background:#e2e9f1}
  .book-or span{padding:0 12px}
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
${UTIL()}
${HEADER()}

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
      <h2 style="font-family:Poppins,sans-serif;color:#0e2a47;margin:0 0 6px;font-size:1.35rem">Schedule instantly</h2>
      <p style="color:#5a6b7d;margin:0 0 18px">Pick the date and time that work for you in our live scheduler.</p>
      <button id="stopen" class="btn btn-book btn-lg" type="button" style="width:100%">Open the Scheduler</button>
      <p id="stnote" class="book-fine" hidden>The live scheduler is still being connected. Book with the request form below or call <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>.</p>
      <div class="book-or"><span>or send a request and we call you</span></div>
      <h2 style="font-family:Poppins,sans-serif;color:#0e2a47;margin:0 0 6px;font-size:1.35rem">Request your appointment</h2>
      <p style="color:#5a6b7d;margin:0 0 18px">Tell us what you need and your preferred time, and we will call to confirm, often same-day.</p>
      <form id="bookform" class="book-form" action="https://api.web3forms.com/submit" method="POST">
        <input type="hidden" name="access_key" value="9dcdf8a3-7972-4fbe-9c03-066e0c92b0f6" />
        <input type="hidden" name="subject" value="New booking request — Rooter-Man of Austin website" />
        <input type="hidden" name="from_name" value="Rooter-Man of Austin website" />
        <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off" />
        <div class="fg"><label for="bk-name">Full name</label><input id="bk-name" name="name" required autocomplete="name" /></div>
        <div class="fg2">
          <div class="fg"><label for="bk-phone">Phone</label><input id="bk-phone" name="phone" type="tel" required autocomplete="tel" /></div>
          <div class="fg"><label for="bk-email">Email</label><input id="bk-email" name="email" type="email" autocomplete="email" /></div>
        </div>
        <div class="fg"><label for="bk-addr">Service address</label><input id="bk-addr" name="service_address" autocomplete="street-address" placeholder="Street, city, ZIP" /></div>
        <div class="fg"><label for="bk-svc">What do you need?</label><select id="bk-svc" name="service_needed">${SERVICE_OPTS}</select></div>
        <div class="fg"><label for="bk-note">Tell us about the problem</label><textarea id="bk-note" name="details" rows="3" placeholder="A quick description helps us send the right plumber."></textarea></div>
        <button class="btn btn-book btn-lg" type="submit">Send Request</button>
        <p class="book-fine">We answer 24/7. For an active emergency, call <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>.</p>
      </form>
      <div id="bookok" class="book-ok" hidden>
        <div class="chk"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>
        <h2>Request received</h2>
        <p>Thanks! We have your request and will call shortly to confirm your appointment time.</p>
        <p>Need us sooner? Call <a href="${PHONE_TEL}" style="color:#c0261f;font-weight:700;text-decoration:none">${PHONE_DISPLAY}</a>.</p>
      </div>
    </div>
        <aside class="book-side">
      <h3>What happens next</h3>
      <ol>
        <li>We review your request and call to confirm the time that works best, often same-day.</li>
        <li>A licensed plumber arrives and gives you upfront pricing before any work begins.</li>
        <li>The job is done right, backed by our warranty. New customers save 5%.</li>
      </ol>
      <div class="call-box">
        <span>Rather book by phone?</span>
        <a class="num" href="${PHONE_TEL}">${PHONE_DISPLAY}</a>
        <span class="sub">Answered 24/7 · Hablamos Español</span>
      </div>
    </aside>
  </div>
</section>

${FOOTER()}
<script>
(function(){
  var sb=document.getElementById('stopen');
  if(sb){sb.addEventListener('click',function(){
    try{STWidgetManager('ws-open')}catch(e){}
    setTimeout(function(){
      var open=[].slice.call(document.querySelectorAll('div')).some(function(d){
        if(!d.querySelector('iframe[src*="servicetitan"]')) return false;
        var s=getComputedStyle(d);
        return s.position==='fixed' && s.visibility!=='hidden' && s.display!=='none';
      });
      if(!open){
        var n=document.getElementById('stnote'); if(n) n.hidden=false;
        var f=document.getElementById('bookform'); if(f) f.scrollIntoView({behavior:'smooth',block:'center'});
      }
    },1600);
  });}
})();
(function(){
  var f=document.getElementById('bookform'); if(!f) return;
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var key=(f.querySelector('[name=access_key]')||{}).value||'';
    var fine=f.querySelector('.book-fine');
    if(!key || key.indexOf('PENDING')>-1){
      if(fine) fine.innerHTML='Request forms are being connected. To book now, use the scheduler above or call <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>.';
      return;
    }
    var btn=f.querySelector('button[type=submit]'); var label=btn.textContent; btn.disabled=true; btn.textContent='Sending...';
    // Ledger copy for the Modern Apex portal, read before the form hides. Posted whatever
    // Web3Forms answers, so a request is on record even if the email lane fails.
    // ?apx_test=1 marks a verification visit: test row, no Ads conversion.
    var fd=new FormData(f);
    var isTest=/[?&]apx_test=1(&|$)/.test(location.search);
    var ledger={name:String(fd.get('name')||''),email:String(fd.get('email')||''),phone:String(fd.get('phone')||''),
      message:[['Address',fd.get('service_address')],['Service',fd.get('service_needed')],['Details',fd.get('details')]]
        .filter(function(x){return x[1]}).map(function(x){return x[0]+': '+x[1]}).join('\\n'),isTest:isTest};
    function toLedger(){try{if(window.apexAttribution){window.apexAttribution.attach(ledger);}}catch(e){}}
    try{
      var res=await fetch(f.action,{method:'POST',body:fd,headers:{'Accept':'application/json'}});
      var data=await res.json();
      if(data && data.success){
        if(!isTest && typeof gtag==='function'){gtag('event','conversion',{'send_to':'AW-18245522940/zzFhCPbl2sAcEPyrkvxD'});gtag('event','generate_lead',{form_id:'book'});}
        toLedger();
        f.hidden=true; var ok=document.getElementById('bookok'); ok.hidden=false; ok.scrollIntoView({behavior:'smooth',block:'center'});
      } else { throw new Error((data&&data.message)||'error'); }
    }catch(err){
      toLedger();
      btn.disabled=false; btn.textContent=label;
      if(fine) fine.innerHTML='Something went wrong. Please call <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a> and we will book you right away.';
    }
  });
})();
</script>
${TAIL()}`;
  mkdirSync("book", { recursive: true });
  writeFileSync("book/index.html", html);
  console.log("wrote", "book/");
}

// Legacy Scorpion-era URLs (from Wayback CDX + Google index). Each gets a stub that
// redirects users and tells Google the page moved, so stale SERP snippets showing
// Scorpion's 737 tracking number drop out of the index. Not in sitemap on purpose.
const legacyStubs = [
  ["plumbing-services", "/"],
  ["plumbing-services/drain-cleaning", "/drain-cleaning/"],
  ["plumbing-services/drain-cleaning/hydro-jetting", "/drain-cleaning/"],
  ["plumbing-services/drain-repair", "/drain-cleaning/"],
  ["plumbing-services/leak-detection-repair", "/plumbing-repair/"],
  ["plumbing-services/piping-repiping", "/plumbing-repair/"],
  ["plumbing-services/water-lines", "/plumbing-repair/"],
  ["plumbing-services/water-pressure-repair", "/plumbing-repair/"],
  ["plumbing-services/septic-pumping", "/sewer-septic/"],
  ["plumbing-services/sewer-services", "/sewer-septic/"],
  ["plumbing-services/water-heaters", "/water-heaters/"],
  ["plumbing-services/water-heaters/tankless-water-heaters", "/water-heaters/"],
  ["contact-us", "/book/"],
  ["about-us", "/"],
  ["areas-we-serve", "/#areas"],
  ["coupons", "/#coupons"],
  ["coupons/print", "/#coupons"],
  ["reviews", "/#reviews"],
  ["privacy-policy", "/"],
  ["site-map", "/"],
  ["site-search", "/"],
  ["blog", "/"],
  ["blog/categories", "/"],
];

function buildLegacyStubs() {
  for (const [oldPath, target] of legacyStubs) {
    const targetUrl = BASE.replace(/\/$/, "") + target;
    const canonical = BASE.replace(/\/$/, "") + target.split("#")[0];
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rooter-Man of Austin | This page has moved</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${canonical}">
<meta http-equiv="refresh" content="0;url=${targetUrl}">
<script>location.replace(${JSON.stringify(targetUrl)});</script>
</head><body>
<p>This page has moved. Continue to <a href="${targetUrl}">rootermanofaustin.com</a> or call <a href="${PHONE_TEL}">${PHONE_DISPLAY}</a>.</p>
</body></html>
`;
    mkdirSync(oldPath, { recursive: true });
    writeFileSync(oldPath + "/index.html", html);
  }
  console.log("wrote", legacyStubs.length, "legacy stubs");
}

/* ============================= 2026-09-22 EXPANSION: new hubs, new areas, service x city pages ============================= */
/* Contract: every slug here matches BUILD-SPEC.md (Google Ads keyword final URLs point at these paths). */

const cap = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/* ---- 12 areas in the Google Ads geo. Lakeway is intentionally absent (its ZIPs are negative targets). ---- */
const AREAS = {
  "cedar-park": {
    city: "Cedar Park", zips: "78613",
    setting: "a northwest suburb along 183 and 1431 in Williamson County",
    homes: "Cedar Park is mostly slab-on-grade homes built from the 1990s through the 2010s, and the builder-grade water heaters, regulators, and fixtures that came with them are now reaching the age where failures cluster.",
    foundation: "slab foundations poured on Hill Country limestone and caliche",
    water: "hard Central Texas water that scales up water heaters, aerators, and valves early",
    sewer: "PVC drain lines that run under the slab and out to the main, with shade trees planted in the 1990s now big enough to reach them",
    pressure: "municipal pressure that runs high in the lower neighborhoods and leans on the regulator at every house",
    growth: "steady infill and new sections still being built out toward Leander",
    drive: "a short run up 183 or Parmer from our shop in North Austin",
    landmarks: "Buttercup Creek, Anderson Mill West, and the Ranch at Brushy Creek",
    nearby: ["leander", "brushy-creek", "round-rock", "north-austin"],
  },
  "round-rock": {
    city: "Round Rock", zips: "78664, 78665, 78681",
    setting: "the largest city in Williamson County, spread across both sides of I-35",
    homes: "Round Rock grew in waves from the late 1980s through the 2000s, plus an older core near Main Street, so a lot of original water heaters, regulators, and fixtures are now well into their second decade.",
    foundation: "slab foundations on limestone west of I-35 and on expansive blackland clay to the east",
    water: "some of the hardest water in Central Texas, which is why scale shows up in Round Rock water heaters, faucets, and toilet fill valves so fast",
    sewer: "aging drain lines under 1990s slabs, with mature live oaks and pecans in the older neighborhoods sending roots into sewer laterals",
    pressure: "pressure regulators from the original build that are past their service life in many neighborhoods",
    growth: "new construction still going in on the east side toward Hutto",
    drive: "straight up I-35 from our shop, one of our closest service areas",
    landmarks: "Forest Creek, Teravista, Stone Oak, and the neighborhoods off Gattis School Road",
    nearby: ["pflugerville", "hutto", "brushy-creek", "wells-branch"],
  },
  "georgetown": {
    city: "Georgetown", zips: "78626, 78628",
    setting: "the Williamson County seat, from the historic homes around the Square to Sun City and the new neighborhoods along the San Gabriel",
    homes: "Georgetown covers a full century of housing: pier-and-beam and early slab homes near downtown, big 1990s and 2000s subdivisions, Sun City's age-restricted homes, and brand-new construction on every side.",
    foundation: "slab foundations on limestone that shifts with drought and rain",
    water: "hard water that scales up tank water heaters and tankless heat exchangers alike",
    sewer: "older clay and cast iron sewer lines near downtown where mature pecans and oaks find every joint, and PVC under the newer slabs",
    pressure: "long service runs on larger lots and real elevation change across the city",
    growth: "one of the fastest-growing cities in the country, so many homes are still in or just out of the builder warranty window",
    drive: "up I-35 past Round Rock from our shop",
    landmarks: "Old Town, Sun City, Berry Creek, and Wolf Ranch",
    nearby: ["round-rock", "hutto", "leander"],
  },
  "pflugerville": {
    city: "Pflugerville", zips: "78660",
    setting: "a northeast suburb between I-35 and Toll 130",
    homes: "Pflugerville is mostly large 2000s and 2010s subdivisions on relatively flat land, with a smaller older core near downtown.",
    foundation: "slab foundations on blackland clay that swells with every storm and shrinks through every drought",
    water: "hard water with the same scale problems as the rest of the metro",
    sewer: "drain and sewer lines that the moving clay works back and forth, which is where bellies and separated joints come from",
    pressure: "supply lines under the slab that the same soil movement stresses, the classic setup for a slab leak",
    growth: "neighborhoods still building out toward 130 and Lake Pflugerville",
    drive: "a few minutes east of our shop on Wells Branch Parkway",
    landmarks: "Falcon Pointe, Blackhawk, Avalon, and the streets around Lake Pflugerville",
    nearby: ["wells-branch", "round-rock", "hutto", "north-austin"],
  },
  "leander": {
    city: "Leander", zips: "78641",
    setting: "one of the fastest-growing cities in Texas, northwest of Cedar Park along 183A",
    homes: "Leander is mostly new construction from the last ten to fifteen years, with PEX supply lines, builder-grade fixtures, and tank water heaters now reaching their first replacement.",
    foundation: "slab foundations on hilly limestone, with real elevation change inside a single neighborhood",
    water: "hard Hill Country water that is tough on tank and tankless water heaters alike",
    sewer: "newer PVC drain lines, so most drain trouble here is grease, wipes, and construction debris rather than roots",
    pressure: "pressure that varies house to house with the terrain, and regulators sized for the build rather than for the neighborhood as it filled in",
    growth: "punch lists, warranty-season questions, and homes coming off builder coverage every month",
    drive: "up 183A from our shop",
    landmarks: "Crystal Falls, Travisso, Mason Hills, and Old Town Leander",
    nearby: ["cedar-park", "georgetown", "brushy-creek"],
  },
  "hutto": {
    city: "Hutto", zips: "78634",
    setting: "east of Round Rock on the blackland prairie",
    homes: "Hutto is newer subdivisions from the 2000s onward wrapped around a small historic downtown.",
    foundation: "slab foundations on some of the most expansive clay soil in Central Texas",
    water: "hard water and the scale that comes with it",
    sewer: "PVC drain lines that the shifting clay can pull out of grade, plus older lines around downtown",
    pressure: "buried supply lines that the same clay movement stresses, so slab and yard leaks show up here earlier than the age of the homes would suggest",
    growth: "fast building, with homes coming off builder warranty every month",
    drive: "out Highway 79 past Round Rock from our shop",
    landmarks: "Star Ranch, Hutto Parke, and downtown Hutto",
    nearby: ["round-rock", "pflugerville", "georgetown"],
  },
  "brushy-creek": {
    city: "Brushy Creek", zips: "78717",
    setting: "an established Williamson County community tucked between Round Rock, Cedar Park, and Austin",
    homes: "Brushy Creek is 1980s and 1990s homes, many with original plumbing, mature trees, and water heaters and valves on their second or third cycle.",
    foundation: "slab foundations on limestone and shallow soil",
    water: "hard water that has been scaling these systems for thirty-plus years",
    sewer: "mature live oaks and cedar elms over aging sewer laterals, exactly where root intrusion happens",
    pressure: "original pressure regulators and early copper or galvanized supply that is due for evaluation",
    growth: "very little new construction, so most calls are honest repair-or-replace decisions on original systems",
    drive: "just up Parmer from our shop",
    landmarks: "Cat Hollow, Brushy Creek North, and the streets around Brushy Creek Lake Park",
    nearby: ["cedar-park", "round-rock", "wells-branch", "north-austin"],
  },
  "wells-branch": {
    city: "Wells Branch", zips: "78728",
    setting: "our home base, the North Austin community where our shop on Patrica St sits",
    homes: "Wells Branch is 1980s homes with original drain lines, aging supply pipes, and water heaters that have already been replaced once or twice.",
    foundation: "slab foundations on clay and limestone that shift with the weather",
    water: "hard water working on decades-old fixtures and valves",
    sewer: "some of the most mature trees north of Austin over forty-year-old sewer laterals",
    pressure: "original regulators and shutoff valves that often fail the first time anyone tries to turn them",
    growth: "an established neighborhood, so the work is diagnosis and honest repair rather than warranty punch lists",
    drive: "minutes from our shop, closer than anywhere else we work",
    landmarks: "the greenbelt trails and the streets off Wells Branch Parkway and Shoreline Drive",
    nearby: ["north-austin", "pflugerville", "brushy-creek", "round-rock"],
  },
  "south-austin": {
    city: "South Austin", zips: "78745, 78748, 78744, 78747, 78749",
    setting: "the neighborhoods south of the river and Ben White, from 78704 out to Slaughter Lane",
    homes: "South Austin is 1950s to 1970s ranch homes in 78745 and 78704 with original cast iron drains and galvanized supply, alongside 1990s and 2000s subdivisions in 78748, 78747, and Circle C.",
    foundation: "a mix of pier-and-beam under the older streets and slab foundations on limestone and clay under the newer ones",
    water: "hard water on plumbing that in the older homes has been in service for sixty years",
    sewer: "cast iron and clay sewer lines under the older homes, with big live oaks and pecans on top of them",
    pressure: "galvanized supply lines at the end of their life and regulators added long after the homes were built",
    growth: "constant remodeling and additions, which is when hidden plumbing problems get found",
    drive: "down Mopac or I-35 from our shop in North Austin",
    landmarks: "Bouldin Creek, Travis Heights, Cherry Creek, Circle C, and the neighborhoods off Manchaca Road",
    nearby: ["east-austin", "west-lake-hills", "north-austin"],
    angle: "South Austin is where the metro's oldest and newest plumbing sit side by side. Ranch homes in 78745 and 78704 still run original cast iron drains and galvanized supply lines, while the subdivisions out toward Slaughter Lane and Circle C have 1990s and 2000s slab plumbing on limestone. We work on both every week, and the first job is always figuring out which kind of problem you actually have.",
  },
  "north-austin": {
    city: "North Austin", zips: "78753, 78758, 78727, 78757",
    setting: "the neighborhoods between 183 and Parmer, from Crestview and Allandale up through the Domain and Milwood",
    homes: "North Austin is 1950s and 1960s homes in Crestview and Allandale, 1970s and 1980s subdivisions in Milwood and Gracywoods, and newer construction around the Domain.",
    foundation: "slab foundations on shallow limestone and clay",
    water: "hard water on fixtures that in many homes are original",
    sewer: "cast iron drains under the older homes and mature trees over most of the sewer laterals",
    pressure: "old galvanized supply in the older streets and original regulators in the 1980s subdivisions",
    growth: "steady remodels and teardowns, plus apartment and condo work near the Domain",
    drive: "our own backyard, a few minutes from the shop",
    landmarks: "Crestview, Allandale, Milwood, Gracywoods, and the Domain",
    nearby: ["wells-branch", "brushy-creek", "pflugerville", "east-austin"],
    angle: "North Austin is our own backyard. From Crestview and Allandale to Milwood, Gracywoods, and the Domain, we are minutes away, and we know which streets still have cast iron drains, which subdivisions have original 1980s regulators, and where the shallow limestone makes a yard leak surface two houses down from where it started.",
  },
  "east-austin": {
    city: "East Austin", zips: "78702, 78721, 78722, 78723, 78724",
    setting: "the historic neighborhoods east of I-35, from Holly and Cherrywood out past Mueller and Windsor Park",
    homes: "East Austin has some of the city's oldest housing stock, 1920s to 1960s bungalows and ranch homes, alongside new infill construction on the same blocks.",
    foundation: "pier-and-beam under many older homes, with crawl spaces that make some repairs easier and some leaks harder to spot, and slab under the newer builds",
    water: "hard water on plumbing that in places is older than the people who own it",
    sewer: "clay and cast iron sewer lines under century-old pecans and live oaks, the highest root-intrusion territory in the city",
    pressure: "galvanized supply lines and a patchwork of past repairs from decades of owners",
    growth: "constant renovation, additions, and new builds on old lots, which is when old sewer laterals and water services get exposed",
    drive: "down I-35 or 290 from our shop",
    landmarks: "Cherrywood, Holly, Govalle, Windsor Park, and Mueller",
    nearby: ["north-austin", "south-austin", "pflugerville"],
    angle: "East Austin plumbing means century-old sewer laterals under century-old pecans, galvanized supply lines patched by five different owners, and brand-new construction on the same block. We camera the old lines before anyone digs, tell you honestly what is original and what has been replaced, and fix it once.",
  },
  "west-lake-hills": {
    city: "West Lake Hills", zips: "78746, 78733",
    setting: "the hillside communities west of Mopac along Bee Caves Road and Loop 360",
    homes: "West Lake Hills is custom homes from the 1970s onward on large wooded lots, many with long private water lines and more than one pressure zone.",
    foundation: "slab and pier-and-beam foundations set into limestone hillsides",
    water: "hard water and, on the hills, pressure that swings from too low at the top to too high at the bottom",
    sewer: "long sewer runs and septic systems on some lots, with live oaks and cedars over every buried line",
    pressure: "long service lines with elevation change, where a small leak can run for months under rock before it surfaces",
    growth: "steady remodels and rebuilds on established lots",
    drive: "across Mopac and out Bee Caves Road from our shop",
    landmarks: "Rollingwood, Davenport Ranch, and the neighborhoods off Bee Caves Road",
    nearby: ["south-austin", "north-austin", "east-austin"],
    angle: "West Lake Hills plumbing is shaped by the hills. Long private water lines drop from the street to the house, pressure zones change from one cul-de-sac to the next, and a leak can run under limestone for months before it shows. We find those leaks with acoustic and thermal tools instead of guesswork, and we size regulators and water heaters for the house, not the template.",
  },
};
const AREA_KEYS = Object.keys(AREAS);
const AREA_SERVED = ["Austin", ...AREA_KEYS.map((k) => AREAS[k].city), "Lakeway"];
const AREA_LIST_TEXT = "Austin, Cedar Park, Round Rock, Georgetown, Pflugerville, Leander, Hutto, Brushy Creek, Wells Branch, South Austin, North Austin, East Austin, West Lake Hills, and Lakeway";
const areaKey = (c) => c.slug.replace(/^plumber-/, "").replace(/\/$/, "");

const newAreas = ["south-austin", "north-austin", "east-austin", "west-lake-hills"].map((k) => ({ slug: `plumber-${k}/`, city: AREAS[k].city, angle: AREAS[k].angle }));

/* ---- 6 tracks. Each has copy that composes with the area profile so no two pages read the same. ---- */
const TRACKS = [
  {
    slug: "drain-cleaning", name: "Drain Cleaning", short: "Drain Cleaning", hubLabel: "Drain Cleaning",
    blurb: "Clogs cleared at the source, hydro jetting, camera inspection.",
    img: "assets/generated/svc-drain-cleaning.png", imgAlt: (a) => `Rooter-Man of Austin technician clearing a kitchen drain in ${a.city}`,
    bandImg: "assets/client/drain.jpg", bandAlt: "Rooter-Man of Austin plumber working under a bathroom sink, real job photo",
    h1: (a) => `Drain cleaning in ${a.city}, <span class="accent">cleared at the source.</span>`,
    desc: (a) => `${a.city} drain cleaning by licensed plumbers: clogged sinks, tubs, and main lines cleared at the cause, hydro jetting and camera inspection. New customers save 5%. Call (512) 645-1441.`,
    lead: (a) => `Slow drains and backups in ${a.city} usually trace back to ${a.sewer}. We clear the clog at its cause instead of punching a hole through it, and if the line itself is the problem we show you on camera before you decide anything. ${a.city} is ${a.drive}.`,
    checksH: (a) => `Drain cleaning in ${a.city}, end to end.`,
    checks: [
      ["Clogged &amp; slow drains", "Kitchen sinks, bathroom sinks, tubs, showers, and floor drains cleared at the root of the problem."],
      ["Main line stoppages", "Whole-house backups traced to the cause and cleared, with trenchless options if the line has failed."],
      ["Hydro jetting", "High-pressure water scours grease, mineral scale, and root fibers off the entire pipe wall."],
      ["Camera inspection", "See the true condition of your line before you approve any further work."],
      ["Drain repair", "Recurring clogs usually have a cause. We find it, fix it, and back it with our warranty."],
      ["Honest advice on chemicals", "Chemical cleaners can damage pipes and rarely fix the cause. We solve it for good."],
    ],
    angleH: (a) => `Why ${a.city} drains clog the way they do.`,
    angleCopy: (a) => `<p>${a.homes} Under those homes run ${a.sewer}. Add ${a.water}, and every drain narrows a little more each year.</p><p>That is why a cable machine alone rarely solves a ${a.city} clog for good. We match the method to the line: a cleanout for a simple stoppage, hydro jetting when grease, scale, or roots have taken over the pipe wall, and a camera inspection whenever the same drain keeps coming back around ${a.landmarks}. You see the price before we start.</p>`,
    signals: { heading: (a) => `Signs a ${a.city} drain needs a pro`, items: ["Water pools in the shower or tub before it drains", "The kitchen sink backs up when the dishwasher runs", "Gurgling from a toilet or floor drain when another fixture drains", "More than one drain is slow at the same time", "A clog that comes back a few weeks after you cleared it", "Sewer smell from a drain or from the yard"] },
    reviews: ["james", "karen", "pankaj"], couponFocus: "new",
    faqs: (a) => [
      { q: `Do you offer same-day drain cleaning in ${a.city}?`, a: `We aim for same-day scheduling whenever we can. ${a.city} is ${a.drive}, our phone line is answered 24/7, and we dispatch a licensed plumber at the first available appointment.` },
      { q: "Should I try a chemical drain cleaner first?", a: "We generally advise against it. Chemical cleaners can damage certain pipes and usually do not remove the underlying cause, like grease buildup or roots. A professional cleanout is the safest path to a lasting fix." },
      { q: `Will you tell me if my ${a.city} home actually needs hydro jetting?`, a: `Only if it does. A standard cleanout handles most single-fixture clogs. Hydro jetting earns its keep on recurring clogs, greasy kitchen lines, and roots, which are common with ${a.sewer}. If a camera inspection shows the line itself has failed, we show you the footage before recommending anything else.` },
      COMMON_FAQS.cost,
    ],
    finalH: (a) => `Get that ${a.city} drain flowing today.`,
    finalP: "Licensed, local, and family-owned since 2012. Same-day scheduling whenever possible, upfront pricing, and every job backed by our warranty. New customers save 5%.",
  },
  {
    slug: "water-heaters", name: "Water Heater Repair & Installation", short: "Water Heaters", hubLabel: "Water Heaters",
    blurb: "Repair and install, tank and tankless. $100 off install.",
    img: "assets/generated/svc-water-heater.png", imgAlt: (a) => `New water heater installed by Rooter-Man of Austin in ${a.city}`,
    bandImg: "assets/client/work-water-heater.jpg", bandAlt: "Water heater installed by Rooter-Man of Austin, real job photo",
    h1: (a) => `Water heater repair and installation in ${a.city}, <span class="accent">with $100 off a new install.</span>`,
    desc: (a) => `${a.city} water heater repair and replacement: gas, electric, and tankless, honest repair-or-replace advice, $100 off installs. Licensed M40109. Call (512) 645-1441.`,
    lead: (a) => `${a.homes} Add ${a.water}, and water heaters in ${a.city} tend to rumble, run lukewarm, and fail earlier than the label promised. We give you a straight repair-or-replace answer, the price before any work, and $100 off if it is time for a new one.`,
    checksH: (a) => `Water heaters in ${a.city}, repair or replace.`,
    checks: [
      ["Water heater repair", "No hot water, lukewarm showers, pilot or element problems diagnosed and fixed."],
      ["Tank replacement", "Gas and electric tanks swapped, hauled away, and installed to code."],
      ["Tankless systems", "Endless hot water and lower bills. We install and service tankless too."],
      ["Honest repair-or-replace advice", "Under about 10 years old, repair often wins. Over that, we show you the math."],
      ["Code &amp; safety updates", "Expansion tanks, pans, straps, and venting brought up to code with the install."],
      ["$100 off install", "Water heater installs come with $100 off, valid through Dec 31, 2026."],
    ],
    angleH: (a) => `Hard water and ${a.city} water heaters.`,
    angleCopy: (a) => `<p>Mineral scale settles at the bottom of every tank in ${a.city}, insulating the burner or elements from the water. The unit works harder, gets louder, and delivers less hot water each year. It happens faster here because of ${a.water}.</p><p>A flush can buy time on a younger unit. Past a certain age, replacement is the honest answer, and we show you the math either way. Most standard replacements are completed the same or next day once you approve the price, hauled away, and installed to code with the expansion tank, pan, and strapping the code calls for.</p>`,
    signals: { heading: (a) => `Signs your ${a.city} water heater is on its way out`, items: ["Rumbling or popping from the tank", "Hot water that runs out faster than it used to", "Rusty or cloudy hot water", "Water around the base of the tank", "A pilot light that will not stay lit, or a breaker that trips", "A tank past ten years old that has already needed repairs"] },
    reviews: ["gabe", "william", "katie"], couponFocus: "wh",
    faqs: (a) => [
      { q: "Should I repair or replace my water heater?", a: "Generally, repair makes sense when the unit is under about 10 years old and only a few components are involved. Replacement is often smarter when it is over 10 years old, has needed multiple repairs, or efficiency has dropped. We give you an honest recommendation, not a sales pitch." },
      { q: `How fast can you replace a water heater in ${a.city}?`, a: `Most standard replacements are done the same or next day once you approve the price. ${a.city} is ${a.drive}, so getting a new unit to you is not the slow part.` },
      { q: "Do you install tankless water heaters?", a: "Yes. We repair and install gas, electric, and tankless systems, and we will tell you honestly whether tankless makes sense for your home and usage." },
      { q: `Is the $100 off available in ${a.city}?`, a: "Yes. Take $100 off a water heater install with Rooter-Man anywhere in our service area, valid through Dec 31, 2026. It cannot be combined with other coupons, and new customers can use their 5% discount instead if it saves more." },
    ],
    finalH: (a) => `Hot water back in ${a.city}, $100 kept.`,
    finalP: "Licensed M40109, family-owned since 2012. Honest repair-or-replace advice, upfront pricing, warranty-backed installs, and $100 off water heater installs through 2026.",
  },
  {
    slug: "emergency-plumber", name: "Emergency Plumber", short: "Emergency Plumber", hubLabel: "Emergency Plumber",
    blurb: "Calls answered 24/7, first-available dispatch.",
    img: "assets/generated/emergency-night-van.png", imgAlt: (a) => `Rooter-Man of Austin service van ready to respond in ${a.city}`,
    bandImg: "assets/client/brokenpipe.jpg", bandAlt: "Corroded, leaking pipe found by Rooter-Man of Austin, real job photo",
    h1: (a) => `Plumbing emergency in ${a.city}? <span class="accent">We answer 24/7.</span>`,
    desc: (a) => `Emergency plumber for ${a.city}, TX. Burst pipes, sewage backups, no hot water. Calls answered 24/7, licensed plumbers dispatched at the first available appointment. Call (512) 645-1441.`,
    lead: (a) => `A burst pipe or a sewer backup in ${a.city} does not wait for business hours, and neither does our phone line. A real person answers day or night, walks you through what to shut off, and gets you on the schedule immediately. ${a.city} is ${a.drive}, and we dispatch a licensed plumber at the first available appointment, same-day whenever we can.`,
    checksH: (a) => `Emergency plumbing in ${a.city}, handled.`,
    checks: [
      ["Burst &amp; leaking pipes", "Shut it down, stop the damage, and make the lasting repair."],
      ["Sewage backups", "Backups into tubs and floor drains cleared and the cause diagnosed."],
      ["No hot water", "Water heater failures diagnosed fast, with same-day replacement when needed."],
      ["Major leaks &amp; flooding", "Slab, wall, and yard leaks pinpointed with acoustic and thermal tools."],
      ["Gas water heater safety", "Venting and connection issues handled by licensed pros, to code."],
      ["Straight answers first", "We tell you what to shut off and what to expect before we arrive."],
    ],
    angleH: (a) => `What goes wrong in ${a.city} homes, and what to do first.`,
    angleCopy: (a) => `<p>${a.homes} The emergencies we see most in ${a.city} come from ${a.pressure}, and from ${a.sewer}.</p><p>First: close the fixture's shutoff valve, or the main shutoff by the meter if you cannot isolate it. If the water heater is leaking, kill its breaker or set a gas unit to pilot. Then call ${PHONE_DISPLAY}. We are honest about timing: crews run during service hours and we do not promise a 2am arrival, but you will never wait until Monday to be heard.</p>`,
    signals: { heading: () => "Call right away if", items: ["Water is spraying or pouring and you cannot stop it", "Sewage is backing up into a tub, shower, or floor drain", "The water heater is leaking from the tank itself", "You smell gas near a gas water heater", "A ceiling or wall is bulging or dripping", "You have no water at all, or no hot water with small kids or elderly family at home"] },
    reviews: ["william", "karen", "adam"], couponFocus: "new",
    faqs: (a) => [
      { q: "Are you open 24/7?", a: "Our phone line is answered 24/7, so you can always reach a real person, describe the emergency, and get booked immediately. Our plumbers run during regular service hours, and we dispatch at the first available appointment, same-day whenever possible." },
      { q: `How fast can you get to ${a.city}?`, a: `${a.city} is ${a.drive}. Our line is answered around the clock and we dispatch at the first available appointment, same-day whenever possible. We will tell you honestly on the phone where you fall in the schedule.` },
      { q: "What should I do while I wait?", a: "Shut off the nearest valve, or the main shutoff at the meter if you cannot isolate the fixture. For a leaking water heater, turn off its breaker or set the gas control to pilot. Move belongings out of the water's path. We will walk you through it on the phone." },
      COMMON_FAQS.cost,
    ],
    finalH: () => "Call now. A real person answers.",
    finalP: "Our line is answered 24/7 and a licensed, warranty-backed plumber is dispatched at the first available appointment, same-day whenever possible. New customers save 5%.",
  },
  {
    slug: "plumbing-repair", name: "Plumbing Repair", short: "Plumbing Repair", hubLabel: "Plumbing Repair",
    blurb: "Leaks, water pressure, faucets, toilets, disposals, water lines.",
    img: "assets/client/work-media-17.jpg", imgAlt: (a) => `Finished shower valve replacement by Rooter-Man of Austin, the standard for ${a.city} repairs`,
    bandImg: "assets/client/prv.jpg", bandAlt: "Pressure regulator replaced by Rooter-Man of Austin, real job photo",
    h1: (a) => `Plumbing repair in ${a.city}, <span class="accent">diagnosed right the first time.</span>`,
    desc: (a) => `${a.city} plumbing repair: leaks, water pressure, faucets, toilets, disposals, water lines, and repiping by licensed plumbers with upfront pricing. Call (512) 645-1441.`,
    lead: (a) => `${a.homes} That is the backdrop for most plumbing repair calls in ${a.city}: ${a.pressure}, fixtures worn by ${a.water}, and the occasional surprise behind a wall. We diagnose the actual cause, quote the fix before we start, and back the work with our warranty.`,
    checksH: (a) => `Plumbing repair in ${a.city}, end to end.`,
    checks: [
      ["Leak detection &amp; repair", "Slab, wall, yard, and fixture leaks pinpointed with acoustic sensors and thermal imaging."],
      ["Water pressure repair", "Failing regulators, hidden leaks, and scale buildup diagnosed and corrected."],
      ["Toilets &amp; faucets", "Repairs and installs done in hours, backed by a strong labor warranty."],
      ["Garbage disposals", "Jam, leak, or hum? Honest repair-or-replace call, handled same-day or next available."],
      ["Piping &amp; repiping", "Failing lines evaluated honestly: targeted repair versus full repipe, with financing available."],
      ["Water line repair", "Main line issues located with professional testing gear, often fixed in a single day."],
    ],
    angleH: (a) => `Repairs that fit ${a.city} homes.`,
    angleCopy: (a) => `<p>Homes on ${a.foundation} do not fail the way homes with a basement do. Supply lines run under the slab or through the attic, drains run under concrete, and ${a.pressure} sets up the failures we see most around ${a.landmarks}.</p><p>So we do not guess. A licensed plumber finds the real cause, whether that is a regulator, a corroded valve, a hidden leak, or a fixture at the end of its life, and explains the options in plain language, English or Spanish. You approve the exact price before any work begins.</p>`,
    signals: { heading: (a) => `Common ${a.city} repair calls`, items: ["A faucet or shower valve that drips or will not shut off", "Water pressure that dropped, or pipes that hammer", "A toilet that runs, rocks, or leaks at the base", "A garbage disposal that hums, jams, or leaks", "A water bill that jumped with no change in use", "A shutoff valve that will not turn, or seeps when you try"] },
    reviews: ["aragon", "leyna", "karen"], couponFocus: "new",
    faqs: (a) => [
      { q: "How do you find hidden leaks?", a: "We use non-invasive acoustic sensors and thermal imaging to pinpoint yard leaks, slab leaks, wall leaks, and fixture leaks without tearing your home apart guessing. You often get a ballpark estimate right over the phone." },
      { q: "My water pressure suddenly dropped. What is it?", a: "Sudden pressure loss almost always points to something specific: a hidden leak, a failing pressure regulator, mineral buildup from hard water, or a main line problem. We diagnose the real cause instead of guessing, then fix it." },
      { q: `Do you repair older plumbing in ${a.city}?`, a: `Yes. ${cap(a.pressure)} is common here, and we evaluate whether a targeted repair solves it before anyone talks about a repipe. If a repipe is the honest answer, we lay out the pros, cons, and financing options.` },
      COMMON_FAQS.cost,
    ],
    finalH: () => "One call fixes it for good.",
    finalP: "Licensed, local, and family-owned since 2012. Upfront pricing, no upsell pressure, and every repair backed by our warranty. New customers save 5%.",
  },
  {
    slug: "sewer-septic", name: "Sewer Line Repair & Septic", short: "Sewer & Septic", hubLabel: "Sewer & Septic",
    blurb: "Trenchless repair, tunneling, camera inspection, septic pumping.",
    img: "assets/generated/svc-sewer-trenchless.png", imgAlt: (a) => `Trenchless sewer repair equipment in a ${a.city} yard`,
    bandImg: "assets/client/underground3.jpg", bandAlt: "New drain lines set by Rooter-Man of Austin in an excavated line, real job photo",
    h1: (a) => `Sewer line repair in ${a.city}, <span class="accent">without wrecking your yard.</span>`,
    desc: (a) => `${a.city} sewer line repair, trenchless replacement, tunneling under slabs, camera inspection, and same-day septic pumping. Licensed M40109, warranty-backed. Call (512) 645-1441.`,
    lead: (a) => `Sewer trouble in ${a.city} usually starts with ${a.sewer}, sitting on ${a.foundation}. We camera the line first so you see the actual failure, then choose the least destructive fix: a spot repair, trenchless replacement through one or two small access points, or precision tunneling when the break is under the house.`,
    checksH: (a) => `Sewer and septic in ${a.city}, end to end.`,
    checks: [
      ["Sewer line repair", "Breaks, bellies, and root intrusion diagnosed on camera and repaired to code."],
      ["Trenchless replacement", "Rehabilitate or replace the line through small access points, sparing yards, trees, and patios."],
      ["Under-slab tunneling", "Precision tunneling reaches lines under slab foundations without breaking up your home."],
      ["Septic pumping", "Same-day pumping, inspection, and straight guidance on keeping the system healthy."],
      ["Grinder &amp; ejector pumps", "Pump service and replacement for below-grade fixtures."],
      ["Camera inspections", "See the real condition of the line before you approve any work."],
    ],
    angleH: (a) => `What ${a.city} soil does to sewer lines.`,
    angleCopy: (a) => `<p>The ground under ${a.foundation} moves with the weather. Wet months swell the ground, dry months shrink it, and buried sewer lines get pushed out of grade, cracked at the joints, or bellied where water and solids collect. Add ${a.sewer} and you have the two causes behind most ${a.city} sewer failures.</p><p>We do not open a trench across your yard to find out which one you have. A camera inspection shows the break, the belly, or the roots, and we recommend the repair that matches, warranty-backed. Septic customers get the same straight answer on pumping, inspection, and drain field health.</p>`,
    signals: { heading: (a) => `Signs your ${a.city} sewer line is failing`, items: ["Slow drains throughout the house at the same time", "Gurgling toilets or drains when other fixtures run", "Sewage odor inside or in the yard", "Wet, sunken, or unusually green patches over the line", "Backups into a tub, shower, or floor drain", "Recurring clogs that a cleanout only fixes for a few weeks"] },
    reviews: ["pankaj", "adam", "james"], couponFocus: "new",
    faqs: (a) => [
      { q: "What is trenchless sewer repair?", a: "Trenchless methods rehabilitate or replace your sewer line through one or two small access points instead of digging a trench across the whole yard. In established neighborhoods full of trees, patios, and slab foundations, that matters." },
      { q: `Do you tunnel under slabs in ${a.city}?`, a: `Yes. When the break is under the foundation, precision tunneling reaches the line from outside so we are not breaking up floors inside your home. On ${a.foundation}, that is often the least disruptive option, and we show you the camera footage before recommending it.` },
      { q: "How often should my septic tank be pumped?", a: "Most household tanks need pumping every 3 to 5 years depending on size and usage. Slow drains everywhere, gurgling, odors, or soggy spots near the drain field mean it is due. We offer same-day septic pumping across Greater Austin." },
      COMMON_FAQS.licensed,
    ],
    finalH: (a) => `Get eyes on the line in ${a.city} today.`,
    finalP: "Camera-verified diagnosis, trenchless options, and warranty-backed work from a licensed, family-owned Austin crew. Financing available on larger projects. New customers save 5%.",
  },
  {
    slug: "leak-detection", name: "Leak Detection", short: "Leak Detection", hubLabel: "Leak Detection",
    blurb: "Slab, wall, and yard leaks pinpointed, then repaired.",
    img: "assets/generated/svc-leak-detection.png", imgAlt: (a) => `Leak detection equipment locating a hidden leak in a ${a.city} home`,
    bandImg: "assets/client/leak.jpg", bandAlt: "Wall opened for a leak repair by Rooter-Man of Austin, real job photo",
    h1: (a) => `Leak detection in ${a.city}, <span class="accent">found without tearing up your home.</span>`,
    desc: (a) => `${a.city} leak detection: slab leaks, wall and ceiling leaks, yard and water line leaks pinpointed with acoustic and thermal tools, then repaired by licensed plumbers. Call (512) 645-1441.`,
    lead: (a) => `A high water bill, a warm spot on the floor, or a patch of yard that never dries out is how most ${a.city} leaks announce themselves. With ${a.foundation} and ${a.pressure}, the leak is rarely where the water shows up. We pinpoint it with acoustic sensors and thermal imaging, then repair it, instead of opening walls and floors on a guess.`,
    checksH: (a) => `Leak detection in ${a.city}, end to end.`,
    checks: [
      ["Slab leak detection", "Warm floors, running-water sounds, and bills that doubled traced to the exact point under the slab."],
      ["Wall &amp; ceiling leaks", "Damp drywall and stains tracked to the fitting or fixture behind them."],
      ["Yard &amp; water line leaks", "Soft, green, or soggy patches traced to the service line or an irrigation tie-in."],
      ["Acoustic &amp; thermal tools", "Non-invasive location first, so the repair opens one spot instead of five."],
      ["Repair, reroute, or tunnel", "The fix that matches the leak: spot repair, an attic reroute, or tunneling under the slab."],
      ["High water bill diagnosis", "If the meter spins with everything off, we find out why."],
    ],
    angleH: (a) => `Where ${a.city} leaks hide.`,
    angleCopy: (a) => `<p>${a.homes} Water lines here run through the slab or the attic, and the ground under ${a.foundation} shifts enough over the seasons to work on every joint and fitting. Add ${a.water}, and copper and galvanized pipe corrode from the inside at the same time.</p><p>A slab leak often shows up as a warm floor tile, a water heater that never shuts off, or a bill that doubled. A yard leak shows up as a green stripe or a soft spot. We locate the exact point of failure first, tell you what the repair involves, and give you the price before any concrete or drywall is touched.</p>`,
    signals: { heading: (a) => `Signs of a hidden leak in ${a.city}`, items: ["A water bill that jumped with no change in habits", "The sound of running water when everything is off", "A warm spot on a slab floor", "Damp drywall, a bulging ceiling, or a musty smell", "A soft, green, or soggy patch in the yard", "Low pressure at one fixture or across the house"] },
    reviews: ["aragon", "william", "karen"], couponFocus: "new",
    faqs: (a) => [
      { q: "How do you find hidden leaks?", a: "We use non-invasive acoustic sensors and thermal imaging to pinpoint yard leaks, slab leaks, wall leaks, and fixture leaks without tearing your home apart guessing. You often get a ballpark estimate right over the phone." },
      { q: `What does a slab leak repair involve in ${a.city}?`, a: `It depends where the leak is. Some slab leaks are repaired at the spot, some are rerouted through the attic or walls so no concrete is opened, and some call for tunneling under the slab from outside. On ${a.foundation}, we explain which one fits your home and why before quoting.` },
      { q: "Can the leak be in the yard and not the house?", a: "Yes, and it is common. The service line between the meter and the house runs through soil that moves, and a leak there shows up as a soft or green patch, a drop in pressure, or a bill that jumped. We test at the meter first to tell you which side of the house the problem is on." },
      COMMON_FAQS.cost,
    ],
    finalH: (a) => `Find the leak in ${a.city}, then fix it once.`,
    finalP: "Licensed M40109, family-owned since 2012. Non-invasive leak location, upfront pricing, and every repair backed by our warranty. New customers save 5%.",
  },
];
const TRACK_BY_SLUG = Object.fromEntries(TRACKS.map((t) => [t.slug, t]));

/* ---- 7 new English hubs, same shape as `services` so buildServicePage renders them. ---- */
const expansionHubs = [
  {
    slug: "leak-detection/",
    title: "Leak Detection in Austin, TX | Slab, Wall & Yard Leaks | Rooter-Man of Austin",
    desc: "Austin leak detection by licensed plumbers. Slab leaks, wall and ceiling leaks, yard and water line leaks pinpointed with acoustic and thermal tools, then repaired. Call (512) 645-1441.",
    crumb: "Leak Detection",
    h1: `Leak detection in Austin, <span class="accent">found without guesswork.</span>`,
    sub: "A jump in the water bill, a warm spot on the floor, or a patch of yard that never dries out. We pinpoint the leak with acoustic sensors and thermal imaging, explain the repair, and give you the price before any concrete or drywall is opened.",
    img: "assets/client/brokenpipe.jpg",
    imgAlt: "Corroded, leaking pipe uncovered by Rooter-Man of Austin, real job photo",
    checks: [
      ["Slab leak detection", "Warm floors, running-water sounds, and bills that doubled traced to the exact spot under the slab."],
      ["Wall &amp; ceiling leaks", "Damp drywall and stains tracked to the fitting or fixture behind them, not the whole wall."],
      ["Yard &amp; water line leaks", "Soft, green, or soggy patches traced to the service line between the meter and the house."],
      ["Acoustic &amp; thermal tools", "Non-invasive location first, so the repair opens one spot instead of five."],
      ["Repair, reroute, or tunnel", "Spot repair, an attic reroute, or tunneling under the slab, whichever fits the leak and the home."],
      ["High water bill diagnosis", "If the meter spins with everything off, we find out why."],
    ],
    bandImg: "assets/client/leak.jpg",
    bandAlt: "Wall opened for a leak repair by Rooter-Man of Austin, real job photo",
    bandH: "Austin leaks hide under concrete.",
    bandCopy: `<p>Most Central Texas homes sit on a slab, so supply lines run under the concrete or through the attic. Clay and limestone soil moves with every wet and dry spell, hard water works on the inside of copper and galvanized pipe, and a pinhole leak can run for months before it shows.</p><p>Guessing is expensive. We locate the leak first with acoustic and thermal tools, then explain exactly what the repair involves. Sometimes that is a spot repair. Sometimes a reroute through the attic avoids opening the slab entirely. When tunneling is the honest answer, we say so, and you see the price before anything is touched.</p>`,
    reviews: ["aragon", "william", "karen"],
    faqs: [
      { q: "How do you find hidden leaks?", a: "We use non-invasive acoustic sensors and thermal imaging to pinpoint yard leaks, slab leaks, wall leaks, and fixture leaks without tearing your home apart guessing. You often get a ballpark estimate right over the phone." },
      { q: "How do I know if I have a slab leak?", a: "The classic signs are a water bill that jumped, the sound of running water when everything is off, a warm spot on the floor, a water heater that never seems to shut off, or low pressure. Any one of those is worth a call. A quick meter test tells us whether water is moving somewhere it should not be." },
      { q: "Do you fix the leak or just find it?", a: "Both. Locating is the first step; the same licensed plumber explains the repair options, quotes the price, and does the work, backed by our warranty." },
      COMMON_FAQS.cost,
      COMMON_FAQS.hours,
    ],
    couponFocus: "new",
    finalH: "Find it. Fix it once.",
    finalP: "Licensed M40109, family-owned since 2012. Non-invasive leak location, upfront pricing, and every repair backed by our warranty. New customers save 5%.",
  },
  {
    slug: "slab-leak-repair/",
    title: "Slab Leak Repair in Austin, TX | Detection, Reroute & Tunneling | Rooter-Man",
    desc: "Austin slab leak repair by licensed plumbers: leak located under the slab, then spot repair, attic reroute, or precision tunneling. Upfront pricing, warranty-backed. Call (512) 645-1441.",
    crumb: "Slab Leak Repair",
    h1: `Slab leak repair in Austin, <span class="accent">without breaking up your floors.</span>`,
    sub: "A leak under the foundation is the most common hidden leak in Central Texas. We locate it precisely, then fix it the least disruptive way: at the spot, by rerouting the line, or by tunneling under the slab from outside.",
    img: "assets/client/work-tunnel.jpg",
    imgAlt: "New line run through a tunnel under a slab foundation by Rooter-Man of Austin, real job photo",
    checks: [
      ["Slab leak detection", "Acoustic listening and thermal imaging pinpoint the leak under the concrete."],
      ["Spot repair", "When the leak is accessible and the rest of the line is sound, we open one spot and fix it."],
      ["Reroute through the attic or walls", "Abandon the failed run under the slab and run a new line where it can be reached."],
      ["Under-slab tunneling", "Precision tunneling from outside reaches the line without breaking up floors inside."],
      ["Hot and cold side leaks", "Warm-floor hot side leaks and silent cold side leaks both located and repaired."],
      ["Straight answers on cost", "You see the options and the price before any concrete or drywall is opened."],
    ],
    bandImg: "assets/client/work-slab-sewer.jpg",
    bandAlt: "Rooter-Man of Austin plumber working on lines beneath a broken-out slab, real job photo",
    bandH: "Why Central Texas slabs leak.",
    bandCopy: `<p>Austin homes are built on clay and limestone that swell after rain and shrink through drought. The slab rides on that soil, and the copper lines embedded in or under it flex with every cycle. Add hard water working on the pipe from the inside and a pinhole is a matter of time.</p><p>This is our own crew working under an Austin slab. Before anyone breaks concrete, we locate the leak, check the condition of the rest of the line, and lay out the honest options. A reroute often costs less and disrupts less than a spot repair under the living room. Tunneling keeps the work outside. Whichever fits, it is warranty-backed.</p>`,
    reviews: ["william", "aragon", "pankaj"],
    faqs: [
      { q: "What are the signs of a slab leak?", a: "A water bill that jumped, a warm spot on a floor, the sound of running water with everything off, a water heater that runs constantly, cracks or moisture at the base of walls, or a drop in pressure. A meter test confirms whether water is moving." },
      { q: "Do you have to break up my floor?", a: "Not always. If the line can be rerouted through the attic or walls, or reached by tunneling under the slab from outside, the floors inside stay intact. We show you the options and what each involves before quoting." },
      { q: "Is a slab leak covered by insurance?", a: "Policies differ. Many cover the damage a leak causes and some cover access, but not always the pipe repair itself. We document the location and the work, which is what most claims need. Check with your carrier early." },
      COMMON_FAQS.cost,
      COMMON_FAQS.licensed,
    ],
    couponFocus: "new",
    finalH: "Stop the slab leak, keep the floors.",
    finalP: "Licensed M40109, family-owned since 2012. Slab leaks located precisely, repaired the least disruptive way, and backed by our warranty. Financing available on larger projects.",
  },
  {
    slug: "toilet-repair/",
    title: "Toilet Repair & Installation in Austin, TX | Rooter-Man of Austin | Licensed M40109",
    desc: "Austin toilet repair and installation: running toilets, clogs, leaks at the base, rocking toilets, and new installs done in hours by licensed plumbers. Call (512) 645-1441.",
    crumb: "Toilet Repair",
    h1: `Toilet repair in Austin, <span class="accent">fixed in one visit.</span>`,
    sub: "Running, clogged, rocking, or leaking at the base. Most toilet calls are diagnosed and fixed the same visit, and most standard installs are done in a few hours, backed by a strong labor warranty.",
    img: "assets/generated/svc-toilet-install.png",
    imgAlt: "New toilet installed by Rooter-Man of Austin",
    checks: [
      ["Running toilets", "Fill valves, flappers, and flush valves worn by hard water replaced so the tank stops cycling."],
      ["Clogged toilets", "Stubborn clogs cleared, and the drain line checked when the same toilet keeps backing up."],
      ["Leaks at the base", "A failed wax ring or a cracked flange fixed before the subfloor takes damage."],
      ["Rocking or loose toilets", "Flange repair and proper setting so the toilet stops moving and stops leaking."],
      ["New toilet installation", "Standard installs done in a few hours, old toilet hauled away, backed by our labor warranty."],
      ["Supply &amp; shutoff repair", "Seeping shutoff valves and supply lines replaced while we are there."],
    ],
    bandImg: "assets/client/drain.jpg",
    bandAlt: "Rooter-Man of Austin plumber working in a customer's bathroom, real job photo",
    bandH: "Most toilet calls are fixed in one visit.",
    bandCopy: `<p>Austin's hard water is hard on the small parts inside a toilet. Scale builds up on fill valves and flappers, the tank starts running or ghost-flushing, and the water bill creeps up. A toilet that rocks or leaks at the base is usually a flange or wax ring problem, and waiting lets water into the subfloor.</p><p>A licensed plumber checks the whole fixture, not just the symptom, explains what failed, and gives you the price before any work. If the toilet is worth replacing, we say so and can install a new one the same visit. If it is not, we fix what is broken and leave it at that.</p>`,
    reviews: ["leyna", "karen", "pankaj"],
    faqs: [
      { q: "Why does my toilet keep running?", a: "Usually a worn flapper, a fill valve that no longer shuts off cleanly, or a float set too high. Hard water scale wears these parts early. It is a quick, inexpensive repair, and it stops the water bill from creeping up." },
      { q: "My toilet clogs all the time. Is it the toilet or the drain?", a: "Sometimes the toilet: older low-flow models and partial mineral blockages in the trap both cause repeat clogs. Sometimes the drain line behind it. We check both and tell you which one you actually have before recommending anything." },
      { q: "How long does a toilet installation take?", a: "Most standard installs are done in a few hours, including removing and hauling away the old toilet, a new wax ring or seal, and checking the flange and supply. The work carries our labor warranty." },
      COMMON_FAQS.cost,
      COMMON_FAQS.hours,
    ],
    couponFocus: "new",
    finalH: "Get the toilet fixed today.",
    finalP: "Licensed, local, and family-owned since 2012. Upfront pricing, no upsell pressure, and every repair backed by our warranty. New customers save 5%.",
  },
  {
    slug: "garbage-disposal/",
    title: "Garbage Disposal Repair & Installation in Austin, TX | Rooter-Man of Austin",
    desc: "Austin garbage disposal repair and replacement. Jammed, humming, leaking, or dead disposals diagnosed with an honest repair-or-replace call, same-day or next available. Call (512) 645-1441.",
    crumb: "Garbage Disposals",
    h1: `Garbage disposal repair in Austin, <span class="accent">the honest repair-or-replace call.</span>`,
    sub: "Humming, jammed, leaking from underneath, or dead at the switch. We diagnose it in minutes, tell you whether a repair is worth it, and if not, install a new disposal the same visit.",
    img: "assets/generated/svc-garbage-disposal.png",
    imgAlt: "Garbage disposal replacement under a kitchen sink by Rooter-Man of Austin",
    checks: [
      ["Humming or jammed", "Jams cleared and the motor checked. If it hums but will not turn, we tell you why."],
      ["Leaking disposal", "Leaks from the body, the sink flange, or the dishwasher connection found and fixed."],
      ["Dead at the switch", "Reset, wiring, and switch problems ruled out before anyone replaces a working unit."],
      ["New disposal installation", "Correct size and horsepower for the household, installed and tested the same visit."],
      ["Drain &amp; dishwasher hookup", "The disposal drain, P-trap, and dishwasher line connected and leak-checked."],
      ["Honest repair-or-replace call", "A cracked body or a seized motor means replacement. Anything else, we say so."],
    ],
    bandImg: "assets/client/vancleaning.jpg",
    bandAlt: "Rooter-Man of Austin technician pulling parts from the service van, real job photo",
    bandH: "Jam, leak, or hum: the honest call.",
    bandCopy: `<p>A garbage disposal is a small appliance with a short list of failure modes. A jam or a tripped reset is a quick fix. A leak from the sink flange or the dishwasher connection is a repair. A leak from the body of the unit or a motor that hums and never turns is the end of its life, and no repair is worth the money.</p><p>We carry replacement units on the truck, so if the honest answer is a new disposal, it is installed and tested the same visit. Either way you see the price first, and the work is backed by our warranty.</p>`,
    reviews: ["james", "leyna", "adam"],
    faqs: [
      { q: "My disposal hums but does not spin. Is it dead?", a: "Not necessarily. A hum usually means the motor has power but the impeller is jammed. If clearing the jam frees it, it is a quick repair. If the motor is seized, replacement is the honest answer, and we tell you which one you have on the spot." },
      { q: "Should I repair or replace my garbage disposal?", a: "Repair a jam, a tripped reset, or a leak at a connection. Replace a unit that leaks from the body, has a seized motor, or is old enough that the next failure is close. We give you a straight recommendation, not a sales pitch." },
      { q: "Can you install a disposal where there was not one?", a: "Usually, yes. It needs a properly wired switch and outlet and the right drain configuration under the sink. We check both and quote the full job before starting." },
      COMMON_FAQS.cost,
      COMMON_FAQS.hours,
    ],
    couponFocus: "new",
    finalH: "Get the disposal running again.",
    finalP: "Licensed, local, and family-owned since 2012. Same-day or next available, upfront pricing, and every job backed by our warranty. New customers save 5%.",
  },
  {
    slug: "tankless-water-heaters/",
    title: "Tankless Water Heater Installation & Repair in Austin, TX | Rooter-Man of Austin",
    desc: "Austin tankless water heater installation, repair, and descaling. Gas and electric tankless, tank-to-tankless conversions, honest advice on whether tankless fits your home. $100 off installs. Call (512) 645-1441.",
    crumb: "Tankless Water Heaters",
    h1: `Tankless water heaters in Austin, <span class="accent">installed and maintained right.</span>`,
    sub: "Endless hot water and lower bills, if the unit is sized, vented, and maintained for Austin's hard water. We install, repair, and descale tankless systems, and we tell you honestly when a tank is still the better buy.",
    img: "assets/generated/svc-water-heater.png",
    imgAlt: "Water heater installation by Rooter-Man of Austin",
    checks: [
      ["Tankless installation", "Gas and electric tankless units sized for the household and installed to code, with $100 off."],
      ["Tankless repair", "Error codes, ignition problems, and fluctuating temperature diagnosed and fixed."],
      ["Descaling &amp; maintenance", "Annual flushing that keeps hard-water scale from choking the heat exchanger."],
      ["Tank-to-tankless conversion", "Gas line, venting, and electrical requirements evaluated honestly before you commit."],
      ["Commercial tankless", "High-demand systems for restaurants and multi-unit properties."],
      ["Honest fit advice", "If tankless does not fit your home or your usage, we say so and show you the math."],
    ],
    bandImg: "assets/client/work-water-heater.jpg",
    bandAlt: "Water heater installed by Rooter-Man of Austin, real job photo",
    bandH: "Tankless in Austin needs a maintenance plan.",
    bandCopy: `<p>A tankless unit heats water on demand through a narrow heat exchanger. Austin's hard water leaves scale in that exchanger, and without an annual descale the unit loses efficiency, throws error codes, and fails early. Most tankless complaints we see come down to skipped maintenance or an undersized install.</p><p>We size the unit to how your household actually uses hot water, confirm the gas supply and venting can support it, and set you up on a flushing schedule. If a conventional tank is still the smarter spend for your home, we tell you that first.</p>`,
    reviews: ["gabe", "katie", "william"],
    faqs: [
      { q: "Is a tankless water heater worth it in Austin?", a: "For many homes, yes: endless hot water, lower standby losses, and a longer service life. The catch is hard water. A tankless unit here needs annual descaling to keep working the way it should. We walk through your usage and the install requirements and give you a straight answer." },
      { q: "Why does my tankless water heater go cold or throw a code?", a: "The most common causes are scale in the heat exchanger, a clogged inlet filter, ignition or gas supply problems, or a unit that is undersized for simultaneous use. We diagnose the actual cause before recommending a repair." },
      { q: "Can I switch from a tank to tankless?", a: "Often, yes. Gas tankless units usually need a larger gas line and different venting, and electric units need significant electrical capacity. We evaluate all of it up front so there are no surprises in the quote." },
      { q: "Is there $100 off a tankless install?", a: "Yes. The $100 off water heater install applies to tankless installs too, valid through Dec 31, 2026. It cannot be combined with other coupons." },
      COMMON_FAQS.hours,
    ],
    couponFocus: "wh",
    finalH: "Endless hot water, done right.",
    finalP: "Licensed M40109, family-owned since 2012. Tankless sized and installed to code, maintained for hard water, and backed by our warranty. $100 off installs through 2026.",
  },
  {
    slug: "repiping/",
    title: "Repiping & Water Line Repair in Austin, TX | Copper & PEX | Rooter-Man of Austin",
    desc: "Austin repiping and water line repair. Failing galvanized, polybutylene, and pinholing copper replaced with copper or PEX, main water line repair and replacement, financing available. Call (512) 645-1441.",
    crumb: "Repiping & Water Lines",
    h1: `Repiping and water line repair in Austin, <span class="accent">when patching stops making sense.</span>`,
    sub: "Rusty water, weak pressure everywhere, and a new leak every few months are the signs a home's supply lines are at the end of their life. We evaluate honestly, repair what can be repaired, and repipe when that is the smarter spend.",
    img: "assets/client/work-castiron.jpg",
    imgAlt: "Old pipe removed from an Austin home by Rooter-Man of Austin, real job photo",
    checks: [
      ["Whole-home repiping", "Failing galvanized or polybutylene lines replaced with copper or PEX, done to code."],
      ["Water line repair", "Main line breaks between the meter and the house located with testing gear and repaired, often in a single day."],
      ["Water line replacement", "New service lines run when the old one has failed in more than one place."],
      ["Pinhole copper leaks", "Repeated pinholes evaluated honestly: targeted repair versus replacing the run."],
      ["Water pressure fixes", "Regulators and scaled-up lines that starve the house of pressure corrected."],
      ["Financing available", "Larger repipe projects can be financed. We lay out the options with the quote."],
    ],
    bandImg: "assets/client/waterline.jpg",
    bandAlt: "New water line trenched to an Austin home by Rooter-Man of Austin, real job photo",
    bandH: "When repair stops making sense.",
    bandCopy: `<p>This is a real Rooter-Man water line job. Central Texas clay and limestone work buried lines back and forth with every wet and dry cycle, and hard water attacks galvanized and older copper from the inside. At some point the third leak in a year is not bad luck, it is the pipe.</p><p>We do not lead with a repipe. A licensed plumber evaluates whether a targeted repair solves the problem first. When a repipe or a new service line is the honest answer, we explain why, show you copper versus PEX, quote the full job, and offer financing on larger projects.</p>`,
    reviews: ["karen", "pankaj", "adam"],
    faqs: [
      { q: "Do I need a full repipe?", a: "Not always. Frequent leaks, rusty water, or weak pressure across the whole house can mean pipes are at the end of their life, but we evaluate whether a targeted repair solves it first. If a repipe is the honest answer, we lay out the pros, cons, and financing options." },
      { q: "Copper or PEX?", a: "Both are done to code and both carry our warranty. PEX handles Austin's soil movement and hard water well and usually costs less to install. Copper is the traditional choice and still right for some homes. We explain the trade-offs for your house before you decide." },
      { q: "How do you know the leak is in the main water line?", a: "A meter test with everything off tells us water is moving. From there we use listening equipment along the line to locate the break instead of digging up the whole yard. Most main line repairs are finished in a single day." },
      COMMON_FAQS.cost,
      COMMON_FAQS.licensed,
    ],
    couponFocus: "new",
    finalH: "Fix the pipe, not the symptom.",
    finalP: "Licensed M40109, family-owned since 2012. Honest evaluation, upfront pricing, financing on larger projects, and every job backed by our warranty.",
  },
  {
    slug: "hydro-jetting/",
    title: "Hydro Jetting & Sewer Camera Inspection in Austin, TX | Rooter-Man of Austin",
    desc: "Austin hydro jetting and sewer camera inspection. Grease, scale, and roots scoured off the whole pipe wall, with camera proof before and after. Residential and commercial. Call (512) 645-1441.",
    crumb: "Hydro Jetting",
    h1: `Hydro jetting in Austin, <span class="accent">clean the whole pipe, not just a hole in the clog.</span>`,
    sub: "A cable machine punches through a clog. Hydro jetting scours the entire pipe wall with high-pressure water, clearing grease, mineral scale, and root fibers so the clog does not come back next month. We show you the line on camera first.",
    img: "assets/generated/svc-hydro-jetting.png",
    imgAlt: "Hydro jetting a clogged drain line in Austin",
    checks: [
      ["Hydro jetting", "High-pressure water cleans the full circumference of the pipe from cleanout to main."],
      ["Sewer camera inspection", "See the actual condition of the line, and where the problem is, before any work."],
      ["Grease &amp; scale removal", "Kitchen lines and hard-water scale cleared back to the original pipe diameter."],
      ["Root removal", "Root fibers cut and flushed out, with an honest read on whether the line itself needs repair."],
      ["Pre-purchase sewer scope", "Buying an older Austin home? Know what the sewer line looks like before you close."],
      ["Commercial jetting programs", "Scheduled jetting keeps restaurant and multi-unit lines from backing up mid-service."],
    ],
    bandImg: "assets/client/underground3.jpg",
    bandAlt: "New drain lines set by Rooter-Man of Austin in an excavated line, real job photo",
    bandH: "See the line. Then clean the whole pipe.",
    bandCopy: `<p>Austin drain lines fill up from the inside: hard-water scale on the pipe wall, grease from the kitchen, and roots from the live oaks and pecans over older sewer laterals. A cable opens a channel through that buildup and the drain works for a few weeks. Jetting removes the buildup.</p><p>We camera the line first. If it is a clean pipe with a simple clog, we say so and do the simpler job. If it is scaled, greasy, or rooted, jetting is the fix that lasts. If the camera shows a broken or bellied line, no amount of cleaning will fix it, and you will see that footage before anyone recommends a repair.</p>`,
    reviews: ["james", "pankaj", "adam"],
    faqs: [
      { q: "What is hydro jetting and do I need it?", a: "Hydro jetting uses high-pressure water to scrub the entire pipe wall, flushing out grease, scale, and roots that a cable machine leaves behind. It is the right call for recurring clogs and greasy kitchen lines. We will tell you honestly whether a standard cleanout is enough." },
      { q: "Is hydro jetting safe for older pipes?", a: "In sound pipe, yes. That is why we camera the line first. If the pipe is cracked, bellied, or badly deteriorated, jetting is not the answer and we tell you what is." },
      { q: "Should I get a sewer scope before buying a house?", a: "In Austin, yes, especially on homes from the 1970s or earlier with cast iron or clay sewer lines under mature trees. A camera inspection shows the real condition of the line and can save you from a large surprise after closing." },
      COMMON_FAQS.cost,
      COMMON_FAQS.hours,
    ],
    couponFocus: "new",
    finalH: "Clear it for good.",
    finalP: "Licensed, local, and family-owned since 2012. Camera-verified diagnosis, hydro jetting when it is the right call, and every job backed by our warranty. New customers save 5%.",
  },
];

/* ---- grids ---- */
function byCityGrid(trackSlug, label) {
  const cards = AREA_KEYS.map((k) => `<a class="area reveal" href="${R}${trackSlug}/${k}/"><b>${PIN_SVG}${AREAS[k].city}</b><span>${label}</span></a>`).join("\n      ");
  return `
<section>
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">By city</span>
      <h2>${label} across Greater Austin.</h2>
      <p>Pick your city for local details, or call ${PHONE_DISPLAY} and we will get you on the schedule.</p>
    </div>
    <div class="areas-grid">
      ${cards}
    </div>
  </div>
</section>`;
}

function cityServiceGrid(c) {
  const k = areaKey(c);
  if (!AREAS[k]) return serviceLinksGrid();
  const items = TRACKS.map((t) => [`${t.short} in ${c.city}`, `${R}${t.slug}/${k}/`, t.blurb]);
  items.push(["Commercial Plumbing", `${R}commercial-plumbing/`, "Restaurants, offices, retail, and multi-unit properties."]);
  items.push(["More services", `${R}#services`, "Toilets, disposals, tankless, repiping, hydro jetting, and more."]);
  return items.map(([t, href, d]) => `<a class="svc reveal" href="${href}"><h3>${t}</h3><p>${d}</p><div class="links"><span style="color:var(--blue)">Learn More →</span></div></a>`).join("\n      ");
}

/* ---- service x city page ---- */
function buildMatrixPage(t, a, k) {
  R = "../../";
  const slug = `${t.slug}/${k}/`;
  const title = `${t.name} in ${a.city}, TX | Rooter-Man of Austin | Licensed M40109`;
  const faqs = t.faqs(a);
  const checks = t.checks.map(([b, d]) => `<div class="check reveal">${CHECK_SVG}<div><b>${b}</b><span>${d}</span></div></div>`).join("\n      ");
  const signals = t.signals.items.map((x) => `<div class="check reveal">${CHECK_SVG}<div><b>${x}</b></div></div>`).join("\n      ");
  const others = TRACKS.filter((x) => x.slug !== t.slug).map((x) => `<a class="svc reveal" href="${R}${x.slug}/${k}/"><h3>${x.short} in ${a.city}</h3><p>${x.blurb}</p><div class="links"><span style="color:var(--blue)">Learn More →</span></div></a>`).join("\n      ");
  const nearby = a.nearby.map((n) => `<a class="src-chip" href="${R}${t.slug}/${n}/">${AREAS[n].city}</a>`).join("\n      ");
  const html = `${head(title, t.desc(a), slug)}
${UTIL()}
${HEADER()}

<section class="phero" id="top">
  <div class="phero-img"><img src="${R}${t.img}" alt="${esc(t.imgAlt(a))}" /></div>
  <div class="wrap">
    <div class="phero-inner">
      <div class="crumb"><a href="${R}">Home</a><span class="sep">/</span><a href="${R}${t.slug}/">${t.hubLabel}</a><span class="sep">/</span><a href="${R}plumber-${k}/">${a.city}</a></div>
      <h1>${t.h1(a)}</h1>
      <p class="sub">${t.lead(a)}</p>
      <div class="offers">
        <span class="offer-chip"><span class="dot"></span>New customers save 5%</span>
        <span class="offer-chip"><span class="dot blue"></span>$100 off water heater install</span>
        <span class="fine">Mention online. Valid through Dec 31, 2026. Cannot be combined.</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Call ${PHONE_DISPLAY}</a>
        <a class="btn btn-book btn-lg" href="${BOOK_URL()}">Book Online</a>
      </div>
      <div class="hero-micro"><span class="pulse"></span> Licensed M40109 · Warranty-Backed · Bilingual · Calls Answered 24/7</div>
    </div>
  </div>
</section>

${TRUSTBAR()}

<section class="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">What we handle</span>
      <h2>${t.checksH(a)}</h2>
    </div>
    <div class="checks">
      ${checks}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="ph reveal"><img src="${R}${t.bandImg}" alt="${esc(t.bandAlt)}" loading="lazy" /></div>
    <div class="reveal body-copy">
      <span class="eyebrow">The ${a.city} angle</span>
      <h2>${t.angleH(a)}</h2>
      ${t.angleCopy(a)}
      <div class="hero-cta" style="margin-top:1.3rem">
        <a class="btn btn-call" href="${PHONE_TEL}">${PHONE_SVG} ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">Know the signs</span>
      <h2>${t.signals.heading(a)}</h2>
      <p>${a.city} is ${a.setting}. Around ${a.landmarks}, these are the calls we get most.</p>
    </div>
    <div class="checks">
      ${signals}
    </div>
  </div>
</section>

${STEPS()}

<section class="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">More in ${a.city}</span>
      <h2>Other Rooter-Man services in ${a.city}.</h2>
      <p>One licensed crew for the whole house. <a href="${R}plumber-${k}/" style="color:var(--blue);font-weight:700">All plumbing in ${a.city}</a> or <a href="${R}${t.slug}/" style="color:var(--blue);font-weight:700">${t.short.toLowerCase()} across Greater Austin</a>.</p>
    </div>
    <div class="svc-grid">
      ${others}
    </div>
    <div class="rev-src reveal" style="justify-content:flex-start">
      <span class="lbl">${t.short} nearby</span>
      ${nearby}
    </div>
  </div>
</section>

${reviewsBlock(t.reviews, "What your neighbors say about Rooter-Man.")}
${coupons(t.couponFocus)}
${faqBlock(faqs)}
${finalCta(t.finalH(a), t.finalP)}
${FOOTER()}
${schema(`${t.name} in ${a.city}`, slug, faqs, [a.city, "Austin"])}
${TAIL()}`;
  mkdirSync(`${t.slug}/${k}`, { recursive: true });
  writeFileSync(`${t.slug}/${k}/index.html`, html);
  R = "../";
}

/* ---- Spanish hub: /plomero/ ---- */
function buildPlomeroPage() {
  R = "../";
  const slug = "plomero/";
  const title = "Plomero en Austin, TX | Hablamos Español | Rooter-Man of Austin | Licencia M40109";
  const desc = "Plomeros con licencia en Austin y alrededores. Destapado de drenajes, calentadores de agua, fugas, drenaje sanitario y séptico. Llamadas atendidas 24/7 en español. Llame al (512) 645-1441.";
  const faqs = [
    { q: "¿Hablan español?", a: "Sí. Ofrecemos servicio completo en inglés y español. Cuando llame, díganos que prefiere español y revisaremos el problema, el precio y la garantía en su idioma." },
    { q: "¿Tienen licencia?", a: "Sí. Rooter-Man of Austin cuenta con licencia de plomería del estado de Texas, número M40109, y somos una empresa familiar que sirve al área de Austin desde 2012." },
    { q: "¿Cuánto cuesta el servicio?", a: "Depende del trabajo, pero siempre damos el precio por adelantado. Para muchos servicios podemos dar un estimado aproximado por teléfono, y usted ve el precio antes de que empiece cualquier trabajo. Sin presión de ventas." },
    { q: "¿Atienden emergencias?", a: "Nuestra línea telefónica se atiende las 24 horas, los 7 días de la semana. Describa el problema y lo ponemos en la agenda de inmediato. Nuestros plomeros trabajan en horario de servicio y despachamos a la primera cita disponible, el mismo día siempre que sea posible." },
    { q: "¿Qué zonas cubren?", a: `Austin y sus alrededores: Cedar Park, Round Rock, Georgetown, Pflugerville, Leander, Hutto, Brushy Creek, Wells Branch, el sur, norte y este de Austin, West Lake Hills y Lakeway.` },
  ];
  const checks = [
    ["Destapado de drenajes", "Lavabos, tinas, regaderas y líneas principales destapadas desde la causa, con hidrolavado e inspección con cámara."],
    ["Calentadores de agua", "Reparación e instalación de calentadores de gas, eléctricos y sin tanque. $100 de descuento en la instalación."],
    ["Detección y reparación de fugas", "Fugas bajo la losa, en paredes y en el patio localizadas con equipo acústico y térmico, sin adivinar."],
    ["Drenaje sanitario y séptico", "Reparación de líneas de drenaje sin zanjas, túneles bajo la losa y bombeo de fosas sépticas el mismo día."],
    ["Reparaciones en general", "Inodoros, llaves, trituradores, presión de agua y tuberías, con precio por adelantado y garantía."],
    ["Emergencias", "Llamadas atendidas 24/7. Despacho de un plomero con licencia a la primera cita disponible."],
  ].map(([b, d]) => `<div class="check reveal">${CHECK_SVG}<div><b>${b}</b><span>${d}</span></div></div>`).join("\n      ");
  const html = `${head(title, desc, slug, "es")}
${UTIL()}
${HEADER()}

<section class="phero" id="top">
  <div class="phero-img"><img src="${R}assets/client/van3.jpg" alt="Camioneta de servicio de Rooter-Man of Austin" /></div>
  <div class="wrap">
    <div class="phero-inner">
      <div class="crumb"><a href="${R}">Inicio</a><span class="sep">/</span><span>Plomero en Austin</span></div>
      <h1>Plomero en Austin, <span class="accent">hablamos español.</span></h1>
      <p class="sub">Plomeros con licencia (M40109), empresa familiar desde 2012. Le explicamos el problema, el precio y la garantía en español antes de empezar cualquier trabajo. Llamadas atendidas las 24 horas.</p>
      <div class="offers">
        <span class="offer-chip"><span class="dot"></span>Clientes nuevos ahorran 5%</span>
        <span class="offer-chip"><span class="dot blue"></span>$100 de descuento en calentador de agua</span>
        <span class="fine">Mencione esta oferta. Válida hasta el 31 de diciembre de 2026. No se combina con otras ofertas.</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Llame al ${PHONE_DISPLAY}</a>
        <a class="btn btn-book btn-lg" href="${BOOK_URL()}">Reservar en línea</a>
      </div>
      <div class="hero-micro"><span class="pulse"></span> Licencia M40109 · Con garantía · Bilingüe · Llamadas atendidas 24/7</div>
    </div>
  </div>
</section>

<div class="trustbar">
  <div class="wrap">
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg></div><b>Licencia M40109</b><span>Plomeros con licencia de Texas</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg></div><b>Desde 2012</b><span>Empresa familiar en Austin</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></div><b>Cita el mismo día</b><span>Siempre que sea posible</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><b>Con garantía</b><span>Cada trabajo respaldado</span></div>
    <div class="trust-card"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14M5 8a2 2 0 0 1 0-4h14a2 2 0 0 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8M9 12h6"/></svg></div><b>Hablamos Español</b><span>Servicio completo en español</span></div>
  </div>
</div>

<section class="services">
  <div class="wrap">
    <div class="sec-head reveal">
      <span class="eyebrow">Nuestros servicios</span>
      <h2>Todo lo que necesita su casa, en su idioma.</h2>
    </div>
    <div class="checks">
      ${checks}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="ph reveal"><img src="${R}assets/client/drain.jpg" alt="Plomero de Rooter-Man of Austin trabajando en el baño de un cliente, foto real" loading="lazy" /></div>
    <div class="reveal body-copy">
      <span class="eyebrow">Cómo trabajamos</span>
      <h2>Servicio completo en español, de principio a fin.</h2>
      <p>Cuando llama, díganos que prefiere español. Un plomero con licencia revisa el problema real, se lo explica con claridad y le da el precio antes de empezar. Sin sorpresas y sin presión de ventas.</p>
      <p>El agua dura de Austin y el suelo de arcilla y caliza son duros con la plomería: sarro en los calentadores, raíces en los drenajes viejos y fugas bajo la losa. Conocemos estos problemas porque los reparamos todos los días, y cada trabajo está respaldado por nuestra garantía.</p>
      <div class="hero-cta" style="margin-top:1.3rem">
        <a class="btn btn-call" href="${PHONE_TEL}">${PHONE_SVG} ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Así de simple</span>
      <h2>Honesto, claro y el mismo día cuando se puede.</h2>
    </div>
    <div class="steps">
      <div class="step reveal"><div class="n">1</div><h3>Llámenos</h3><p>Atendemos las 24 horas al ${PHONE_DISPLAY}. Cuéntenos qué pasa y le damos las opciones más cercanas, muchas veces el mismo día.</p></div>
      <div class="step reveal"><div class="n">2</div><h3>Diagnóstico y precio por adelantado</h3><p>Un plomero con licencia revisa el problema real y se lo explica en español. Usted ve el precio antes de que empiece el trabajo.</p></div>
      <div class="step reveal"><div class="n">3</div><h3>El trabajo bien hecho</h3><p>Trabajamos limpio y conforme al código, probamos todo y dejamos su casa como la encontramos. Cada trabajo tiene garantía.</p></div>
    </div>
  </div>
</section>

<section class="reviews">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Sus vecinos confían en nosotros</span>
      <h2>Calificación de 4.9 estrellas en Google.</h2>
      <p>Más de 1,200 familias y negocios de Austin han dejado su reseña.</p>
    </div>
    <div class="agg reveal">
      <span class="g-badge"><span class="num">4.9</span><span class="stars">★★★★★</span><span>Más de 1,200 reseñas en Google</span></span>
    </div>
    <div class="rev-src reveal">
      <span class="lbl">Lea nuestras reseñas en</span>
      <a class="src-chip" href="${GOOGLE_REVIEWS}" target="_blank" rel="noopener">Google</a>
      <a class="src-chip" href="${YELP_REVIEWS}" target="_blank" rel="noopener">Yelp</a>
    </div>
  </div>
</section>

<section class="coupons">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Ahorre en su próximo servicio</span>
      <h2>Ofertas actuales de Rooter-Man.</h2>
    </div>
    <div class="wrap with-mascot" style="padding:0;display:grid;gap:22px;margin-top:38px">
      <div class="mascot-col reveal"><img src="${R}assets/client/rm-mascot.png" alt="Mascota de Rooter-Man" loading="lazy" /></div>
      <div class="coupon reveal">
        <div class="big">5% MENOS</div>
        <h3>Para clientes nuevos</h3>
        <p>¿Primera vez con Rooter-Man of Austin? Ahorre 5% en su primer servicio.</p>
        <span class="fine">No se combina con otros cupones. Aplican restricciones. Válido del 1 de enero al 31 de diciembre de 2026.</span>
        <a class="btn btn-call" href="${PHONE_TEL}">Llamar al ${PHONE_DISPLAY}</a>
      </div>
      <div class="coupon blue reveal">
        <div class="big">$100 MENOS</div>
        <h3>Instalación de calentador de agua</h3>
        <p>¿Va a cambiar o instalar un calentador de agua? Ahorre $100 con Rooter-Man.</p>
        <span class="fine">No se combina con otros cupones. Aplican restricciones. Válido del 1 de enero al 31 de diciembre de 2026.</span>
        <a class="btn btn-book" href="${PHONE_TEL}">Llamar al ${PHONE_DISPLAY}</a>
      </div>
    </div>
  </div>
</section>

<section id="faq-sec">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="eyebrow">Bueno saber</span>
      <h2>Preguntas frecuentes.</h2>
    </div>
    <div class="faq-list">
      ${faqs.map((f, i) => `<details class="faq"${i === 0 ? " open" : ""}><summary>${f.q}<span class="pl">+</span></summary><p>${f.a}</p></details>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="final" id="book">
  <div class="bg"><img src="${R}assets/generated/trust-family-water.png" alt="" /></div>
  <div class="wrap">
    <span class="eyebrow on-dark reveal">Cuando usted quiera</span>
    <h2 class="reveal" style="margin-top:.5rem">Llame ahora. Le atendemos en español.</h2>
    <p class="reveal">Plomeros con licencia, empresa familiar desde 2012. Precio por adelantado, trabajo con garantía y cita el mismo día siempre que sea posible. Clientes nuevos ahorran 5%.</p>
    <div class="hero-cta reveal">
      <a class="btn btn-call btn-lg" href="${PHONE_TEL}">${PHONE_SVG} Llamar ${PHONE_DISPLAY}</a>
      <a class="btn btn-book btn-lg" href="${BOOK_URL()}">Reservar en línea</a>
    </div>
    <div class="fine reveal">Llamadas atendidas 24/7 · Hablamos Español</div>
  </div>
</section>
${FOOTER()}
${schema("Plomero en Austin", slug, faqs)}
${TAIL()}`;
  mkdirSync("plomero", { recursive: true });
  writeFileSync("plomero/index.html", html);
  console.log("wrote", slug);
}

/* ---- sitemap ---- */
function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [...SITEMAP].map((p) => `  <url><loc>${BASE}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n");
  writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  console.log("sitemap:", SITEMAP.size, "urls");
}

/* ============================= BUILD ============================= */
const MATRIX_HUB_SLUGS = new Set(TRACKS.map((t) => t.slug + "/"));
for (const s of [...services, ...expansionHubs]) if (MATRIX_HUB_SLUGS.has(s.slug)) s.byCity = s.slug.replace(/\/$/, "");

R = "../";
services.forEach(buildServicePage);
expansionHubs.forEach(buildServicePage);
cities.forEach(buildCityPage);
newAreas.forEach(buildCityPage);
buildPlomeroPage();
buildBookingPage();
buildLegacyStubs();
let matrixCount = 0;
for (const t of TRACKS) for (const k of AREA_KEYS) { buildMatrixPage(t, AREAS[k], k); matrixCount++; }
R = "../";
console.log("wrote", matrixCount, "service x city pages");
writeSitemap();
console.log("done:", services.length + expansionHubs.length + cities.length + newAreas.length + 1 + 1 + matrixCount, "pages +", legacyStubs.length, "stubs");

// Verify the output before it ships. Fails the build (exit 1) on unquoted href/src values,
// leaked ${...} placeholders, or internal links that point at nothing. See check-links.mjs.
await import("./check-links.mjs");
