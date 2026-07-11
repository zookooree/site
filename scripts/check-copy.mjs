// Copy-fidelity gate: every paragraph of copy/site-copy.md must appear
// verbatim in the built page. The copy file is the source of truth; this
// script is what makes that claim enforceable. Run after `astro build`:
//
//   npm run check:copy
//
// Exits non-zero (stops the line) if any paragraph is missing or drifted.

import { readFileSync } from "node:fs";

const normalize = (s) => s.replace(/\s+/g, " ").trim();

const decodeEntities = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

// Rendered text: drop style blocks, drop tags (inline tags like <strong> and
// <a> sit inside text with their own surrounding whitespace), decode
// entities, collapse whitespace.
const html = readFileSync(new URL("../dist/index.html", import.meta.url), "utf8");
const rendered = normalize(
  decodeEntities(html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, "")),
);

// Source paragraphs: skip headings, rules, and the editorial note line;
// strip markdown bold markers and link syntax.
const md = readFileSync(new URL("../copy/site-copy.md", import.meta.url), "utf8");
const paragraphs = md
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && l !== "---" && !l.startsWith("#") && !l.startsWith("*Final"))
  .map((l) => normalize(l.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")));

const missing = paragraphs.filter((p) => !rendered.includes(p));

if (missing.length > 0) {
  console.error(`copy check FAILED: ${missing.length} of ${paragraphs.length} paragraphs missing or drifted:`);
  for (const p of missing) console.error(`  - ${p.slice(0, 80)}...`);
  process.exit(1);
}

console.log(`copy check passed: all ${paragraphs.length} paragraphs of copy/site-copy.md render verbatim.`);
