import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mapColor, renderBlock, renderRules } from "./youtube-tokens.mjs";

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

const player = {
	site: "player", background: "#0f0f0f",
	rules: [
		{ selector: ".ytp-panel", media: null, prop: "background-color", value: "rgba(28, 28, 28, 0.9)", important: false },
		{ selector: ".ytp-panel", media: null, prop: "color", value: "rgb(238, 238, 238)", important: false },
		{ selector: ".ytp-title", media: null, prop: "text-shadow", value: "rgb(0, 0, 0) 0px 0px 2px", important: true },
		{ selector: ".ytp-gradient", media: null, prop: "background-image", value: "linear-gradient(white, rgba(0, 0, 0, 0.5))", important: false },
		{ selector: ".ytp-panel", media: "print", prop: "color", value: "black", important: false },
		{ selector: ".ytp-caption-segment", media: null, prop: "color", value: "rgb(255, 255, 255)", important: false },
	],
};

test("renderRules maps every color inside a value and keeps the rest", () => {
	const out = renderRules(player);
	assert.match(out, /\.ytp-panel \{\n\t*background-color: color-mix\(in srgb, var\(--ctp-base\) 90%, transparent\);\n\t*color: var\(--ctp-text\);/);
	assert.match(out, /text-shadow: var\(--ctp-mantle\) 0px 0px 2px !important;/);
	assert.match(out, /background-image: linear-gradient\(var\(--ctp-text\), color-mix\(in srgb, var\(--ctp-mantle\) 50%, transparent\)\);/);
	assert.doesNotMatch(out, /#[0-9a-f]{3,8}\b|rgba?\(|\bwhite\b|\bblack\b/i);
});

test("renderRules keeps media queries and leaves captions alone", () => {
	const out = renderRules(player);
	assert.match(out, /@media print \{\n\t*\.ytp-panel \{\n\t*color: var\(--ctp-mantle\);/);
	assert.doesNotMatch(out, /caption/);
});

test("the CLI writes rule dumps after the token tables", () => {
	const dir = mkdtempSync(join(tmpdir(), "yt-tokens-"));
	try {
		const style = join(dir, "style.less"), dump = join(dir, "www.json"), rules = join(dir, "player.json");
		writeFileSync(dump, JSON.stringify(dumps[0]));
		writeFileSync(rules, JSON.stringify(player));
		writeFileSync(style, "/* ctp-tokens:start */\n/* ctp-tokens:end */\n");
		const r = spawnSync("node", [CLI, "--write", style, dump, rules]);
		assert.equal(r.status, 0, r.stderr.toString());
		const text = readFileSync(style, "utf8");
		assert.ok(text.indexOf("#yt-tokens {") < text.indexOf("#yt-player {"));
	} finally {
		rmSync(dir, { recursive: true });
	}
});

test("renderRules maps a rule of the main stylesheet as in the dark theme", () => {
	const out = renderRules({ site: "desktop", background: "#0f0f0f", rules: [
		{ selector: "ytd-thumbnail-overlay-now-playing-renderer", media: null, prop: "background-color", value: "rgba(0, 0, 0, 0.6)", important: false },
	] });
	assert.match(out, /^#yt-desktop \{\n\t\.rules\(\) \{\n\t\tytd-thumbnail-overlay-now-playing-renderer \{\n\t\t\tbackground-color: color-mix\(in srgb, var\(--ctp-mantle\) 60%, transparent\);/);
});

test("reds that mean live, error or destructive stay red", () => {
	const rules = renderRules({ site: "x", background: "#0f0f0f", rules: [
		{ selector: ".ytBadgeShapeLive", media: null, prop: "background-color", value: "rgb(204, 0, 0)", important: false },
		{ selector: ".ytp-swatch-background-color", media: null, prop: "background-color", value: "rgb(255, 0, 51)", important: false },
	] });
	assert.match(rules, /\.ytBadgeShapeLive \{\n\t*background-color: (var\(--ctp-red\)|color-mix\(in srgb, var\(--ctp-red\) \d+%, var\(--ctp-base\)\));/);
	assert.match(rules, /\.ytp-swatch-background-color \{\n\t*background-color: var\(--ctp-accent\);/);
	const block = renderBlock([{ site: "www", background: { dark: "#0f0f0f", light: "#fff" }, dark: { "--yt-sys-color-baseline--error-text": "#ff4e45", "--yt-sys-color-baseline--brand": "#ff0033" }, light: {} }], {});
	assert.match(block, /--yt-sys-color-baseline--error-text: var\(--ctp-red\);/);
	assert.match(block, /--yt-sys-color-baseline--brand: var\(--ctp-accent\);/);
});

test("a hashed token with the value of a named error token stays red too", () => {
	const block = renderBlock([{ site: "studio", background: { dark: "#0f0f0f", light: "#fff" }, dark: { "--ytcp-error-red": "#f57", "--t0123456789abcdef": "#f57", "--tfedcba9876543210": "#ff0033" }, light: {} }], {});
	assert.match(block, /--t0123456789abcdef: var\(--ctp-red\);/);
	assert.match(block, /--tfedcba9876543210: var\(--ctp-accent\);/);
});

test("a gray readable on YouTube stays readable in the palette", () => {
	// #909090 on white is 3.2:1; Latte's overlay0 on base would be 2.3:1.
	assert.match(mapColor("#909090", "light", "#fff"), /^var\(--ctp-(overlay2|subtext0|subtext1|text)\)$/);
	// #717171 on #0f0f0f is 3.9:1; Frappé's overlay0 on base would be 2.9:1.
	assert.match(mapColor("#717171", "dark", "#0f0f0f"), /^var\(--ctp-(overlay[12]|subtext[01]|text)\)$/);
});

test("a token with the same value in both themes maps as it does in the dark theme", () => {
	const block = renderBlock([{ site: "www", background: { dark: "#0f0f0f", light: "#fff" }, dark: { "--tstatic": "#fff", "--tscrim": "rgba(0,0,0,0.6)", "--tbg": "#0f0f0f" }, light: { "--tstatic": "#fff", "--tscrim": "rgba(0,0,0,0.6)", "--tbg": "#fff" } }], {});
	const light = section(block, "light");
	assert.match(light, /--tstatic: var\(--ctp-text\);/);
	assert.match(light, /--tscrim: color-mix\(in srgb, var\(--ctp-mantle\) 60%, transparent\);/);
	assert.match(light, /--tbg: var\(--ctp-base\);/);
});

test("a token that barely moves between themes counts as the same", () => {
	const block = renderBlock([{ site: "www", background: { dark: "#0f0f0f", light: "#fff" }, dark: { "--tlabel": "#030303", "--tbg": "#0f0f0f" }, light: { "--tlabel": "#0f0f0f", "--tbg": "#fff" } }], {});
	assert.match(section(block, "light"), /--tlabel: var\(--ctp-(mantle|crust)\);/);
});
