#!/usr/bin/env node
/**
 * Post-build verification for the generated site.
 * Run: node check-links.mjs   (also runs automatically at the end of build-pages.mjs)
 *
 * Exists because a template-literal slip in the footer shipped `href=R + "plumbing-repair/"`
 * into every generated page on 2026-07-03. That is legal JS and legal HTML, so nothing
 * complained: the browser read `href="R"` and dropped the rest, and six footer links on
 * all 16 pages 404'd for 46 days. These three checks catch that whole class of bug.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "fs";
import { join, dirname, resolve, relative } from "path";

const ROOT = process.cwd();
const SKIP_DIRS = new Set([".git", "node_modules", "research", "assets"]);

function htmlFiles(dir = ROOT, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

const EXTERNAL = /^(https?:|\/\/|mailto:|tel:|sms:|data:|javascript:|#)/i;
const errors = [];
const files = htmlFiles();

for (const file of files) {
  const rel = relative(ROOT, file);
  const raw = readFileSync(file, "utf8");
  // Blank out <script>/<style> bodies (line count preserved) so inline JS like `y.src=r`
  // is not mistaken for markup. Opening tags stay, so <script src="..."> is still checked.
  const html = raw.replace(
    /(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (_, open, _tag, body, close) => open + body.replace(/[^\n]/g, " ") + close
  );
  const lineOf = (index) => html.slice(0, index).split("\n").length;

  // 1. Unquoted href/src values. This is the exact shape of the July 3 bug: the browser
  //    silently truncates at the first space and throws the remainder away.
  for (const m of html.matchAll(/\b(href|src)\s*=\s*([^"'\s>][^\s>]*)/gi)) {
    errors.push(`${rel}:${lineOf(m.index)}  unquoted ${m[1]} value: ${m[0].slice(0, 60)}`);
  }

  // 2. Un-evaluated template placeholders that leaked into the output as literal text.
  for (const m of html.matchAll(/\$\{[^}]*\}/g)) {
    errors.push(`${rel}:${lineOf(m.index)}  un-evaluated placeholder: ${m[0].slice(0, 60)}`);
  }

  // 3. Internal links and assets that do not resolve to a real file on disk.
  for (const m of html.matchAll(/\b(?:href|src)\s*=\s*"([^"]*)"/gi)) {
    const href = m[1].trim();
    if (!href || EXTERNAL.test(href)) continue;
    const path = href.split("#")[0].split("?")[0];
    if (!path) continue;

    const target = path.startsWith("/")
      ? resolve(ROOT, "." + path)
      : resolve(dirname(file), path);

    const ok = path.endsWith("/")
      ? existsSync(join(target, "index.html"))
      : existsSync(target) &&
        (statSync(target).isFile() || existsSync(join(target, "index.html")));

    if (!ok) errors.push(`${rel}:${lineOf(m.index)}  dead link: ${href}`);
  }
}

if (errors.length) {
  console.error(`\nFAIL: ${errors.length} problem(s) across ${files.length} HTML files\n`);
  for (const e of errors) console.error("  " + e);
  console.error("");
  process.exit(1);
}
console.log(`link check passed: ${files.length} HTML files, all internal links resolve`);
