# ITECH Moodle Catppuccin

Catppuccin for the Moodle of the Berufliche Schule ITECH Hamburg ([moodle.itech-bs14.de](https://moodle.itech-bs14.de)).

## How the flavor is chosen

The style follows the site's own dark mode, which sets `data-bs-theme` on `<html>`. In dark mode it uses your Dark Flavor. Light mode stays the site's own unless you tick **Also theme the site's light mode** in the style's settings; then it uses your Light Flavor.

## The site's dark mode toggle is gone

Since early November 2026, the site no longer shows its dark mode toggle and never sets `data-bs-theme`, so the page stays light and the style has nothing to follow. The site's dark CSS is still there. [`dark-mode.user.js`](dark-mode.user.js) sets the attribute before the page draws:

1. Install a userscript manager such as Violentmonkey.
2. In Chromium 138 and later, open the manager's details page in the extensions settings and turn on **Allow user scripts**. Without it, no userscript runs.
3. [Install the script](https://github.com/nemesis398/catppuccin-userstyles/raw/main/styles/itech-moodle/dark-mode.user.js) and reload Moodle.

To go back to light mode, turn the script off. The "Light mode" button that reappears in the top right does nothing.

## Known gaps

- The video player keeps its own colors.

## Verified

| Date | Pages | Result |
|---|---|---|
| 2026-10-29 | dashboard, a course page with sections, activity links and an embedded video | No color outside the active flavor's palette on any visible element, apart from the video player, in Mocha, Frappé and Macchiato (dark mode) and Latte (light mode with the checkbox ticked). |
| 2026-11-03 | dashboard, a course page | Dark mode set by `dark-mode.user.js` in Violentmonkey 2.50.0: the site's dark CSS and Mocha apply on both pages. |

No screenshots, because every page behind the login shows a student's name and courses.
