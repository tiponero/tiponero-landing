# Tiponero Landing Page

Landing page for [tiponero.org](https://tiponero.org), a self-hosted Monero payment engine for creators and vendors.

## Stack

- Vanilla HTML, CSS, and JavaScript
- Tailwind CSS, compiled to `assets/css/site.css`
- Alpine.js and the Intersect plugin, vendored in `assets/vendor`
- Three.js and two addons, vendored in `assets/vendor`
- Self-hosted fonts in `assets/fonts`

The page makes no request to a third party. Fonts, icons, scripts, and styles all come from this directory. The only outbound URLs are links the visitor can click.

## File Structure

```
├── index.html              # Single-page entry point
├── tailwind.config.mjs     # Tailwind configuration (ESM, used by the CLI)
├── assets/
│   ├── css/input.css       # Tailwind entry point
│   ├── css/site.css        # Compiled output, committed
│   ├── fonts.css           # @font-face rules
│   ├── fonts/              # WOFF2 files
│   ├── vendor/             # Alpine, Intersect, Three.js
│   └── models/monero.glb   # Three.js model
└── scripts/
    ├── scene.js            # Three.js scene
    └── scroll.js           # Scroll-snap controller
```

## Build the CSS

`assets/css/site.css` is committed, so a change to `index.html` needs a rebuild before it shows up.

```bash
tailwindcss -c tailwind.config.mjs -i assets/css/input.css -o assets/css/site.css --minify
```

The Tailwind standalone binary works. In this repository it is at `../tiponero-core/bin/tailwindcss`, or run `nix develop` in `tiponero-core`.

## Local Development

```bash
python3 -m http.server
```

Open `http://localhost:8000`. A plain file open also works, but the Three.js module needs an HTTP origin.
