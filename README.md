# NPD_Dashboards

## Shared HTML/CSS standard

All dashboards and tools should use the shared styles from the repository `styles/` directory.

Canonical shared style files:

- `styles/otter-werx-dark.css`
- `styles/otter-werx-tables.css`
- `styles/otter-werx-twilight.css`
- `styles/otter-werx-daylight.css`

### Link pattern for HTML files

Use the relative path from each HTML file to the repo-level `styles/` folder:

- HTML in repo root:
  - `href="styles/otter-werx-dark.css"`
- HTML one folder deep:
  - `href="../styles/otter-werx-dark.css"`
- HTML two folders deep:
  - `href="../../styles/otter-werx-dark.css"`

Repeat the same pattern for tables/twilight/daylight CSS.

This keeps all dashboards aligned to one shared style location and avoids duplicated inline theme CSS across files.