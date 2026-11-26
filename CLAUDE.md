# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A static weather app: plain HTML, CSS and vanilla JS (ES5-style IIFEs plus `async`/`await`), with no build step, no package manifest, no linter and no tests. Weather data comes from Open-Meteo's geocoding and forecast APIs, which need no API key.

## Run

Open `index.html` directly, or serve the folder:

```
npx serve .
```

On Windows PowerShell, use `npx.cmd serve .`, because the default execution policy blocks `npx.ps1`. `.claude/launch.json` (gitignored, machine-specific) defines a `weathercheck` preview server on port 5173.

## Architecture

- `index.html` loads `theme.js` and then `app.js`. Each is a self-contained IIFE that looks up elements by id at load time, so renaming an id in the HTML means updating the JS too.
- **Theming** runs in three places:
  - An inline `<head>` script defines `window.WC_THEME_KEY` (the localStorage key, defined only there) and sets `data-theme` on `<html>` before first paint, from the saved choice or `prefers-color-scheme`.
  - `theme.js` reads that key, syncs the `role="switch"` toggle, saves explicit choices, and follows OS changes until the user picks a theme. It keeps an in-memory flag so a choice still holds when storage is blocked. It adds `html.theme-ready` after two animation frames, so the page doesn't animate colours on load.
  - `styles.css` keeps every colour as a custom property under `:root[data-theme="light"]` and `:root[data-theme="dark"]`. New UI should use these tokens only, never hard-coded colours, so it picks up dark mode automatically. Colour transitions are scoped to `html.theme-ready` and turned off under `prefers-reduced-motion`.
- **Weather flow** (`app.js`), on form submit:
  - `geocode()` splits the query on commas: the first part is the city, and every other part must match the result's country, country code or `admin1` region. Matching accepts exact names, the `REGION_ABBR` table (Australian states/territories, US states), or a region prefix of 3 or more letters. Searches with a qualifier fetch 100 candidates instead of 10.
  - `getWeather()` then fetches current conditions and a 5-day daily forecast (`timezone: 'auto'`).
  - `renderCurrent()` and `renderForecast()` fill the DOM with `textContent`/`createElement` only, never HTML strings.
  - On any error the UI resets to the empty state, so stale results never sit next to an error. A `TypeError` from `fetch` is shown as a connectivity message.
- **Status line:** `#status` is an `aria-live` region. It shows loading, success ("Showing weather for …") and error messages; the `.error` class marks errors. Keep a message there after success so screen readers announce results.
- **Weather icons and labels** come from the `CODES` map of WMO weather codes in `app.js`; unknown codes fall back to "Unknown".
- `[hidden]` is forced to `display: none !important` in CSS, so toggling `.hidden` in JS is how sections show and hide.
