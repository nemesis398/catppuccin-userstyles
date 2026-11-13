import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mapColor, renderBlock } from "./youtube-tokens.mjs";

const CLI = new URL("./youtube-tokens.mjs", import.meta.url).pathname;

test("the theme's own background maps to base", () => {
	assert.equal(mapColor("#0f0f0f", "dark", "#0f0f0f"), "var(--ctp-base)");
	assert.equal(mapColor("#030303", "dark", "#030303"), "var(--ctp-base)");
	assert.equal(mapColor("#ffffff", "light", "#ffffff"), "var(--ctp-base)");
});

test("the theme's text color maps to text", () => {
	assert.equal(mapColor("#f1f1f1", "dark", "#0f0f0f"), "var(--ctp-text)");
	assert.equal(mapColor("#0f0f0f", "light", "#ffffff"), "var(--ctp-text)");
});

test("secondary text maps to a subtext, not an overlay", () => {
	assert.match(mapColor("#aaa", "dark", "#0f0f0f"), /^var\(--ctp-subtext[01]\)$/);
	assert.match(mapColor("#606060", "light", "#fff"), /^var\(--ctp-subtext[01]\)$/);
});

test("a raised surface maps to a surface", () => {
	assert.equal(mapColor("#212121", "dark", "#0f0f0f"), "var(--ctp-surface0)");
});

test("translucent grays keep their alpha", () => {
	assert.equal(mapColor("rgba(255,255,255,0.1)", "dark", "#0f0f0f"), "color-mix(in srgb, var(--ctp-text) 10%, transparent)");
	assert.equal(mapColor("rgba(0,0,0,0.05)", "light", "#ffffff"), "color-mix(in srgb, var(--ctp-text) 5%, transparent)");
});

test("hues map to their palette color, reds to the accent", () => {
	assert.equal(mapColor("#3ea6ff", "dark", "#0f0f0f"), "var(--ctp-blue)");
	assert.equal(mapColor("#ff0033", "dark", "#0f0f0f"), "var(--ctp-accent)");
	assert.equal(mapColor("hsl(206.1,79.3%,52.7%)", "dark", "#0f0f0f"), "var(--ctp-blue)");
});

test("a pale tint becomes the hue mixed into base", () => {
	assert.match(mapColor("#def1ff", "light", "#fff"), /^color-mix\(in srgb, var\(--ctp-blue\) \d+%, var\(--ctp-base\)\)$/);
	assert.match(mapColor("#263850", "dark", "#0f0f0f"), /^color-mix\(in srgb, var\(--ctp-blue\) \d+%, var\(--ctp-base\)\)$/);
});

test("values that are not colors map to null", () => {
	assert.equal(mapColor("initial", "dark", "#0f0f0f"), null);
	assert.equal(mapColor("4px", "dark", "#0f0f0f"), null);
});

const dumps = [
	{ site: "www", background: { dark: "#0f0f0f", light: "#fff" }, dark: { "--tabc": "#ff0033", "--tdark": "#212121", "--tsize": "4px" }, light: { "--tabc": "#ff0033" } },
	{ site: "studio", background: { dark: "#0f0f0f", light: "#fff" }, dark: { "--tdark": "#ffffff", "--tstudio": "#3ea6ff" }, light: {} },
];
const section = (out, name) => out.slice(out.indexOf(`.${name}()`), out.indexOf("}", out.indexOf(`.${name}()`)));

test("renderBlock applies overrides", () => {
	const out = renderBlock(dumps, { "--tabc": "var(--ctp-red)" });
	assert.match(section(out, "dark"), /--tabc: var\(--ctp-red\);/);
	assert.match(section(out, "light"), /--tabc: var\(--ctp-red\);/);
});

test("a token only in one theme appears only in that theme", () => {
	const out = renderBlock(dumps, {});
	assert.match(section(out, "dark"), /--tstudio: var\(--ctp-blue\);/);
	assert.doesNotMatch(section(out, "light"), /--tstudio/);
});

test("www wins over other sites, and non-colors are skipped without losing the rest", () => {
	const out = renderBlock(dumps, {});
	assert.match(section(out, "dark"), /--tdark: var\(--ctp-surface0\);/);
	assert.doesNotMatch(out, /--tsize/);
	assert.match(section(out, "dark"), /--tabc: var\(--ctp-accent\);/);
});

test("renderBlock writes no hex color and sorts tokens", () => {
	const out = renderBlock(dumps, {});
	assert.doesNotMatch(out, /#[0-9a-f]{3,8}\b/i);
	const names = [...section(out, "dark").matchAll(/(--t\w+):/g)].map((m) => m[1]);
	assert.deepEqual(names, [...names].sort());
});

test("the CLI replaces the block between the markers", () => {
	const dir = mkdtempSync(join(tmpdir(), "yt-tokens-"));
	try {
		const style = join(dir, "style.less"), dump = join(dir, "www.json");
		writeFileSync(dump, JSON.stringify(dumps[0]));
		writeFileSync(style, "a\n/* ctp-tokens:start */\nold\n/* ctp-tokens:end */\nb\n");
		const r = spawnSync("node", [CLI, "--write", style, dump]);
		assert.equal(r.status, 0, r.stderr.toString());
		const text = readFileSync(style, "utf8");
		assert.match(text, /^a\n\/\* ctp-tokens:start \*\/\n#yt-tokens \{/);
		assert.match(text, /\/\* ctp-tokens:end \*\/\nb\n$/);
		assert.doesNotMatch(text, /\nold\n/);
	} finally {
		rmSync(dir, { recursive: true });
	}
});

test("the CLI fails on a file without the markers", () => {
	const dir = mkdtempSync(join(tmpdir(), "yt-tokens-"));
	try {
		const style = join(dir, "style.less"), dump = join(dir, "www.json");
		writeFileSync(dump, JSON.stringify(dumps[0]));
		writeFileSync(style, "a\nb\n");
		const r = spawnSync("node", [CLI, "--write", style, dump]);
		assert.equal(r.status, 1);
		assert.equal(readFileSync(style, "utf8"), "a\nb\n");
	} finally {
		rmSync(dir, { recursive: true });
	}
});
