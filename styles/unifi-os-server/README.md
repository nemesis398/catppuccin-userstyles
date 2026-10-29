# UniFi OS Server Catppuccin

Catppuccin for [UniFi OS Server](https://ui.com) and its Network application: the dashboard, topology, devices and clients with their side panels, ports, AirView, insights, the system log, alarms, admins and the settings pages.

## Setup

Open the style's settings in Stylus and enter your servers under **URLs of your UniFi OS Servers**, without `https://` but with the port if it is not 443, for example `unifi.example.com` or `192.0.2.10:11443`. Separate several servers with commas.

## How the flavor is chosen

The style follows UniFi's own theme setting (the half-moon button at the top right): your Dark Flavor with **Dark**, your Light Flavor with **Light**, and with **System** whichever your system uses.

## How it is built

UniFi draws most of its colors from design tokens, and the style sets every token again, once for UniFi's light theme and once for its dark theme. Each literal color is mapped by its distance from the theme's background: grays onto the ladder from base to text, hues onto tints between the background, the palette color and the text. Muted text is lifted a step or two so that it keeps 3:1 contrast in Latte.

The rest comes from UniFi's CSS modules and its CSS-in-JS, which write colors as literals. Those rules were collected from the running application in both themes and are repeated with the same selectors and the same specificity, so they win by coming later. It was generated from UniFi OS 5.1.42 with Network 10.6.109. The CSS-in-JS class names (`css-network-…`, `unifi-portal-…`) are hashes of their styles, so a component whose styles change in an update falls back to UniFi's own colors until the style is regenerated.

The style is large, about 900 KB, because it carries one rule for each of those components.

## Known gaps

- The charts on the dashboard and in the side panels are drawn on a canvas and keep UniFi's colors.
- User avatars keep their colors.
- In Latte, the labels on the filled bars of the dashboard (WiFi Connectivity, AP Radio TX Retries) stay at about 2.5:1 contrast. That is Latte's own green.
- Disabled controls stay faint on purpose.

## Verified

| Date | UniFi OS / Network | Pages | Result |
|---|---|---|---|
| 2026-10-29 | 5.1.42 / 10.6.109 | dashboard, topology, devices with a device panel (overview, statistics, settings and a dropdown), clients, ports, AirView, insights, system log, integrations, alarm manager, admins, settings (overview, WiFi, networks, high availability, system, control plane, identity) | No color outside the active flavor's palette on any visible element apart from the gaps above and the accent tints the style mixes itself, and no enabled text below 3:1 contrast apart from the Latte bars. Mocha, Frappé and Macchiato with the Dark theme, Latte with the Light theme. |

No screenshots, because the server it was checked on shows private devices and clients.
