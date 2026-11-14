# Authelia Catppuccin

Catppuccin for the [Authelia](https://www.authelia.com) portal: the sign-in page, the second-factor pages and the user settings with their security and two-factor sections.

## Setup

Open the style's settings in Stylus and enter your portals under **URLs of your Authelia portals**, without `https://`, for example `auth\.example\.com`. Put a backslash before every dot and colon. Stylus hands the value to Less as it is, so a bare dot or colon breaks the style, which Stylus then reports as empty, and in an IP address it changes the address without an error. Separate several portals with commas, and add the port if it is not the default one (`localhost\:9091`).

## How the flavor is chosen

The style follows Authelia's `theme` setting: your Light Flavor with `light`, your Dark Flavor with `dark`, `grey` and `oled`. With `auto`, Authelia picks light or dark from your system, and the style follows that.

## How it is built

Since 4.39 the portal has been built with Tailwind, and Authelia sets its colors as variables per theme on the `data-theme` attribute of both `<html>` and `<body>`. The style sets those variables per flavor: the page in base, cards and menus in mantle, borders in surface1, buttons and focus rings in your accent. Authelia's pink-red secondary color (the Logout and Methods buttons) becomes maroon, because Latte's pink stays below 3:1 on the page. Success, warning, error and info take green, yellow, red and blue.

Some colors bypass those variables and are set by hand:

- The status icons derive their colors with `oklch(from ...)`, which leaves the palette. They take the palette color directly.
- Toasts derive theirs the same way. Their background and border are mixed from the toast's palette color and base instead, and their text takes the palette color, mixed 40 % toward text in Latte so green and yellow stay above 3:1.
- The password strength bar sets its colors inline, from weak to strong: red, peach, yellow, teal, green.
- The one-time password countdown dial is an SVG with fixed colors.
- The security key hand and the push notification phone draw black, because they have no fill of their own. They take the text color.
- White text and icons on filled buttons take crust, or base in Latte, like all text on a filled color.

## Known gaps

- The QR code for registering a one-time password stays black on white, so every authenticator app can still scan it. Its loading spinner stays white.
- Some of Authelia's green and amber text follows your system's dark mode rather than the portal's theme. With the `light` theme on a dark system it shows in the Dark Flavor's green and yellow on Latte. Authelia itself does the same.
- In Latte, text on a filled button stays below 3:1 with the lighter accents (rosewater, flamingo, pink, peach, yellow, green, sky, sapphire, lavender) and on the green success button (2.96:1). That is Latte's own palette, and the other styles here handle it the same way.

## Verified

| Date | Authelia | Pages | Result |
|---|---|---|---|
| 2026-11-14 | 4.39.28 | sign-in, one-time password, settings, security, two-factor settings | No color outside the active flavor's palette on any visible element, and no text below 3:1 contrast, in Mocha, Frappé and Macchiato with the `dark` theme and Latte with `light`. Toasts, the strength bar, the countdown dial, the security key and push icons and the legacy security key notice were checked on a test page built from Authelia's own stylesheets and class names, not on the live portal. |

No screenshots, because the portal it was checked on is private.
