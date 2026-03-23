# NPD_Dashboards

## HTML dashboard style standard

This repository now uses a single shared stylesheet location:

- `styles/otter-werx-dark.css`
- `styles/otter-werx-tables.css`
- `styles/otter-werx-twilight.css`
- `styles/otter-werx-daylight.css`

### Canonical usage

For HTML files at the repo root:

```html
<link rel="stylesheet" href="styles/otter-werx-dark.css">
<link rel="stylesheet" href="styles/otter-werx-tables.css">
<link rel="stylesheet" href="styles/otter-werx-twilight.css">
<link rel="stylesheet" href="styles/otter-werx-daylight.css">
```

For HTML files inside a subfolder one level deep:

```html
<link rel="stylesheet" href="../styles/otter-werx-dark.css">
<link rel="stylesheet" href="../styles/otter-werx-tables.css">
<link rel="stylesheet" href="../styles/otter-werx-twilight.css">
<link rel="stylesheet" href="../styles/otter-werx-daylight.css">
```

### Standard rules

1. Keep theme tokens in the shared `styles/otter-werx-*.css` files.
2. Avoid large inline `<style>` blocks in HTML files.
3. Put page-specific layout and component CSS in a page stylesheet inside `styles/` when practical.
4. Load shared theme files before any page-specific stylesheet.

### Backward compatibility

The root-level `otter-werx-*.css` files remain in place as compatibility wrappers that import the canonical files from `styles/`. New dashboards should reference the canonical `styles/` paths directly.