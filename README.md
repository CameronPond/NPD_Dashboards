# NPD Dashboards

Interactive HTML dashboards and tools for **Industrial Magnetics, Inc.** — built with the **Otter Werx** design system.

## Repository Structure

```
NPD_Dashboards/
├── styles/                         ← Shared stylesheets (canonical location)
│   ├── otter-werx-dark.css         ← Default dark cockpit theme (:root variables)
│   ├── otter-werx-tables.css       ← Shared table, card, form & UI components
│   ├── otter-werx-twilight.css     ← Twilight theme override ([data-theme="twilight"])
│   └── otter-werx-daylight.css     ← Daylight theme override ([data-theme="daylight"])
├── IMI_Mission_Control.html        ← Main launcher / dashboard hub
└── README.md
```

## Shared Styles

All dashboards **must** load the shared stylesheets from the `styles/` directory. Do **not** duplicate theme variables inline; they are defined once in the shared CSS files and inherited by every page.

### Standard HTML Head Template

Every dashboard HTML file should include the following in `<head>`:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>YOUR TITLE — Industrial Magnetics Incorporated</title>

<!-- Google Fonts (Otter Werx standard) -->
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Bebas+Neue&family=Rajdhani:wght@700&family=Orbitron:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<!-- Otter Werx shared styles (adjust relative path as needed) -->
<link rel="stylesheet" href="styles/otter-werx-dark.css">
<link rel="stylesheet" href="styles/otter-werx-tables.css">
<link rel="stylesheet" href="styles/otter-werx-twilight.css">
<link rel="stylesheet" href="styles/otter-werx-daylight.css">
```

> **Path note:** For HTML files in subdirectories (e.g. `project_managment-IMI/`), use `../styles/` as the relative path prefix. The local Windows path equivalent is `C:\Users\cpond\OneDrive - Industrial Magnetics, Inc\Documents\_Cams_TOOLS\styles`.

### Stylesheet Roles

| File | Purpose |
|------|---------|
| `otter-werx-dark.css` | Defines all CSS custom properties (`:root`) — backgrounds, text colors, accents, fonts, effects. This is the default "dark cockpit" theme. |
| `otter-werx-tables.css` | Shared UI components: `.sx-table`, `.sx-tag`, `.sx-metric`, `.sx-card`, `.sx-kv`, `.sx-input`, `.sx-btn`, scrollbar styling. |
| `otter-werx-twilight.css` | Overrides custom properties for `[data-theme="twilight"]` — dark slate mid-tone theme. |
| `otter-werx-daylight.css` | Overrides custom properties for `[data-theme="daylight"]` — clean light theme. |

### Theme Switching

To enable theme switching, include this standard JavaScript:

```javascript
function setTheme(t, btn) {
  if (t === 'dark') document.body.removeAttribute('data-theme');
  else document.body.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  try { localStorage.setItem('otter-werx-theme', t); } catch(e) {}
}

// Restore saved theme on load
(function() {
  let saved = 'dark';
  try { saved = localStorage.getItem('otter-werx-theme') || 'dark'; } catch(e) {}
  if (saved !== 'dark') document.body.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-btn').forEach(b => {
      if (b.textContent.trim().toLowerCase() === saved) b.classList.add('active');
      else b.classList.remove('active');
    });
  });
})();
```

### Available CSS Custom Properties

All custom properties are defined in `otter-werx-dark.css` and overridden per-theme. Key variables:

| Variable | Purpose |
|----------|---------|
| `--bg0` through `--bg4` | Background gradient stops (darkest to lightest) |
| `--bg-tile`, `--bg-tile-h` | Tile background and hover |
| `--border`, `--borderHi` | Standard and highlighted borders |
| `--text0`, `--text1`, `--text2` | Primary, secondary, and dim text |
| `--amber`, `--amberDim`, `--amberBg` | Primary accent color and variants |
| `--red`, `--green`, `--blue`, `--cyan`, `--purple` | Status / accent colors |
| `--mono`, `--sans`, `--orbit`, `--bebas`, `--body` | Font stacks |
| `--scanline`, `--dotgrid` | Background overlay effects |
| `--shadow`, `--glow` | Box shadow presets |

## Adding a New Dashboard

1. Create your HTML file in the appropriate subdirectory.
2. Copy the **Standard HTML Head Template** above into `<head>`, adjusting the relative path to `styles/`.
3. Use only the shared CSS custom properties for colors, fonts, and spacing — do **not** hardcode hex values.
4. Add page-specific component styles in an inline `<style>` block or a separate CSS file.
5. Include the theme switcher UI and JS for consistency.
6. Register your tool in `IMI_Mission_Control.html` to make it launchable from the hub.
