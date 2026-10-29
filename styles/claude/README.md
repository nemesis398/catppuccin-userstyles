# Claude Catppuccin

Catppuccin for [Claude](https://claude.ai) and Claude Design (claude.ai/design).

## How the flavor is chosen

The style follows Claude's appearance setting (Settings, Appearance). **Dark** uses your Dark Flavor, **Light** your Light Flavor, and **System** follows your OS. Code blocks, which Claude keeps dark in both of its modes, follow the flavor too.

## Known gaps

- Claude changes its design tokens often. The style was last fitted to build `c06301b817` (2026-10); a newer build can leave parts in Claude's own colors until the style catches up.
- The code highlighter's colors are matched literally. A color Claude adds later shows as plain text until it is mapped.
- If you also run the official [Claude Catppuccin](https://github.com/catppuccin/userstyles/tree/main/styles/claude) style, turn one of them off. They style the same tokens.

## Verified

| Date | Claude build | Pages | Result |
|---|---|---|---|
| 2026-10-29 | `c06301b817` | new chat page, a chat with code blocks, Claude Design start page | No color outside the active flavor's palette on any visible element in Mocha, Frappé, Macchiato (dark mode) and Latte (light mode). Claude Design's muted thumbnail background and pressed links use shades mixed from the palette on purpose. |

No screenshots, because every page shows the account's name and chats.

## Credits

Structure and the code-block colors are derived from [catppuccin/userstyles](https://github.com/catppuccin/userstyles), `styles/claude` (MIT, © Catppuccin Org).
