// Maps YouTube's color tokens onto the Catppuccin palette and writes them
// into the YouTube style, between the lines /* ctp-tokens:start */ and
// /* ctp-tokens:end */.
//
//   node scripts/youtube-tokens.mjs --write styles/youtube/catppuccin.user.less tokens-www.json ...
//
// A dump is { site, background: { dark, light }, dark: { name: value }, light: { name: value } }:
// every custom property YouTube defines on <html> with a literal color, read
// from the live site once per theme. The style's README says how to make one.
//
// Grays go onto the ladder from crust to text by their contrast with the
// theme's background, so the background itself becomes base. Hues go to their
// palette color, every red to the accent; a tint (a hue mixed into the
// background) stays a tint of the palette color. Alpha is kept. The output
// only names var(--ctp-*), which the style sets per flavor.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Tokens whose meaning the mapping can't see from their name.
export const OVERRIDES = {};

// Red that means live, recording, an error or a destructive action stays
// red; every other red is the brand's and takes the accent. Token names and
// selectors that say so are recognized here.
const SEMANTIC_RED = /live|error|recording|destructive|danger|alert/i;
const semantic = (mapped, name) => (mapped && SEMANTIC_RED.test(name) ? mapped.replaceAll("--ctp-accent", "--ctp-red") : mapped);

const PALETTES = {
	dark: { rosewater: "f5e0dc", flamingo: "f2cdcd", pink: "f5c2e7", mauve: "cba6f7", red: "f38ba8", maroon: "eba0ac", peach: "fab387", yellow: "f9e2af", green: "a6e3a1", teal: "94e2d5", sky: "89dceb", sapphire: "74c7ec", blue: "89b4fa", lavender: "b4befe", text: "cdd6f4", subtext1: "bac2de", subtext0: "a6adc8", overlay2: "9399b2", overlay1: "7f849c", overlay0: "6c7086", surface2: "585b70", surface1: "45475a", surface0: "313244", base: "1e1e2e", mantle: "181825", crust: "11111b" },
	light: { rosewater: "dc8a78", flamingo: "dd7878", pink: "ea76cb", mauve: "8839ef", red: "d20f39", maroon: "e64553", peach: "fe640b", yellow: "df8e1d", green: "40a02b", teal: "179299", sky: "04a5e5", sapphire: "209fb5", blue: "1e66f5", lavender: "7287fd", text: "4c4f69", subtext1: "5c5f77", subtext0: "6c6f85", overlay2: "7c7f93", overlay1: "8c8fa1", overlay0: "9ca0b0", surface2: "acb0be", surface1: "bcc0cc", surface0: "ccd0da", base: "eff1f5", mantle: "e6e9ef", crust: "dce0e8" },
};
// The grays of the other dark flavors, which have less contrast than Mocha's:
// a gray that must stay readable is checked against all of them.
const DARK_GRAYS = [
	{ text: "c6d0f5", subtext1: "b5bfe2", subtext0: "a5adce", overlay2: "949cbb", overlay1: "838ba7", overlay0: "737994", surface2: "626880", surface1: "51576d", surface0: "414559", base: "303446", mantle: "292c3c", crust: "232634" },
	{ text: "cad3f5", subtext1: "b8c0e0", subtext0: "a5adcb", overlay2: "939ab7", overlay1: "8087a2", overlay0: "6e738d", surface2: "5b6078", surface1: "494d64", surface0: "363a4f", base: "24273a", mantle: "1e2030", crust: "181926" },
];
const LADDER = ["crust", "mantle", "base", "surface0", "surface1", "surface2", "overlay0", "overlay1", "overlay2", "subtext0", "subtext1", "text"];
// Hue ranges in degrees, upper bound exclusive. Red wraps around 0.
const HUES = [[12, "accent"], [35, "peach"], [65, "yellow"], [150, "green"], [185, "teal"], [200, "sky"], [235, "blue"], [255, "lavender"], [290, "mauve"], [345, "pink"], [361, "accent"]];
const GRAY_CHROMA = 24; // max - min of the channels, 0-255
const SOLID_TINT = 0.7; // a tint with at least this share of the hue's contrast is the hue itself
// YouTube's own secondary and primary text per theme, the anchors that map
// onto subtext0 and text.
const READABLE = [3, 4.5];
// YouTube's page backgrounds, for a dump that lacks one (Music has no light theme).
const DEFAULT_BACKGROUND = { dark: "#0f0f0f", light: "#fff" };
const ANCHORS = { dark: ["aaaaaa", "f1f1f1"], light: ["606060", "0f0f0f"] };

const hex = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));

