# Catppuccin userstyles

[Catppuccin](https://catppuccin.com) themes for the [Stylus](https://github.com/openstyles/stylus) browser extension, for sites the [official collection](https://github.com/catppuccin/userstyles) doesn't cover. Every style offers all four flavors and every accent, with Mocha and Mauve as the default.

## Styles

| Style | Sites | Install |
|---|---|---|

## Install

1. Install [Stylus](https://github.com/openstyles/stylus) for your browser.
2. Click a style's install link above. Stylus opens the style and offers to install it.
3. Stylus checks the link for updates, so a fixed style reaches you on its own.

## Settings

Open a style's settings in Stylus (the gear next to its name) to pick:

- **Light Flavor** and **Dark Flavor**: which flavor is used when your system, or the site's own theme switch, is light or dark. The defaults are Latte and Mocha.
- **Accent**: the color for links, buttons and highlights. The default is Mauve.

Styles for self-hosted apps, such as Proxmox VE or AdGuard Home, also have a **URLs** setting. Enter the address of your instance there, without `https://`, and separate several with commas.

## Reporting a broken style

Sites change their markup, and a style can stop working overnight. Each style's README says when it was last verified and against which version of the site. If a style no longer fits, [open an issue](https://github.com/nemesis398/catppuccin-userstyles/issues) with the page, the flavor and a screenshot.

## Development

```sh
npm ci
npm run check            # every style
npm run check -- claude  # one style
```

`scripts/check.mjs` checks each style's header, compiles it once for every flavor and every accent, rejects any color that doesn't come from the Catppuccin palette, and refuses private hostnames and addresses. A line that has to hold a literal color, such as a selector that matches the site's own inline style, carries a `ctp-allow` comment.

The styles follow the layout and the template of [catppuccin/userstyles](https://github.com/catppuccin/userstyles), so any of them can move upstream with little change.

## License

[MIT](LICENSE). The palette and the `lib` the styles import are by [Catppuccin](https://github.com/catppuccin), also under MIT.
