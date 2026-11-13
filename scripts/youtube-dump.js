// Paste into the DevTools console on a YouTube page to dump the colors that
// scripts/youtube-tokens.mjs turns into the style's generated block. Each
// function returns the dump as JSON and copies it to the clipboard; save it
// as tokens-<site>.json or rules-<site>.json.
//
// ctpDumpTokens(site): the custom properties set to a literal color on <html>,
// with their values in YouTube's current Appearance. Run it once with the
// Appearance set to Dark and once set to Light (Music: Dark only); the second
// run returns both themes in one dump.
//
// ctpDumpRules(site, { only, withTokens }): the literal color declarations of
// the page's stylesheets. The player's stylesheet is left out unless `only`
// selects it: ctpDumpRules("player", { only: /www-player\.css/ }).
// `withTokens` adds custom properties set to a literal color on components.
// Run it with the Appearance set to Dark; the generator maps literals as dark.

const ctpCopy = (dump) => {
	const json = JSON.stringify(dump, null, 1);
	if (typeof copy === "function") copy(json);
	return json;
};

const ctpBackground = () =>
	[document.body, document.documentElement].map((e) => getComputedStyle(e).backgroundColor).find((c) => c && c !== "rgba(0, 0, 0, 0)");

const ctpSheetRules = (keep) => {
	const rules = [];
	const walk = (list, media) => {
		for (const r of list) {
			if (r.cssRules && !r.style) {
				walk(r.cssRules, r.media ? r.media.mediaText : media);
				continue;
			}
			if (r.style && r.selectorText) rules.push({ rule: r, media });
		}
	};
	for (const sheet of document.styleSheets) {
		if (!keep(sheet)) continue;
		try {
			walk(sheet.cssRules, null);
		} catch {
			// A cross-origin stylesheet without CORS can't be read.
		}
	}
	return rules;
};

function ctpDumpTokens(site) {
	const literal = /^(?!.*url\()(?=.*(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\())[^;]*$/i;
	const html = document.documentElement;
	const theme = html.hasAttribute("dark") ? "dark" : "light";
	const rules = ctpSheetRules(() => true).filter(({ media }) => !media || matchMedia(media).matches);

	// Names come from both attribute states, so a token set only under [dark]
	// is found in the light theme too; values come from the real theme.
	const names = new Set();
	for (const dark of [true, false]) {
		dark ? html.setAttribute("dark", "") : html.removeAttribute("dark");
		for (const { rule } of rules) {
			let matches = false;
			try {
				matches = html.matches(rule.selectorText);
			} catch {}
			if (!matches) continue;
			for (const p of rule.style) if (p.startsWith("--") && literal.test(rule.style.getPropertyValue(p).trim())) names.add(p);
		}
	}
	theme === "dark" ? html.setAttribute("dark", "") : html.removeAttribute("dark");

	const style = getComputedStyle(html);
	const values = {};
	for (const name of names) {
		const value = style.getPropertyValue(name).trim();
		if (literal.test(value)) values[name] = value;
	}

	const key = `ctp-dump-tokens-${site}`;
	const dump = JSON.parse(localStorage.getItem(key) ?? "null") ?? { site, background: {}, dark: {}, light: {} };
	dump.background[theme] = ctpBackground();
	dump[theme] = values;
	localStorage.setItem(key, JSON.stringify(dump));
	console.log(`${site}: ${Object.keys(dump.dark).length} dark, ${Object.keys(dump.light).length} light tokens`);
	return ctpCopy(dump);
}

function ctpDumpRules(site, { only, withTokens = false } = {}) {
	const literal = /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black)\b/i;
	const tokenLiteral = /^(?!.*url\()(?=.*(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\())[^;]*$/i;
	const props = ["color", "background-color", "background-image", "fill", "stroke", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "outline-color", "box-shadow", "text-shadow", "caret-color", "text-decoration-color"];
	const html = document.documentElement;
	const keep = (sheet) => (only ? only.test(sheet.href ?? "") : !/www-player\.css/.test(sheet.href ?? ""));

	const rules = [];
	for (const { rule, media } of ctpSheetRules(keep)) {
		const add = (prop, value) => rules.push({ selector: rule.selectorText, media: media ?? null, prop, value, important: rule.style.getPropertyPriority(prop) === "important" });
		if (withTokens) {
			let onRoot = false;
			try {
				onRoot = html.matches(rule.selectorText);
			} catch {}
			if (!onRoot) for (const p of rule.style) if (p.startsWith("--") && tokenLiteral.test(rule.style.getPropertyValue(p).trim())) add(p, rule.style.getPropertyValue(p).trim());
		}
		for (const p of props) {
			const value = rule.style.getPropertyValue(p);
			if (value && literal.test(value) && !/url\(/.test(value)) add(p, value);
		}
	}
	console.log(`${site}: ${rules.length} declarations`);
	return ctpCopy({ site, background: ctpBackground(), rules });
}