function parse(value) {
	const v = value.trim().toLowerCase();
	let m = v.match(/^#([0-9a-f]{3,8})$/);
	if (m) {
		let h = m[1];
		if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
		if (h.length !== 6 && h.length !== 8) return null;
		return [...hex(h), h.length === 8 ? parseInt(h.slice(6), 16) / 255 : 1];
	}
	m = v.match(/^(rgba?|hsla?)\(([^()]*)\)$/);
	if (!m) return null;
	const p = m[2].split(/[\s,/]+/).filter(Boolean);
	if (p.length < 3) return null;
	const num = (x, scale) => (x.endsWith("%") ? (parseFloat(x) / 100) * scale : parseFloat(x));
	const a = p[3] === undefined ? 1 : num(p[3], 1);
	if (m[1].startsWith("rgb")) return [num(p[0], 255), num(p[1], 255), num(p[2], 255), a];
	const h = parseFloat(p[0]), s = parseFloat(p[1]) / 100, l = parseFloat(p[2]) / 100;
	const f = (n) => {
		const k = (n + h / 30) % 12;
		return 255 * (l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)));
	};
	return [f(0), f(8), f(4), a];
}

function luminance([r, g, b]) {
	const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Log of the contrast ratio with the background, positive toward the text side.
function towardText(rgb, bg, theme) {
	const d = Math.log((luminance(rgb) + 0.05) / (luminance(bg) + 0.05));
	return theme === "dark" ? d : -d;
}

function hue([r, g, b]) {
	const max = Math.max(r, g, b), min = Math.min(r, g, b), c = max - min;
	if (c === 0) return 0;
	const h = max === r ? ((g - b) / c) % 6 : max === g ? (b - r) / c + 2 : (r - g) / c + 4;
	return (h * 60 + 360) % 360;
}

function mapOpaque(rgb, theme, bg) {
	const pal = PALETTES[theme];
	const chroma = Math.max(...rgb) - Math.min(...rgb);
	if (chroma < GRAY_CHROMA) {
		const base = hex(pal.base);
		const g = towardText(rgb, bg, theme);
		const [sec, txt] = ANCHORS[theme].map((a) => towardText(hex(a), bg, theme));
		const [S, X] = [pal.subtext0, pal.text].map((a) => towardText(hex(a), base, theme));
		const target = g <= 0 ? g : g <= sec ? (g / sec) * S : S + ((g - sec) / (txt - sec)) * (X - S);
		// A gray YouTube keeps readable (3:1, 4.5:1) stays at least as readable.
		const floor = Math.max(-Infinity, ...READABLE.filter((r) => g >= Math.log(r)).map((r) => Math.log(r)));
		let best = LADDER[0], dist = Infinity;
		for (const step of LADDER) {
			const c = towardText(hex(pal[step]), base, theme);
			const worst = theme === "dark" ? Math.min(c, ...DARK_GRAYS.map((f) => towardText(hex(f[step]), hex(f.base), theme))) : c;
			if (worst < floor) continue;
			const d = Math.abs(c - target);
			if (d < dist) [best, dist] = [step, d];
		}
		return `var(--ctp-${best})`;
	}
	const h = hue(rgb);
	const name = HUES.find(([upTo]) => h < upTo)[1];
	const solid = hex(pal[name === "accent" ? "red" : name]);
	const t = towardText(rgb, bg, theme) / towardText(solid, bg, theme);
	if (t >= SOLID_TINT) return `var(--ctp-${name})`;
	return `color-mix(in srgb, var(--ctp-${name}) ${Math.max(1, Math.round(t * 100))}%, var(--ctp-base))`;
}

export function mapColor(value, theme, background) {
	const c = parse(value), bg = parse(background);
	if (!c || !bg) return null;
	const alpha = Math.round(c[3] * 100);
	if (alpha === 0) return "transparent";
	const opaque = mapOpaque(c.slice(0, 3), theme, bg.slice(0, 3));
	return alpha === 100 ? opaque : `color-mix(in srgb, ${opaque} ${alpha}%, transparent)`;
}

// Two values YouTube treats as one color: within a few steps per channel.
function sameColor(a, b) {
	const x = parse(a), y = parse(b);
	return !!x && !!y && Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) < 24 && Math.abs(x[3] - y[3]) < 0.05;
}

