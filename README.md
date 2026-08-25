# HTML JR

Pick a loader and it opens in a new tab. That is the whole idea.

Flat, no build step, runs straight off githack.

## Getting around

- **The floating island** at the bottom has two tabs.
  - **Library** is the hero plus the grid.
  - **HTML** is where you bring your own: drop a `.html` or `.svg`, or paste a
    link. It shows a quick "loading file" and then opens it in a new tab.
- **Clicking a loader opens it in a new tab.** The hero has an Open button, the
  cards open on click.
- **The hero** cycles the featured loaders. It auto advances, has arrows and
  dots, and pauses on hover.
- **Hidden scratch editor:** press `Ctrl` + `E` (or `Cmd` + `E`), or tap the
  faint dot in the bottom right corner. Write html on the left, see it on the
  right, "open" throws it into a new tab. Your text is kept in the browser.

## How loading works

The frame is opened in a new tab, so the target site renders as itself.

- `raw.githubusercontent.com` and jsDelivr both serve `.html` as plain text, so
  a page loaded from them shows the code instead of rendering. **githack**
  (`raw.githack.com`) serves the real `text/html`, so repos are pointed there.
- Sites with their own domain (like T9OS) load that domain directly.
- Uploaded files open through a `blob:` url.

## The loaders

| name             | version | opens                                                  |
| ---------------- | ------- | ------------------------------------------------------ |
| T9OS             | V.097   | `https://t9os.space/`                                  |
| Cine OS          | V2      | githack build of nathanpikelny6-oss/CineOS             |
| gn-math          |         | githack build of genizymath/gnnew                      |
| Cherri           | V2      | githack build of x8rr/cherri-v2-leak (best effort)     |
| Noah's Tutoring  |         | githack build of NoahsAmazingTutoringHelp/...          |
| Discord          |         | `library/discord.html`                                 |
| Google Classroom |         | `library/google-classroom.html`                        |

Logos come from each project's own repo. If a logo cannot load, the card shows
the first letter instead.

Cherri is a leaked source build of a proxy that normally needs its own server
(its old host is down), so it is a best effort load. Point it at a working
mirror and it opens clean.

## Adding a loader

Open **`loaders.json`** and add an entry:

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

Only `name` and `url` are required. `featured` puts it in the hero. `url` is
what opens in the new tab, so use a live domain, a githack build, or a repo
relative path like `library/thing.html`. Put local files in `library/`.

## Deploy

githack serves the repo straight from github, so pushing is deploying. githack
caches for a bit, so a hard refresh helps after a new push.

- this branch: `https://raw.githack.com/lauraevan/html.jr/claude/html-jr-loader-uqxg5j/index.html`
- after merge: `https://raw.githack.com/lauraevan/html.jr/<default-branch>/index.html`

## Files

```
index.html      the page
styles.css      the look (flat, no gradients)
app.js          the logic (hero, grid, island, bring your own, editor)
loaders.json    the list of loaders
library/        local .html and .svg files
```
