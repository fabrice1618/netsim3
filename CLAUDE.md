# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Educational network simulator running entirely in the browser as a static site hosted on GitHub Pages. No backend, no framework — pure vanilla JavaScript rendered on an HTML5 `<canvas>`.

## Build

```bash
npm run build
```

Concatenates and minifies all JS source files (in dependency order) into `dist/networksim.min.js` using `uglify-js`. The order is explicitly listed in `package.json` and mirrors the `<script>` tags in `simulatordev.html`.

For development, use `index-dev.html` instead — it loads individual source files directly, avoiding a rebuild after each change.

## HTML entry points

| File | Bundle | Dataset | Verbose | Purpose |
|------|--------|---------|---------|---------|
| `index-dev.html` | individual JS files | none | yes | Development |
| `index.html` | `dist/networksim.min.js` | none | no | Production (GitHub Pages root) |
| `index-verbose.html` | `dist/networksim.min.js` | none | yes | Teacher correction view |
| `exemple01.html` | `dist/networksim.min.js` | `examples/data01.json` | no | Example with preset topology |

`verbose` mode displays device configuration without requiring dialog interaction — useful for correcting exercises.

## Architecture

### Global state (`js/Globals.js`)

Three globals drive the simulator:
- `network` — the `Network` instance
- `uimanager` — the `UIManager` instance
- `NetworkSimulator` — namespace with `initialdata` (preloaded JSON topology) and `verbose` flag

### Startup sequence

`ImageLoader` fetches all `img/64/*.png` assets, then calls the `simulator(imgs)` callback which creates `Network` and `UIManager`, loads `NetworkSimulator.initialdata` if set, then calls `createControlsWindow()`.

### Network model

`Network` (Network.js) owns arrays of **elements** (devices) and **links**. Devices are one of: `Host` (computer), `DHCPServer`, `DNSServer`, `HTTPServer`, Switch, Router — all extending `Connectable`.

Each device composes:
- `Drawable` — canvas position and image
- `Connectable` — holds `Connector` ports, MAC/IP addresses, `TrafficManager`, `GatewayManager`
- **apps** array — protocol stacks (e.g. `DHCPClient`, `DNSClient`, `HTTPClient` on a computer; `DHCPServer` on port 67, etc.)

`TrafficManager` handles per-device packet forwarding and NAT tables. `GatewayManager` holds the default gateway and static routing table. `IPInfo.js` provides IPv4 address validation and manipulation utilities.

### Protocol simulation

Protocol clients and servers are in `js/DHCPClient.js`, `js/DHCPServer.js`, `js/DNSClient.js`, `js/DNSServer.js`, `js/HTTPClient.js`, `js/HTTPServer.js`. `Message.js` models in-flight packets (envelopes animated on canvas). `Link.js` models a cable between two connectors.

### UI layer

`UIManager` coordinates all UI components: `UINavbar` (top HTML navbar, replaces the canvas hamburger menu), `UISidebar` (left sidebar for contextual per-element menus), `UIMenu` (floating menu), `UIWindow`/`UIRectangle`/`UITable`/`UILine`/`UIClickable`. `AnimationControls` manages play/pause. `UITranslation` drives i18n using locale files under `js/i18n/` (`en_GB.js`, `es_ES.js`, `eu_ES.js`).

### Save/load format

Network topologies serialize to JSON. `examples/data01.json` is loaded as a JS variable (`var exampledata = {...}`) and assigned to `NetworkSimulator.initialdata` before the simulator starts. The same format is used for the download/upload feature.

## GitHub Pages deployment

This is a fully static site. Deploying means pushing to the branch configured in GitHub Pages settings (typically `master` or `gh-pages`). No build step is required for production if `dist/networksim.min.js` is committed — the HTML files reference it directly.
