#!/usr/bin/env node
// Checks every style in styles/: header, compile per flavor and accent,
// palette-only colors, and no private hosts. Exit 1 on any error.
//
//   npm run check                 all styles
//   npm run check -- claude       one style
//   npm run check -- --refresh    re-download the Catppuccin lib first

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import less from "less";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "github.com/nemesis398/catppuccin-userstyles";
const LIB_URL = "https://userstyles.catppuccin.com/lib/std/v1.less";
const LIB_CACHE = join(ROOT, ".cache/lib/std/v1.less");

const FLAVORS = ["latte", "frappe", "macchiato", "mocha"];
const ACCENTS = [
  "rosewater", "flamingo", "pink", "mauve", "red", "maroon", "peach", "yellow",
  "green", "teal", "blue", "sapphire", "sky", "lavender", "subtext0",
];

// Strings that must never be published: our own network and domains.
const PRIVATE = [/\b10\.69\.\d/, /\b192\.168\.\d/, /runeknowledge/i, /familieboehme/i, /\bmboehme\b/];

// A line containing this marker may hold a literal color, e.g. a selector
// that matches the site's own inline style.
const ALLOW = "ctp-allow";

const args = process.argv.slice(2);
const refresh = args.includes("--refresh");
const only = args.filter((a) => !a.startsWith("--"));

async function libPath() {
  if (refresh || !existsSync(LIB_CACHE)) {
    const res = await fetch(LIB_URL);
    if (!res.ok) throw new Error(`fetching ${LIB_URL}: HTTP ${res.status}`);
    mkdirSync(dirname(LIB_CACHE), { recursive: true });
    writeFileSync(LIB_CACHE, await res.text());
  }
  return LIB_CACHE;
}

function parseHeader(src) {
  const m = src.match(/\/\* ==UserStyle==\n([\s\S]*?)\n==\/UserStyle== \*\//);
  if (!m) return null;
  const meta = {};
  const vars = {};
  for (const line of m[1].split("\n")) {
    const v = line.match(/^@var\s+(\w+)\s+([\w-]+)\s+"[^"]*"\s+(.+)$/);
    if (v) {
      vars[v[2]] = { type: v[1], value: defaultValue(v[1], v[3].trim()) };
      continue;
    }
    const kv = line.match(/^@(\w+)\s+(.+)$/);
    if (kv) meta[kv[1]] = kv[2].trim();
  }
  return { meta, vars, end: m.index + m[0].length };
}

function defaultValue(type, raw) {
  if (type === "select" || type === "dropdown") {
    const options = JSON.parse(raw);
    const starred = options.find((o) => o.endsWith("*")) ?? options[0];
    return starred.replace(/\*$/, "").split(":")[0];
  }
  if (type === "text" || type === "color") return raw.replace(/^"(.*)"$/, "$1");
  return raw; // checkbox, number, range
}

function checkHeader(slug, meta, vars, errors) {
  const expect = {
    namespace: `${REPO}/styles/${slug}`,
    homepageURL: `https://${REPO}/tree/main/styles/${slug}`,
    updateURL: `https://${REPO}/raw/main/styles/${slug}/catppuccin.user.less`,
    supportURL: `https://${REPO}/issues`,
    author: "Mika Böhme",
    license: "MIT",
    preprocessor: "less",
  };
  for (const [key, want] of Object.entries(expect)) {
    if (meta[key] !== want) errors.push(`@${key} is "${meta[key] ?? ""}", want "${want}"`);
  }
  if (!meta.name) errors.push("@name missing");
  if (!meta.description) errors.push("@description missing");
  if (!/^\d{4}\.\d{2}\.\d{2}(\.\d+)?$/.test(meta.version ?? "")) {
    errors.push(`@version "${meta.version ?? ""}" is not YYYY.MM.DD`);
  }
  for (const name of ["lightFlavor", "darkFlavor", "accentColor"]) {
    if (!vars[name]) errors.push(`@var ${name} missing`);
  }
  if (vars.darkFlavor && vars.darkFlavor.value !== "mocha") errors.push("darkFlavor must default to mocha");
  if (vars.accentColor && vars.accentColor.value !== "mauve") errors.push("accentColor must default to mauve");
}

// Body without comments, line numbers kept. `//` counts as a comment only
// at the start of a line or after whitespace, so URLs survive.
function codeLines(body) {
  const noBlock = body.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, " "));
  return noBlock.split("\n").map((l) => l.replace(/(^|\s)\/\/.*$/, "$1"));
}

