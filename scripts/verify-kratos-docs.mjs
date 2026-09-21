import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const enRoot = path.join(root, "src/content/docs/docs");
const zhRoot = path.join(root, "src/content/docs/zh-cn/docs");
const baselinePath = path.join(root, "scripts/kratos-docs-baseline.json");
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.mdx?$/.test(entry.name) ? [full] : [];
  });
}

function relativePages(dir) {
  return walk(dir).map((file) => path.relative(dir, file)).sort();
}

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].replace(/^['"]|['"]$/g, "")]),
  );
}

function codeBlocks(text) {
  return [...text.matchAll(/^```([^\n]*)\n([\s\S]*?)^```\s*$/gm)].map(
    (match) => ({ language: match[1].trim().split(/\s+/)[0], code: match[2] }),
  );
}

function headingLevels(text) {
  return [...text.matchAll(/^(#{2,6})\s+.+$/gm)].map((match) => match[1].length);
}

function routeFor(locale, relative) {
  const withoutExtension = relative.replace(/\.(md|mdx)$/, "");
  const suffix = withoutExtension === "index" ? "" : `${withoutExtension}/`;
  return `${locale === "zh" ? "/zh-cn" : ""}/docs/${suffix}`;
}

const enPages = relativePages(enRoot);
const zhPages = relativePages(zhRoot);
for (const relative of enPages.filter((page) => !zhPages.includes(page))) {
  failures.push(`Missing Chinese page: ${relative}`);
}
for (const relative of zhPages.filter((page) => !enPages.includes(page))) {
  failures.push(`Missing English page: ${relative}`);
}

const knownRoutes = new Set([
  "/",
  "/zh-cn/",
  ...enPages.map((page) => routeFor("en", page)),
  ...zhPages.map((page) => routeFor("zh", page)),
]);

for (const relative of enPages.filter((page) => zhPages.includes(page))) {
  const enPath = path.join(enRoot, relative);
  const zhPath = path.join(zhRoot, relative);
  const en = fs.readFileSync(enPath, "utf8");
  const zh = fs.readFileSync(zhPath, "utf8");
  const enMeta = frontmatter(en);
  const zhMeta = frontmatter(zh);
  if (!enMeta.id || enMeta.id !== zhMeta.id) {
    failures.push(`Mismatched frontmatter id: ${relative}`);
  }

  const enHeadings = headingLevels(en);
  const zhHeadings = headingLevels(zh);
  if (JSON.stringify(enHeadings) !== JSON.stringify(zhHeadings)) {
    failures.push(`Mismatched heading structure: ${relative}`);
  }

  const enBlocks = codeBlocks(en);
  const zhBlocks = codeBlocks(zh);
  if (enBlocks.length !== zhBlocks.length) {
    failures.push(`Mismatched code block count: ${relative}`);
  } else {
    enBlocks.forEach((block, index) => {
      const peer = zhBlocks[index];
      if (block.language !== peer.language) {
        failures.push(`Mismatched code language: ${relative} block ${index + 1}`);
      }
      if (block.code !== peer.code) {
        failures.push(`Mismatched bilingual code: ${relative} block ${index + 1}`);
      }
    });
  }
}

for (const file of [...walk(enRoot), ...walk(zhRoot)]) {
  const text = fs.readFileSync(file, "utf8");
  const relative = path.relative(root, file);
  if (!relative.includes("/migration/") && /github\.com\/go-kratos\/kratos(?:\/[^\s`"')]+)?\/v2(?:\b|\/)/.test(text)) {
    failures.push(`v2 framework import outside migration guide: ${relative}`);
  }
  for (const match of text.matchAll(/\[[^\]]*\]\((\/(?:zh-cn\/)?docs\/[^)#?]*)(?:[?#][^)]*)?\)/g)) {
    let route = match[1];
    if (!route.endsWith("/")) route += "/";
    if (!knownRoutes.has(route)) failures.push(`Broken internal link in ${relative}: ${match[1]}`);
  }
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
for (const [name, value] of [
  ["Kratos", baseline.kratos?.commit],
  ["layout", baseline.layout?.commit],
  ["v2 migration", baseline.migrationFrom?.commit],
]) {
  if (!/^[0-9a-f]{40}$/.test(value ?? "")) failures.push(`Invalid ${name} baseline commit`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(`Verified ${enPages.length} English and ${zhPages.length} Chinese Kratos pages.`);