export function renderBlock(dumps, overrides) {
	const ordered = [...dumps].sort((a, b) => (b.site === "www") - (a.site === "www"));
	const lines = ["#yt-tokens {"];
	for (const theme of ["dark", "light"]) {
		// Values that named semantic tokens give red; a hashed token with one
		// of them means the same.
		const semanticValues = new Set();
		for (const dump of ordered) {
			for (const [name, value] of Object.entries(dump[theme] ?? {})) {
				if (SEMANTIC_RED.test(name) && mapColor(value, theme, dump.background[theme])?.includes("--ctp-accent")) semanticValues.add(value);
			}
		}
		const tokens = new Map();
		for (const dump of ordered) {
			for (const [name, value] of Object.entries(dump[theme] ?? {})) {
				if (tokens.has(name)) continue;
				// A value YouTube keeps (nearly) the same in both themes sits on video or artwork
				// (white text on a dark scrim); it maps as in the dark theme, so
				// it matches the player and follows the flavor.
				// A token named for one theme (--light-theme-text-color) means
				// that theme wherever it is used.
				const named = name.match(/(?:^|-)(light|dark)-theme-/)?.[1];
				const fixed = !named && theme === "light" && dump.dark?.[name] !== undefined && sameColor(dump.dark[name], value);
				const mapTheme = named ?? (fixed ? "dark" : theme);
				const source = fixed ? dump.dark[name] : value;
				const background = dump.background[mapTheme] ?? DEFAULT_BACKGROUND[mapTheme];
				const mapped = overrides[name] ?? semantic(mapToken(source, mapTheme, background), semanticValues.has(value) ? "error" : name);
				if (mapped) tokens.set(name, mapped);
			}
		}
		lines.push(`\t.${theme}() {`);
		for (const name of [...tokens.keys()].sort()) lines.push(`\t\t${name}: ${tokens.get(name)};`);
		lines.push("\t}");
	}
	lines.push("}");
	return lines.join("\n");
}

// Captions take their colors from the viewer's caption settings.
const RULES_EXCLUDE = /caption-(window|segment|visual)|captions-text/;
const COLOR_IN_VALUE = /#[0-9a-f]{3,8}\b|(?:rgba?|hsla?)\([^()]*\)|(?<![\w-])(?:white|black)(?![\w-])/gi;
const KEYWORDS = { white: "#fff", black: "#000" };

function mapValue(value, theme, background) {
	const mapped = value.replace(COLOR_IN_VALUE, (c) => mapColor(KEYWORDS[c.toLowerCase()] ?? c, theme, background) ?? c);
	// YouTube's brand gradient runs from its red into pink: all of it is brand.
	if (/gradient\(/.test(value) && mapped.includes("var(--ctp-accent)")) {
		return mapped.replace(/color-mix\(in srgb, var\(--ctp-pink\) \d+%, var\(--ctp-base\)\)|var\(--ctp-pink\)/g, "var(--ctp-accent)");
	}
	return mapped;
}

// A token's value: one color, or colors inside something else (a gradient).
function mapToken(value, theme, background) {
	if (parse(value)) return mapColor(value, theme, background);
	const mapped = mapValue(value, theme, background);
	return mapped === value ? null : mapped;
}

// A rule dump is { site, background, rules: [{ selector, media, prop, value,
// important }] }: the declarations of one stylesheet that hold a literal
// color, in the stylesheet's order. A literal is the same in both of
// YouTube's themes, like the tokens that don't change, so it maps as in the
// dark theme and follows the flavor. The output repeats the declarations with
// palette colors, as the mixin #yt-<site>.rules(). Captions keep the viewer's
// colors.
export function renderRules(dump) {
	const out = [`#yt-${dump.site} {`, "\t.rules() {"];
	let open = null;
	const close = () => {
		if (!open) return;
		out.push(open.media ? "\t\t\t}\n\t\t}" : "\t\t}");
		open = null;
	};
	for (const r of dump.rules) {
		if (RULES_EXCLUDE.test(r.selector)) continue;
		const value = semantic(mapValue(r.value, "dark", dump.background), r.selector);
		if (value === r.value) continue;
		if (!open || open.selector !== r.selector || open.media !== r.media) {
			close();
			open = r;
			if (r.media) out.push(`\t\t@media ${r.media} {`, `\t\t\t${r.selector} {`);
			else out.push(`\t\t${r.selector} {`);
		}
		out.push(`${r.media ? "\t\t\t\t" : "\t\t\t"}${r.prop}: ${value}${r.important ? " !important" : ""};`);
	}
	close();
	out.push("\t}", "}");
	return out.join("\n");
}

const START = "/* ctp-tokens:start */", END = "/* ctp-tokens:end */";

function main(argv) {
	if (argv[0] !== "--write" || argv.length < 3) {
		console.error("usage: node scripts/youtube-tokens.mjs --write <style.less> <dump.json>...");
		return 2;
	}
	const [, style, ...files] = argv;
	const text = readFileSync(style, "utf8");
	const lines = text.split("\n");
	const start = lines.indexOf(START), end = lines.indexOf(END);
	if (start < 0 || end < start) {
		console.error(`${style}: markers ${START} and ${END} not found`);
		return 1;
	}
	const dumps = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
	const block = [renderBlock(dumps.filter((d) => !d.rules), OVERRIDES), ...dumps.filter((d) => d.rules).map(renderRules)].join("\n\n");
	writeFileSync(style, [...lines.slice(0, start + 1), block, ...lines.slice(end)].join("\n"));
	console.log(`${style}: ${block.split("\n").length} lines between the markers`);
	return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
