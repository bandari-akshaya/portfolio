# Bandari Akshaya — Portfolio

Plain HTML/CSS/JS, no build step required.

## Before publishing, add these two files into `assets/`:
- `assets/profile.jpeg` — profile photo used in the hero section
- `assets/Bandari_Akshaya.pdf` — resume, linked from the "Download Resume" button

Everything else (icons, favicon, structured data) is already wired up and ready to go.

## Run locally
Just open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Notes
- Theme (light/dark) persists via `localStorage`.
- Fullscreen toggle works via the button or the browser's native F11.
- The contact form validates on the client only — wire the `fetch`/`submit` handler in `js/main.js` (search for `CONTACT FORM`) to your own backend or a form service (e.g. Formspree) when ready.
- Update `https://bandariakshaya.dev/` in `index.html`, `robots.txt`, and `sitemap.xml` once you have a real domain.
