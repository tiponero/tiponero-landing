# Tiponero Landing Page

Landing page for [tiponero.org](https://tiponero.org) a self-hosted Monero payment engine for creators and vendors.

## Stack

- Vanilla HTML/CSS/JS
- [Tailwind CSS](https://tailwindcss.com)
- [Alpine.js](https://alpinejs.dev)
- [Three.js](https://threejs.org)

## File Structure

```
├── index.html              # Single-page entry point
├── tailwind.config.mjs     # Tailwind styles configuration
├── scripts/
│   ├── scene.js            # Three.js 3D scene (Monero coin, camera waypoints)
│   └── scroll.js           # Scroll-snap controller
└── assets/
```

## Local Development

```bash
npx serve .
# or
python3 -m http.server
```
