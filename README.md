# HTML JR

**An underground loader for `.html` and `.svg` files.**
Load anything into a live iframe with full execution support — browse the
preloaded library, import any GitHub repo, or paste a raw URL. Pure
client-side, no build step, deploys straight off GitHub via githack.

```
  ┌─ HTML JR ──────────────────────────────────────────┐
  │  the floor is open · load at your own risk          │
  └─────────────────────────────────────────────────────┘
```

## What it does

- **Loads `.html` and `.svg` into a real iframe** — scripts, canvas, audio,
  pointer events all run live (this is not a static preview).
- **The floor** — a marketplace-style grid of preloaded listings from
  `library.json`, with search, type filters, favorites, and recents.
- **GitHub import** — type `owner/repo` (or paste a repo / blob / raw URL) and
  it lists every loadable `.html` / `.svg` in the repo. Click one to run it.
- **Local files** — drag a file anywhere on the page, or hit `⬆ file`.
- **Safe mode** — a shield toggle in the viewer re-sandboxes the iframe when
  you want to open something you don't trust.

## How loading works

GitHub's `raw.githubusercontent.com` serves HTML as `text/plain` (so it won't
render), and `github.com/.../blob/...` is a web page, not the file. HTML JR
rewrites both to **`raw.githack.com`**, which serves the file with the correct
MIME type *and* keeps relative asset paths working — so a repo's HTML loads
with its CSS/JS/images intact. Local uploads load via `Blob` URLs.

| you paste…                                   | it loads via                         |
| -------------------------------------------- | ------------------------------------ |
| `library/foo.html` (repo-relative)           | direct                               |
| `owner/repo`                                 | GitHub API → file browser → githack  |
| `github.com/o/r/blob/main/x.html`            | `raw.githack.com/o/r/main/x.html`    |
| `raw.githubusercontent.com/o/r/main/x.html`  | `raw.githack.com/o/r/main/x.html`    |
| any other `https://…/x.html` or `.svg`       | direct                               |
| a dropped/uploaded file                       | `blob:` URL                          |

## Adding to the library

Drop your files in `library/` and add an entry to **`library.json`**:

```json
{
  "id": "my-thing",
  "title": "MY THING",
  "type": "html",
  "src": "library/my-thing.html",
  "seller": "you",
  "price": "0.00Ξ",
  "rating": 4.8,
  "featured": true,
  "tags": ["canvas", "fx"],
  "desc": "one-line pitch shown on the card"
}
```

`src` can be a repo-relative path **or** any URL (GitHub blob/raw links are
auto-rewritten to githack). `type` is `html` or `svg`. `thumb` (optional) can
point to an image; otherwise HTML listings get a live scaled preview and SVGs
render themselves. Only `title`, `type`, and `src` are required — the rest have
sensible defaults.

The five bundled listings (`neon-rain`, `synth-grid`, `terminal`, `orb`,
`paint`) double as a smoke test and as templates for your own entries.

## Deploy (githack)

githack serves files straight from GitHub — pushing **is** deploying.

- **Live/dev (this branch):**
  `https://raw.githack.com/lauraevan/html.jr/claude/html-jr-loader-uqxg5j/index.html`
- **Production (after merge to the default branch):**
  `https://raw.githack.com/lauraevan/html.jr/<default-branch>/index.html`

> `raw.githack.com` = CDN-cached, meant for production. `raw.githubusercontent`
> paths won't render HTML; always use the githack host for the app URL.

## Hidden bits

- `/` focuses the loader. `Esc` closes the viewer.
- In the loader input: `token: <github_pat>` stores a token locally (raises the
  GitHub API rate limit for private/large repos); `token clear` removes it. The
  token never leaves your browser.
- The bundled `JR://TERMINAL` listing is a live toy shell — try `help`.

## Files

```
index.html      structure
styles.css      the whole aesthetic
app.js          loader logic (library, github, viewer, filters)
library.json    the marketplace manifest — edit this to add listings
library/        the preloaded .html / .svg files
```

No dependencies, no bundler. Open `index.html` over http (or githack) and go.
