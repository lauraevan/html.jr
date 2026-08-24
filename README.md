# HTML JR

Pick a loader and it opens. That is the whole idea.

A rounded, no-nonsense hub for UBGs. There is a rotating hero up top for the
popular ones, a grid of everything else, and a box where you can paste any link
and hit load. Pure client side, no build step, runs straight off githack.

## What is in it

- **A rotating hero** of the popular loaders (auto advances, arrows and dots to
  move around, pauses when you hover).
- **A grid of loaders** with search. Each card has a name, version, a tag and a
  link back to its source.
- **Paste any link and load it.** A full URL loads directly. `owner/repo` and
  github links get pointed at a servable version automatically.
- **A hidden scratch editor** for quick html. Press `Ctrl` + `E` (or `Cmd` + `E`),
  or tap the faint dot in the footer. Write on the left, watch it render on the
  right, and "open full" throws it into the big viewer. Your text sticks around
  in the browser.

## The loaders right now

| name       | version | loads                                            | source |
| ---------- | ------- | ------------------------------------------------ | ------ |
| T9OS       | V.097   | `https://t9os.space/`                            | t9lat22/t9lat22.github.io |
| gn-math    |         | jsDelivr build of the repo                       | genizymath/gnnew |
| Cherri     | V2      | jsDelivr build of the repo (best effort)         | x8rr/cherri-v2-leak |

Notes on how each one is pointed:

- **T9OS** ships with a custom domain (`t9os.space`), so it loads the live site.
  Root relative paths and its sub games all resolve there.
- **gn-math** sets `<base href="https://cdn.jsdelivr.net/gh/genizymath/gnnew@main/">`
  inside its own page, so loading it from jsDelivr is self contained and its
  assets resolve on their own.
- **Cherri** is a leaked source build of a proxy app that normally needs its own
  server (its old host, axisleak.app, is down). It is wired to the repo build as
  a best effort, so it may not fully run as a plain static page. If you have a
  working mirror URL, drop it in and it will load cleanly.

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
  "accent": "#7b6cff",
  "featured": true,
  "blurb": "one short line for the card"
}
```

Only `name` and `url` really matter. `featured` puts it in the rotating hero.
`accent` colors its card and hero panel. `url` is whatever should actually load
in the frame, so use a live domain, a jsDelivr build, or a githack link.

### Pointing a github repo at something loadable

- `user.github.io` style repos load their live domain.
- other repos default to their jsDelivr build (`cdn.jsdelivr.net/gh/user/repo/index.html`),
  which works for pages built with relative or jsDelivr based paths.
- github `blob` and `raw` links get rewritten to `raw.githack.com` so the html
  actually renders with its assets.

## Deploy

githack serves the repo straight from github, so pushing is deploying.

- this branch: `https://raw.githack.com/lauraevan/html.jr/claude/html-jr-loader-uqxg5j/index.html`
- after merge: `https://raw.githack.com/lauraevan/html.jr/<default-branch>/index.html`

## Files

```
index.html     the page
styles.css     the look
app.js         the logic (hero, grid, loader, viewer, scratch editor)
loaders.json   the list of loaders, edit this to add more
```
