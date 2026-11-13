# YouTube Catppuccin

Catppuccin for YouTube: the main site, YouTube Studio, YouTube Music, the mobile site and players embedded in other websites. Unlike the official Catppuccin YouTube style, it maps every color YouTube defines, so nothing keeps YouTube's stock grays or red.

**Turn off the official Catppuccin YouTube style** (or delete it) before you install this one. Both apply to the same pages, and whichever Stylus loads last wins rule by rule.

## How the flavor is chosen

| Site | Flavor |
|---|---|
| www.youtube.com, studio.youtube.com | YouTube's own Appearance setting: Dark Flavor when YouTube is dark, Light Flavor when it is light |
| m.youtube.com | Your device's color scheme. The mobile site doesn't mark its theme in the page, so a theme set in YouTube against the device is not seen. The page still gets one consistent flavor. |
| music.youtube.com | Always the Dark Flavor. YouTube Music has no light theme. |
| Embedded players (youtube.com and youtube-nocookie.com) | Always the Dark Flavor, whatever the page around them looks like |

## Settings

| Setting | Default | Notes |
|---|---|---|
| Light Flavor | Latte | |
| Dark Flavor | Mocha | |
| Accent | Mauve | Takes the place of YouTube's red: the logo, the progress bar, the subscribe button and selected items. Red that means something (live, recording, errors, delete) stays Red. |

Captions keep the colors you set in the player. Thumbnails, video frames and artwork are not tinted; colors YouTube derives from artwork (Mix and playlist headers, the ambient glow, mini game cards, the Music player page) take palette surfaces instead.

## How it is built

YouTube draws most of its colors from custom properties: hashed tokens (`--t3e41d7b17b187f69`), `--yt-sys-color-*`, `--ytmusic-*` and the older Polymer `--light-theme-*` and `--dark-theme-*`. The rest are literal colors in its stylesheets. The block between the `generated` markers in `catppuccin.user.less` maps both to `var(--ctp-*)`:

- Grays go onto the ladder from crust to text by their contrast with YouTube's background. A gray YouTube keeps readable (3:1 or 4.5:1) stays readable in every flavor.
- Hues go to their palette color; YouTube's red goes to the accent unless the token or rule is about live, errors, recording or deleting.
- Transparency is kept with `color-mix()`.
- Tokens that YouTube keeps the same in both themes, and all literal rules, are mapped as in the dark theme. They sit on video and artwork, and so they match the player and follow the flavor.

The rest is in the hand rules of `#yt.rules()`: the logo, the live badge, the player's scrims and progress bar, and colors YouTube writes inline from artwork.

### Regenerating the tokens

When YouTube changes its colors, dump them again and rerun the generator.

1. Paste `scripts/youtube-dump.js` into the DevTools console on the site. Each function copies its dump to the clipboard; save it under the name shown.
2. Tokens, once with YouTube's Appearance set to Dark and once set to Light (the second run returns both):

   | Site | Call | File |
   |---|---|---|
   | www.youtube.com, home page | `ctpDumpTokens("www")` | `tokens-www.json` |
   | studio.youtube.com, dashboard | `ctpDumpTokens("studio")` | `tokens-studio.json` |
   | music.youtube.com, home page (Dark only) | `ctpDumpTokens("music")` | `tokens-music.json` |

3. Literal rules, with the Appearance set to Dark:

   | Site | Call | File |
   |---|---|---|
   | www.youtube.com, home page | `ctpDumpRules("desktop", { only: /ytmainappweb/ })` | `rules-desktop.json` |
   | www.youtube.com, a watch page | `ctpDumpRules("player", { only: /www-player\.css/ })` | `rules-player.json` |
   | studio.youtube.com, dashboard | `ctpDumpRules("studio")` | `rules-studio.json` |
   | music.youtube.com, home page | `ctpDumpRules("music", { withTokens: true })` | `rules-music.json` |
   | m.youtube.com, a watch page (mobile user agent, dark theme) | `ctpDumpRules("mobile", { withTokens: true })` | `rules-mobile.json` |
   | an embedded player, top-level with a `Referer` header | `ctpDumpRules("embed", { withTokens: true })` | `rules-embed.json` |

   The counts change with the modules YouTube loads on a page, so the dumps behind the current block (884 desktop declarations, for one) are not reproducible to the line. The mobile site's tokens are the same as www's and need no dump of their own.

4. Rerun the generator with all dumps, then the checks:

   ```sh
   node scripts/youtube-tokens.mjs --write styles/youtube/catppuccin.user.less \
     tokens-www.json tokens-studio.json tokens-music.json \
     rules-desktop.json rules-player.json rules-music.json rules-studio.json rules-mobile.json rules-embed.json
   npm test
   npm run check -- youtube
   ```

## Not covered

- YouTube Kids and YouTube TV (tv.youtube.com).
- The Studio page of a single video, since the test channel has no videos.
- m.youtube.com signed in. It was checked signed out, with search results standing in for a feed.
- Live chat popped out into its own window was not checked separately from the chat beside the video.

## Known gaps

- In Latte, a few colors are Latte's own and stay under 3:1: the Yellow accent's progress bar against its track (1.7:1), the membership header in live chat (Base on Green, 2.96:1), and the loaded part of the progress bar (2.7 to 3.0:1).
- Captions, YouTube's Ask feature and SponsorBlock's segments are left as they are.

## Verified

The checks injected the compiled style and swept every visible element for colors outside the active flavor's palette and for text under 3:1 against its background, including gradients and over video frames.

| Date | Site | Pages | Result |
|---|---|---|---|
| 2026-11-13 | www.youtube.com | home, watch page (player, chapters, description, comments), live chat, Shorts, search, channel, subscriptions, history, account, notifications and account menus, Save to playlist, mini player, hover, focus and selected states | 0 off-palette and 0 under 3:1 in Mocha and in Latte (YouTube's Appearance set to Light), apart from the gaps above; home and watch page also in Frappé and Macchiato. Player controls and menus at least 4.1:1 over a bright and a dark frame. Accents Mauve, Red and Gray: progress bar at least 3.2:1 against its track. |
| 2026-11-13 | studio.youtube.com | dashboard, content, Insights, Community, Create menu, upload dialog | 0 off-palette, 0 under 3:1 in Mocha and Latte |
| 2026-11-13 | music.youtube.com | home, library, search, album, playlist, now playing with the player bar and queue | 0 off-palette, 0 under 3:1 in Mocha; spot checks in Frappé and Macchiato |
| 2026-11-13 | m.youtube.com | home, watch page, search, menu (signed out, mobile user agent) | 0 off-palette, 0 under 3:1 in Mocha and Latte, and in Mocha with YouTube forced to light; watch page in Frappé and Macchiato |
| 2026-11-13 | Embedded players | youtube.com/embed and youtube-nocookie.com/embed: idle, paused with controls, settings open | 0 off-palette, 0 under 3:1 in Mocha |
