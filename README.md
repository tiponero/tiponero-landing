# Tiponero Landing Page

Landing page for [tiponero.org](https://tiponero.org) — a self-hosted Monero payment engine for creators and vendors.

## Stack

- Vanilla HTML/CSS/JS — no build step
- [Tailwind CSS](https://tailwindcss.com) via CDN
- [Alpine.js](https://alpinejs.dev) via CDN
- [Three.js](https://threejs.org) v0.170 via CDN importmap (ES modules)
- Google Fonts (Space Grotesk, Inter, JetBrains Mono)

## Structure

```
├── index.html              # Single-page entry point
├── tailwind.config.mjs     # Tailwind theme configuration
├── scripts/
│   ├── scene.js            # Three.js 3D scene (Monero coin, camera waypoints)
│   └── scroll.js           # Scroll-snap controller
└── assets/
    ├── favicon/            # Favicon set + web manifest
    └── models/
        ├── monero.glb      # 3D Monero coin model
        └── monero_2.glb    # Alternate 3D model
```

## Local Development

No build step required. Serve the root directory with any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

> **Note:** The site must be served over HTTP/S (not opened as a `file://` URL) due to ES module imports and `.glb` asset loading.

## Deployment

Deployed to GitHub Pages at [tiponero.org](https://tiponero.org).

See [GitHub Pages docs](https://docs.github.com/en/pages) for configuration details.
