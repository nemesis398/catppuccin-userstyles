# Forgejo Catppuccin

Catppuccin for self-hosted [Forgejo](https://forgejo.org) instances, without installing a theme on the server. It loads Catppuccin's own [Gitea and Forgejo theme](https://github.com/catppuccin/gitea) for your flavor and accent, and adds the colors that are specific to Forgejo: the Actions log and its terminal colors, runner status dots, danger buttons, the counter on an active tab and the checkerboard behind image diffs.

## Setup

Open the style's settings in Stylus and enter your instance under **URLs of your Forgejo instances**, without `https://`, for example `git.example.com`. Separate several instances with commas, and add the port if it is not the default one (`localhost:3000`).

codeberg.org is not matched. Use Catppuccin's [Codeberg style](https://github.com/catppuccin/userstyles/tree/main/styles/codeberg) there.

## How the flavor is chosen

The style follows your system: Dark Flavor when it is dark, Light Flavor when it is light. It replaces whichever built-in theme is selected in your Forgejo account settings, so that choice no longer matters.

## Known gaps

- The language bar on a repository's home page keeps the usual per-language colors.
- Repository labels keep the colors they were created with.

## Verified

| Date | Forgejo | Pages | Result |
|---|---|---|---|
| 2026-10-29 | 17.0.0 | dashboard, repository home, pull request and Actions lists, a commit diff, a file view, an Actions run with its log | No color outside the active flavor's palette on any visible element in Mocha, Frappé, Macchiato and Latte, apart from the language bar and the accent shades that the Catppuccin theme derives itself (checked checkboxes, the primary button's border, help text). |

No screenshots, because the instance it was checked on is private.
