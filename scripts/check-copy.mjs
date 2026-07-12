// Copy gate: fidelity plus the mechanical rules of issue #8, compiled so
// they never regress. Run after `astro build`:
//
//   npm run check:copy
//
// Checks, all fail-closed (any failure stops the line, exit 1):
//
//   1. Fidelity: every paragraph of each copy file renders verbatim in its
//      built page (copy/home.md -> dist/index.html, copy/story.md ->
//      dist/story/index.html, copy/floor.md -> dist/floor/index.html).
//   2. Dashes: zero em dashes (U+2014) or en dashes (U+2013) in any copy
//      file or any source page/component/layout file.
//   3. Soul budget: "soul" appears at most once in homepage copy,
//      case-insensitive.
//   4. Length budget: homepage copy is 450 words max (headings excluded,
//      body paragraphs counted).
//   5. No "coming soon" anywhere: copy files, source files, built pages.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const rel = (p) => relative(root, p);

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
const renderedText = (html) =>
  normalize(
    decodeEntities(html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, "")),
  );

// Source paragraphs: skip headings, rules, comments, and blanks; strip
// markdown bold markers and link syntax.
const paragraphsOf = (md) =>
  md
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && l !== "---" && !l.startsWith("#") && !l.startsWith("<!--"))
    .map((l) => normalize(l.replace(/\*\*/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")));

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const pages = [
  { copy: join(root, "copy/home.md"), html: join(root, "dist/index.html") },
  { copy: join(root, "copy/story.md"), html: join(root, "dist/story/index.html") },
  { copy: join(root, "copy/floor.md"), html: join(root, "dist/floor/index.html") },
];

const failures = [];

// ── 1. Fidelity ─────────────────────────────────────────────────────────
let paragraphCount = 0;
for (const { copy, html } of pages) {
  let rendered;
  try {
    rendered = renderedText(readFileSync(html, "utf8"));
  } catch {
    failures.push(`fidelity: built page ${rel(html)} is missing (did the build run?)`);
    continue;
  }
  const paragraphs = paragraphsOf(readFileSync(copy, "utf8"));
  paragraphCount += paragraphs.length;
  for (const p of paragraphs) {
    if (!rendered.includes(p)) {
      failures.push(`fidelity: paragraph of ${rel(copy)} missing or drifted in ${rel(html)}: "${p.slice(0, 70)}..."`);
    }
  }
}

// ── 2. Dashes ───────────────────────────────────────────────────────────
const copyFiles = pages.map((p) => p.copy).concat(join(root, "copy/RUBRIC.md"));
const srcFiles = walk(join(root, "src"));
for (const file of [...copyFiles, ...srcFiles]) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (line.includes("—")) failures.push(`dashes: em dash (U+2014) in ${rel(file)}:${i + 1}`);
    if (line.includes("–")) failures.push(`dashes: en dash (U+2013) in ${rel(file)}:${i + 1}`);
  });
}

// ── 3. Soul budget ──────────────────────────────────────────────────────
// Counted over the copy paragraphs (what renders), not file annotations.
const homeCopy = readFileSync(join(root, "copy/home.md"), "utf8");
const homeParagraphText = paragraphsOf(homeCopy).join(" ");
const soulCount = (homeParagraphText.match(/soul/gi) ?? []).length;
if (soulCount > 1) {
  failures.push(`soul budget: "soul" appears ${soulCount} times in copy/home.md; the budget is 1`);
}

// ── 4. Length budget ────────────────────────────────────────────────────
const homeWords = homeParagraphText.split(/\s+/).filter(Boolean).length;
if (homeWords > 450) {
  failures.push(`length budget: homepage copy is ${homeWords} words; the budget is 450`);
}

// ── 5. No "coming soon" ─────────────────────────────────────────────────
const distFiles = walk(join(root, "dist")).filter((f) => f.endsWith(".html"));
for (const file of [...copyFiles, ...srcFiles, ...distFiles]) {
  if (/coming soon/i.test(readFileSync(file, "utf8"))) {
    failures.push(`coming soon: forbidden string in ${rel(file)}`);
  }
}

// ── Verdict ─────────────────────────────────────────────────────────────
if (failures.length > 0) {
  console.error(`copy gate FAILED (${failures.length} problem${failures.length === 1 ? "" : "s"}):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `copy gate passed: ${paragraphCount} paragraphs verbatim across ${pages.length} pages; ` +
    `zero em/en dashes; "soul" x${soulCount} on the homepage (budget 1); ` +
    `homepage ${homeWords}/450 words; no "coming soon".`,
);
