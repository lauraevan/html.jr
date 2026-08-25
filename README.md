# HTML JR

Pick a loader and it opens in a new tab. Or bring your own html and it opens
in the viewer.

Runs straight off githack, no build step.

## Getting around

- **Floating island** at the bottom: **Library** (the hero and grid) and
  **HTML** (bring your own).
- **Clicking a loader opens it in a new tab.**
- **HTML tab:** drop a `.html` or `.svg`, or paste a link. It shows a quick
  "loading file" then opens it in an in-page viewer that actually renders it
  (uploads go through a `blob:` url, so they always work).
- **Hidden scratch editor:** `Ctrl` + `E` / `Cmd` + `E`, or the faint dot in
  the bottom right.

## How the catalog is served

Copying these sites into one repo is not possible (T9OS alone is ~576MB, and
GitHub caps files at 100MB), so each loader points at the best working source:

- **Copied in for real:** gn-math is small, so its files live in this repo
  under `library/gnmath/` and launch from here.
- **Served from the actual github repo** through `raw.githack.com` (not the
  project's own domain): T9OS, Cine OS, Noah's Tutoring. githack serves the real
  repo files with the right content type, so relative paths resolve and the page
  renders. This is what replaced `t9os.space` for T9OS.
- **Live site:** Truffled and Cherri are proxy apps that need their own server
  (Ultraviolet / scramjet), so static files cannot run them. Truffled opens
  `truffled.lol`. Cherri's old host is down, so it is a best effort static load.
- **Local files:** Discord and Google Classroom live in `library/`.

## Adding a loader

Edit **`loaders.json`**:

```json
{
  "id": "example",
  "name": "Example",
  "version": "V1",
  "tag": "games",
  "url": "https://raw.githack.com/user/repo/main/index.html",
  "source": "https://github.com/user/repo",
  "logo": "https://cdn.jsdelivr.net/gh/user/repo@main/logo.png",
  "accent": "#7b6cff",
  "featured": true
}
```

Only `name` and `url` are required. `featured` puts it in the hero. For a small
site you can copy it into `library/<id>/` and set `url` to
`library/<id>/index.html`. For a bigger static repo, point `url` at
`raw.githack.com/<user>/<repo>/<branch>/index.html`.

## Deploy

Pushing is deploying. githack caches for a bit, so hard refresh after a push.

- this branch: `https://raw.githack.com/lauraevan/html.jr/claude/html-jr-loader-uqxg5j/index.html`

## Files

```
index.html      the page
styles.css      the look (background image, glass panels)
app.js          hero, grid, island, viewer, importer, editor
loaders.json    the catalog
assets/bg.png   the background
library/        local files (gnmath, discord, google-classroom)
```
