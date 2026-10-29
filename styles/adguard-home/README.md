# AdGuard Home Catppuccin

Catppuccin for the [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome) web interface: the dashboard with its statistics cards and charts, the query log, filters, settings, clients and the setup guide.

## Setup

Open the style's settings in Stylus and enter your instances under **URLs of your AdGuard Home instances**, without `http://` but with the port if it is not 80, for example `dns.example.com` or `192.0.2.53:3000`. Separate several instances with commas.

## How the flavor is chosen

The style follows AdGuard Home's own theme setting (at the bottom of every page): your Dark Flavor with **Dark**, your Light Flavor with **Light**, and with **Auto** whichever your system uses.

## How it is built

AdGuard Home keeps most of its colors in variables, and the style sets them per flavor. The rest comes from the Tabler and Bootstrap CSS underneath, which writes colors as literals: every rule of AdGuard's stylesheet that sets a color is repeated in its original order, with each literal replaced by a palette variable. It was generated from AdGuard Home v0.107.79.

## Known gaps

- In Latte, AdGuard's green and peach accents (the active tab, the "Add" buttons, the statistics percentages) stay below 3:1 contrast against the background. That is Latte's own green and peach.

## Verified

| Date | AdGuard Home | Pages | Result |
|---|---|---|---|
| 2026-10-29 | v0.107.79 | dashboard, query log, filters, settings, DNS settings, clients, setup guide | No color outside the active flavor's palette on any visible element, and no text below 3:1 contrast apart from the gap above. Mocha, Frappé and Macchiato with the Dark theme, Latte with the Light theme. |

No screenshots, because the instance it was checked on shows private hosts and clients.
