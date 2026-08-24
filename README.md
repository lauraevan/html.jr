# HTML JR

Pick a loader and it opens. That is the whole idea.

A rounded hub for UBGs. A rotating hero up top for the popular ones, a grid of
everything else, and a floating island at the bottom that flips between the
library and a page where you bring your own html. Pure client side, no build
step, runs straight off githack.

## Getting around

- **The floating island** at the bottom has two tabs.
  - **Library** is the hero plus the grid of loaders, with search.
  - **HTML** is where you bring your own. Drop a `.html` or `.svg`, or paste a
    github link. It shows a quick "loading file" and then opens it.
- **The hero** cycles the popular loaders. It auto advances, has arrows and
  dots, and pauses when you hover.
- **Every card** shows a name, version, tag, the real logo where the project
  ships one, and a link back to its source.
- **A hidden scratch editor.** Press `Ctrl` + `E` (or `Cmd` + `E`), or tap the
  faint dot in the bottom right corner. Write html on the left, watch it render
  on the right, and "open full" throws it into the big viewer. Your text sticks
  around in the browser.

## The loaders right now

| name             | version | loads                                       | source |
| ---------------- | ------- | ------------------------------------------- | ------ |
| T9OS             | V.097   | `https://t9os.space/`                       | t9lat22/t9lat22.github.io |
| Cine OS          | V2      | jsDelivr build of the repo                  | nathanpikelny6-oss/CineOS |
| gn-math          |         | jsDelivr build of the repo                  | genizymath/gnnew |
| Cherri           | V2      | jsDelivr build of the repo (best effort)    | x8rr/cherri-v2-leak |
| Discord          |         | `library/discord.html`                      | saved page |
| Google Classroom |         | `library/google-classroom.html`            | provided file |

How each github one is pointed:

- **T9OS** ships a custom domain (`t9os.space`), so it loads the live site and
  all its sub games resolve.
- **Cine OS** uses relative asset paths, so its jsDelivr build loads clean.
- **gn-math** sets a jsDelivr base href inside its own page, so loading it from
  jsDelivr is self contained.
- **Cherri** is a leaked source build of a proxy app that normally needs its own
  server (its old host is down), so it is a best effort static load. Give me a
  working mirror url and I will point the card straight at it.

Logos come from each project's own repo over jsDelivr. If a logo cannot load,
the card quietly falls back to the first letter.

## Adding a loader

Open **`loaders.json`** and add an entry:

```json
{
  "id": "example",
  "name": "Example",
  "version": "V1",
  "tag": "games",
  "url": "https://example.com/",
  "source": "https://github.com/user/repo",
  "logo": "https://cdn.jsdelivr.net/gh/user/repo@main/logo.png",
  "accent": "#7b6cff",
  "featured": true,
  "blurb": "one short line for the card"
}
```

Only `name` and `url` really matter. `featured` puts it in the rotating hero.
`accent` colors its card and hero panel. `logo` is optional. `url` is whatever
should load in the frame: a live domain, a jsDelivr build, a githack link, or a
repo relative path like `library/thing.html`.

For local files, drop them in `library/` and point `url` at them.

### Pointing a github repo at something loadable

- `user.github.io` repos load their live domain.
- other repos default to their jsDelivr build (`cdn.jsdelivr.net/gh/user/repo/index.html`).
- github `blob` and `raw` links get rewritten to `raw.githack.com`.

## Deploy

githack serves the repo straight from github, so pushing is deploying.

- this branch: `https://raw.githack.com/lauraevan/html.jr/claude/html-jr-loader-uqxg5j/index.html`
- after merge: `https://raw.githack.com/lauraevan/html.jr/<default-branch>/index.html`

## Files

```
index.html      the page
styles.css      the look
app.js          the logic (hero, grid, island, viewer, bring your own, editor)
loaders.json    the list of loaders, edit this to add more
library/        local .html and .svg files that get loaded
```
