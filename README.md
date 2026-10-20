# CHARDSS-Website

The website for **Chardss: Cards, Chess & Chaos** — chess with a shared deck of 40 rule-bending cards.

**Live site:** https://thevaus.github.io/CHARDSS-Website/

## Where the content comes from

Everything in [`content/`](content/) — the rulebook, `cards.json`, card images, the card back, the Chardss Display font and the piece icons — is published automatically from the private **CHARDSS** game repo. Don't edit it here; change it in CHARDSS and it shows up on the site within a couple of minutes.

```
CHARDSS (private)                          CHARDSS-Website (public)
rules/, cards/, fonts/, icons/  ──push──▶  content/  ──build──▶  GitHub Pages
        scripts/build_public.py              (Astro)
```

`content/manifest.json` records which CHARDSS commit the current content came from.

## The site

Built with [Astro](https://astro.build), no client framework.

| Page | Source |
| --- | --- |
| Home (opening-hand hero, turn order, points) | `src/pages/index.astro` |
| Rules (rendered from `content/rules.md`) | `src/pages/rules.astro` |
| Card gallery with cost filter and search | `src/pages/cards/index.astro` |
| One page per card | `src/pages/cards/[slug].astro` |

Card text and rules use `{King}`, `{Queen}`, `{Rook}`, `{Bishop}`, `{Knight}` and `{Pawn}` tokens; the Chardss Display font draws them as chess pieces.

## Working on it

```bash
npm install
npm run dev       # http://localhost:4321/CHARDSS-Website/
npm run build     # static site in dist/
```

Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Credits

Game and card design by Daniel Vekar. Chardss Display is a modified version of [Cormorant](https://github.com/CatharsisFonts/Cormorant) by Christian Thalmann, used under the SIL Open Font License (`content/fonts/OFL.txt`).
