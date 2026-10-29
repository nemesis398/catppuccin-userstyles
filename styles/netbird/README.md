# NetBird Catppuccin

Catppuccin for the [NetBird](https://netbird.io) dashboard, on app.netbird.io and on self-hosted instances: the Control Center graph, peers, access control, network routing, DNS, team, activity and settings.

## Setup

app.netbird.io works without setup. For a self-hosted dashboard, open the style's settings in Stylus and enter it under **URLs of your self-hosted NetBird dashboards**, without `https://`, for example `netbird.example.com`. Separate several dashboards with commas, and add the port if it is not the default one (`localhost:8080`).

## How the flavor is chosen

NetBird's dashboard has only a dark theme, so the style follows your system: Dark Flavor when it is dark, Light Flavor when it is light.

## How it is built

The dashboard is styled with Tailwind, which writes its colors as literals. Every rule of its stylesheets that sets a color is repeated in its original order with a palette variable: grays by their distance from the page background onto the ladder from base to text, NetBird's orange to the accent, the other hues to their palette color. Tailwind's opacity variables keep working. The logo's white wordmark is redrawn in the flavor's text color. It was generated from dashboard v2.95.0.

## Known gaps

- In Latte, the yellow initials on user avatars, the "Ctrl+K" hint in the search field and the "You" badge stay below 3:1 contrast. That is Latte's own yellow and sky.
- The small logo on narrow screens keeps NetBird's orange.

## Verified

| Date | Dashboard | Pages | Result |
|---|---|---|---|
| 2026-10-29 | v2.95.0 (management v0.81.4) | Control Center, peers, policies, groups, posture checks, networks, routes, nameservers, zones, users, audit events, settings | No color outside the active flavor's palette on any visible element in Mocha, Frappé, Macchiato and Latte, and no text below 3:1 contrast in the dark flavors. In Latte, the gaps above. |

Checked on a self-hosted instance, not on app.netbird.io. No screenshots, because the instance shows private peers and users.
