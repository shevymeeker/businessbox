# BusinessBox

Offline-first entity formation tools that work after the first load with no authentication or subscriptions.

## Progressive Web App behavior
- `manifest.webmanifest` announces the standalone experience, theme colors, and icons used when installing the app.
- `service-worker.js` pre-caches the shell (landing UI, manifest, icons, external CDNs) with a Cache-First strategy and tracks toolkit pages with a Stale-While-Revalidate policy so updates arrive quietly without blocking startup.
- `toolkit/index.html` is included in the precache list to guarantee the toolkit entry point is available offline.

## Packaging the offline toolkit
1. Place any HTML/JS/CSS tools you want available offline inside `toolkit/` (for example `toolkit/forms.html`, `toolkit/styles.css`, etc.).
2. Add each new asset to either `SHELL_ASSETS` (for core chrome) or `TOOLKIT_ASSETS` (for toolkit content) inside `service-worker.js` so it is cached on install.
3. Publish the repository to GitHub Pages. When a user loads the site once, the service worker will cache the shell with Cache-First and keep toolkit content fresh with Stale-While-Revalidate, allowing subsequent visits to open instantly offline without sign-in or subscription checks.
4. When shipping an updated toolkit asset, bump the cache version constants in `service-worker.js` to trigger a controlled refresh of the cached files for returning offline users.
