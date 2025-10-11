# Portfolio Template (no build tools)

A clean, fast multi-page portfolio for About, Projects, per-project case studies, and a CV page. Pure HTML/CSS/JS, deploys anywhere.

## Structure
- `index.html` – Landing page with featured project
- `about.html` – Bio, experience, education
- `projects.html` – Search + tag filters, loads from `data/projects.json`
- `project.html?slug=...` – Dynamic case study page (reads `projects.json`)
- `cv/` – Your CV (uses your uploaded HTML if provided)
- `styles/` – One CSS file with light/dark support
- `scripts/` – One JS file (nav, theme, project rendering)
- `assets/` – Favicon + placeholder images
- `.nojekyll`, `404.html`, `sitemap.xml` – GitHub Pages helpers

## Quick start (GitHub Pages)
1) Create a repo named `<your-username>.github.io`
2) Upload the contents of this folder (or push via Git)
3) (Optional) Settings → Pages → Set branch to `main` (if needed)
4) Open `https://<your-username>.github.io/`

## Customize
- Edit your name in `scripts/main.js` header brand or in `head()` HTML of each file.
- Change accent color in `styles/style.css` at `--accent`.
- Add projects in `data/projects.json` (set `"featured": true` to show on the homepage).
- For individual project pages, use: `/project.html?slug=<your-slug>`.
- Replace placeholder images in `/assets/img/`.

## Notes
- No external fonts to keep it snappy. Uses system fonts.
- Dark/light/auto theme supported (uses localStorage).
- Accessibility-minded (alt text, aria, focus states).