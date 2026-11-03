// ==UserScript==
// @name         ITECH Moodle dark mode
// @namespace    github.com/nemesis398/catppuccin-userstyles/styles/itech-moodle
// @description  Puts ITECH Moodle back in dark mode, now that the site's own toggle is gone.
// @version      2026.11.03
// @author       Mika Böhme
// @license      MIT
// @homepageURL  https://github.com/nemesis398/catppuccin-userstyles/tree/main/styles/itech-moodle
// @downloadURL  https://github.com/nemesis398/catppuccin-userstyles/raw/main/styles/itech-moodle/dark-mode.user.js
// @updateURL    https://github.com/nemesis398/catppuccin-userstyles/raw/main/styles/itech-moodle/dark-mode.user.js
// @match        https://moodle.itech-bs14.de/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// The site still ships its dark CSS, keyed on data-bs-theme="dark" on <html>,
// but no longer sets the attribute. Setting it at document-start avoids a
// white flash before the page draws.
document.documentElement.setAttribute("data-bs-theme", "dark");
