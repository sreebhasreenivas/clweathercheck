# Weather Check

A small weather app with light and dark themes. Plain HTML, CSS and JS, with no build step. Weather data comes from [Open-Meteo](https://open-meteo.com/), which needs no API key.

## Run

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

On Windows PowerShell, use `npx.cmd serve .` instead. The default execution policy blocks `npx.ps1` with "running scripts is disabled on this system".

## Theming

- All colours are CSS custom properties defined in `styles.css` under `:root[data-theme="light"]` and `:root[data-theme="dark"]`. Components use only these tokens, so any new UI picks up dark mode automatically.
- The switch in the header (`theme.js`) flips `data-theme` on `<html>` and saves the choice in `localStorage` (`weathercheck-theme`). With no saved choice, the app follows the OS `prefers-color-scheme`.
- An inline script in `<head>` applies the theme before first paint, so the page never flashes the wrong theme.