function checkColors(body, bodyLine, errors) {
  const raw = body.split("\n");
  codeLines(body).forEach((line, i) => {
    if (raw[i].includes(ALLOW)) return;
    const hex = line.match(/#[0-9a-fA-F]{3,8}\b/g)?.filter((h) => [4, 5, 7, 9].includes(h.length));
    const fn = line.match(/\b(rgba?|hsla?)\(\s*\d/g);
    for (const c of [...(hex ?? []), ...(fn ?? [])]) {
      errors.push(`line ${bodyLine + i}: literal color ${c}; use the palette or mark the line ${ALLOW}`);
    }
  });
}

function checkPrivate(src, errors) {
  src.split("\n").forEach((line, i) => {
    for (const re of PRIVATE) if (re.test(line)) errors.push(`line ${i + 1}: private string ${re}`);
  });
}

// Stylus prepends one `@name: value;` line per variable, so we do too.
function prefixFor(vars, overrides) {
  const values = { ...Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, v.value])), ...overrides };
  return Object.entries(values).map(([k, v]) => `@${k}: ${v};`).join("\n");
}

async function compile(file, body, vars, lib, overrides) {
  const prefix = prefixFor(vars, overrides);
  const code = `${prefix}\n${body.replace(`@import "${LIB_URL}";`, `@import "${lib}";`)}`;
  const out = await less.render(code, { filename: file });
  return out.css;
}

async function checkStyle(slug, lib) {
  const dir = join(ROOT, "styles", slug);
  const file = join(dir, "catppuccin.user.less");
  const errors = [];
  if (!existsSync(file)) return [`${file} missing`];
  if (!existsSync(join(dir, "README.md"))) errors.push("README.md missing");

  const src = readFileSync(file, "utf8");
  checkPrivate(src, errors);
  const header = parseHeader(src);
  if (!header) return [...errors, "no ==UserStyle== header"];
  checkHeader(slug, header.meta, header.vars, errors);

  const body = src.slice(header.end);
  const bodyLine = src.slice(0, header.end).split("\n").length;
  if (!body.includes(`@import "${LIB_URL}";`)) errors.push(`does not import ${LIB_URL}`);
  checkColors(body, bodyLine, errors);

  const runs = [
    ...FLAVORS.map((f) => ({ lightFlavor: f, darkFlavor: f })),
    ...ACCENTS.filter((a) => a !== "mauve").map((a) => ({ accentColor: a })),
  ];
  for (const overrides of runs) {
    try {
      const css = await compile(file, body, header.vars, lib, overrides);
      if (!css.includes("@-moz-document")) errors.push(`${JSON.stringify(overrides)}: output has no @-moz-document`);
    } catch (e) {
      // Less counts lines in prefix + body; map back to the file. For an
      // error inside a mixin, Less reports the line of the mixin call.
      const prefixLines = prefixFor(header.vars, overrides).split("\n").length;
      const line = e.line ? e.line - prefixLines - 1 + bodyLine : "?";
      errors.push(`${JSON.stringify(overrides)}: ${e.message} (line ${line})`);
      break; // the same error repeats for every run
    }
  }
  return errors;
}

const lib = await libPath();
const all = readdirSync(join(ROOT, "styles"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
const slugs = only.length ? only : all;
if (!slugs.length) {
  console.log("no styles yet");
  process.exit(0);
}

let failed = 0;
for (const slug of slugs) {
  const errors = await checkStyle(slug, lib);
  if (errors.length) {
    failed++;
    console.log(`FAIL ${slug}`);
    for (const e of errors) console.log(`  ${e}`);
  } else {
    console.log(`ok   ${slug}`);
  }
}
console.log(`\n${slugs.length - failed}/${slugs.length} styles pass`);
process.exit(failed ? 1 : 0);
