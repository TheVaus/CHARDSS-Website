# CHARDSS-Website

The website for **CHARDSS: Chess, Cards, Chaos** — chess with a shared deck of 40 rule-bending cards.

**Live site:** https://thevaus.github.io/CHARDSS-Website/

## Where the content comes from

Everything in [`content/`](content/) — the rulebook, `cards.json`, the card demos (`demos.json`), card images, the card back, the font and the piece icons — is published automatically from the private **CHARDSS** game repo. Don't edit it here; change it in CHARDSS and it shows up on the site within a couple of minutes.

```
CHARDSS (private)                          CHARDSS-Website (public)
rules/, cards/, fonts/, icons/  ──push──▶  content/  ──build──▶  GitHub Pages
        scripts/build_public.py              (Astro)
```

`content/manifest.json` records which CHARDSS commit the current content came from.

## The site

Built with [Astro](https://astro.build), no client framework. Design decisions are in [`DESIGN.md`](DESIGN.md).

| Page | Source |
| --- | --- |
| Home (opening-hand hero, turn order, points) | `src/pages/index.astro` |
| Rules (rendered from `content/rules.md`) | `src/pages/rules.astro` |
| Card gallery | `src/pages/cards/index.astro` |
| One page per card, with its animated board demo | `src/pages/cards/[slug].astro`, `src/components/Demo.astro`, `src/lib/demo.ts` |
| Design notes (economy, card pricing, golden rules, the look) | `src/pages/design.astro`, images in `public/design/` |
| Contact form (Formspree) | `src/pages/contact.astro`; set the form ID in `src/site.config.ts` |

Card text and rules use `{King}`, `{Queen}`, `{Rook}`, `{Bishop}`, `{Knight}` and `{Pawn}` tokens; the Chardss Display font draws them as chess pieces.

## Working on it

```bash
npm install
npm run dev       # http://localhost:4321/CHARDSS-Website/
npm run build     # static site in dist/
```

Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Credits

Game and card design by Daniel Vekar. Chess pieces by Colin M.L. Burnett (Cburnett). The CHARDSS font (Chardss Display) is a modified version of [Cormorant](https://github.com/CatharsisFonts/Cormorant) by Christian Thalmann, used under the SIL Open Font License (`content/fonts/OFL.txt`).
