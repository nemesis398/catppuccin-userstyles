# ITECH Moodle Catppuccin

Catppuccin for the Moodle of the Berufliche Schule ITECH Hamburg ([moodle.itech-bs14.de](https://moodle.itech-bs14.de)).

## How the flavor is chosen

The style follows the site's own dark mode toggle (top right). In dark mode it uses your Dark Flavor. Light mode stays the site's own unless you tick **Also theme the site's light mode** in the style's settings; then it uses your Light Flavor.

## Known gaps

- The video player keeps its own colors.

## Verified

| Date | Pages | Result |
|---|---|---|
| 2026-10-29 | dashboard, a course page with sections, activity links and an embedded video | No color outside the active flavor's palette on any visible element, apart from the video player, in Mocha, Frappé and Macchiato (dark mode) and Latte (light mode with the checkbox ticked). |

No screenshots, because every page behind the login shows a student's name and courses.
