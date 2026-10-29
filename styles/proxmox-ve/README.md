# Proxmox VE Catppuccin

Catppuccin for the [Proxmox VE](https://www.proxmox.com/en/products/proxmox-virtual-environment/overview) web interface: the resource tree, grids, summaries, dialogs, menus, the task log and the gauges.

## Setup

Open the style's settings in Stylus and enter your hosts under **URLs of your Proxmox VE hosts**, without `https://` but with the port, for example `pve.example.com:8006`. Separate several hosts with commas.

## How the flavor is chosen

The style follows the theme picked in Proxmox (user menu, **Color Theme**): your Dark Flavor while **Proxmox Dark** is active, your Light Flavor with the **Light theme**. With **Auto**, Proxmox Dark is active while your system is dark, so the flavor follows the system.

## How it is built

Proxmox VE has no color variables. The style repeats every rule of Proxmox's stylesheets (the ExtJS "crisp" theme, Proxmox's own CSS and Proxmox Dark) that sets a color, with each color replaced by a palette variable: grays by lightness and use, blues by the accent and its tints, status colors by red, peach, yellow and green. It was generated from Proxmox VE 9.2.21; a later release with new rules may leave some of them stock.

## Known gaps

- The usage charts are drawn on a canvas with ExtJS's built-in series colors, which CSS cannot reach. Their legends keep the same colors.
- Tags keep the colors you gave them.
- The console (noVNC and xterm.js) keeps its own colors.
- Proxmox's icons are pictures tuned for its own light or dark background. With a dark flavor as the Light Flavor (or Latte as the Dark Flavor) some of them lose contrast.

## Verified

| Date | Proxmox VE | Pages | Result |
|---|---|---|---|
| 2026-10-29 | 9.2.21 | datacenter search grid, node summary, container summary, storage summary, permissions, the Create VM wizard, the task viewer, a context menu, the task list | No color outside the active flavor's palette on any visible element apart from the gaps above and the accent's hover shade, and no text below 3:1 contrast. Mocha, Frappé and Macchiato with Proxmox Dark, Latte with the Light theme. |

No screenshots, because the host it was checked on is private.
