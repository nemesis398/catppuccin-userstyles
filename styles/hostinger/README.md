# Hostinger Catppuccin

Catppuccin for [Hostinger](https://www.hostinger.com)'s control panel, hPanel: the home page, websites, domains and DNS, e-mail, VPS, the API page, the marketplace and the account settings.

## How the flavor is chosen

The style follows hPanel's own theme setting: your Dark Flavor in dark mode, your Light Flavor in light mode.

## How it is built

hPanel draws its colors from design tokens that point at a set of primitive colors. The style sets the primitives again, one set for each mode, and maps each by its distance from that mode's background: grays onto the ladder from base to text, Hostinger's purple to the accent, the other hues to their palette color. Text on filled colors (buttons, badges) takes the palette's dark text. The rules hPanel writes with literal colors were generated from its stylesheets as of 2026-10-29.

## Not covered

- www.hostinger.com uses the same tokens but only has a light mode, and it puts white text on dark artwork next to white sections. Mapped by tokens, that text disappears in the dark flavors, so the website is left out.
- The login page on auth.hostinger.com was not checked.

## Known gaps

- Promotional banners keep their artwork.
- In Latte, a few red, pink and peach labels (expiry dates, notification counts, "most popular" tags) stay between 2:1 and 3:1 contrast. That is Latte's own red, pink and peach.

## Verified

| Date | Pages | Result |
|---|---|---|
| 2026-10-29 | home, websites, domains, DNS, e-mail, VPS, API, marketplace, billing, account settings | No color outside the active flavor's palette on any visible element, apart from promotional artwork. No text below 3:1 contrast in Mocha, Frappé and Macchiato with the dark mode, and only the gaps above in Latte with the light mode. |

No screenshots, because the account shows private domains and servers.
