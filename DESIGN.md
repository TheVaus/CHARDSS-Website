# CHARDSS — Design

The site should feel like the game on the table: the card back's walnut-and-parchment checkerboard, the brass diamond logo, and serif lettering from the cards. Everything is taken from the printed game rather than from a web template.

The direction was set from the card back and the CHARDSS font, not by comparing other websites. The full brand book is the **CHARDSS Brand** design system; this file is the short version for the code.

## Signatures

1. **Board grid**: 8 files (`.files`), 4 on tablets below 900 px, 2 on phones. Touching blocks alternate parchment and walnut.
2. **Diagonal setting** (`.diagonal`): each line of a two- or three-line headline steps one file right. The home hero sets the motto on the a8–c6 diagonal of a real board.
3. **Notation** (`.notation`): every demo step also shows its move in algebraic notation, generated in `src/lib/demo.ts`.
4. **Captured tray** (`Tray.astro`): points are shown as fallen pieces with the total in a cost diamond.

## Color

| Token | Value | Role |
| --- | --- | --- |
| `--ebony` | `#1e140e` | Page background; card frame colour. |
| `--ebony-2` | `#2a1c13` | Hairlines and dividers on ebony. |
| `--walnut` | `#5b3a27` | Dark board squares, secondary buttons, panels. |
| `--walnut-2` | `#6b4630` | Hover for walnut; dark squares in board demos. |
| `--parchment` | `#dec896` | Light board squares, reading panels (rules), selected states. |
| `--parchment-2` | `#ead9b0` | Headings and strong text on dark backgrounds. |
| `--brass` | `#c9a24e` | The one accent: primary button, links, focus ring, move arrows. |
| `--rust` | `#a8452f` | Only for "not allowed" in demos (blocked squares, check, locks) and form errors. |
| `--ink` | `#2a1a10` | Text on parchment. |
| `--dust` | `#cdbb94` | Body text on ebony. |

Contrast: dust on ebony 9.6:1, ink on parchment 10.2:1, parchment-2 on walnut 7.2:1, ebony on brass 7.5:1; error text on parchment uses a darker rust `#8f3522` (4.7:1). Dark mode only (the game is dark).

**60-30-10.** Ebony is the ~60% (page), walnut and parchment the ~30% (panels, board, footer), brass the ~10% accent
(primary buttons, links, focus, the headline's last word). Rust stays reserved for "not allowed".

## Typography

- **Chardss Display** (Cormorant + chess-piece glyphs): headings, navigation, buttons, card text, numbers. `{King}`-style tokens render as pieces.
- **Alegreya Sans** (self-hosted): body copy, labels, form fields.
- Lining figures everywhere (`font-variant-numeric: lining-nums`).

Scale (perfect fourth, 1.333): 14 · 17 · 22.4 · 30 · 40 · 44–72 (fluid display). Body 17 px / 1.6, lines ≤ 66 ch. Headings weight 500, never all caps; the name **CHARDSS** is always written in capitals.

## Spacing and layout

4 px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. Content width 1200 px with a fluid gutter (16–48 px). Sections are separated by 64–112 px. Layout is left-aligned; the only symmetric element is the checkerboard pair of panels on the home page.

## Shape and depth

- Cards: real **3 mm corner radius**, cut into the images themselves (transparent corners), so no CSS radius is used on card art.
- Panels and inputs: square corners, like board squares.
- Buttons: the hexagonal name-banner shape from the card face.
- One shadow for objects on the table (cards, board): `drop-shadow(0 18px 30px rgb(0 0 0 / .45))`. Nothing else casts a shadow.
- Paper grain on parchment and walnut panels (a faint SVG noise), matching the printed stock.

## Components

- **Button**: primary (brass, ebony text), secondary (walnut, parchment text). Hover lightens; focus shows the 2 px brass ring; disabled is 45 % opacity with a not-allowed cursor.
- **Link**: brass, 1 px underline that thickens on hover.
- **Input**: parchment-2 field, ink text, 2 px walnut bottom border; focus ring brass; error text in rust with an icon and message.
- **Cost diamond**: walnut square rotated 45°, number in Chardss Display.
- **Board demo**: 8×8 board in parchment/walnut, Cburnett pieces recoloured, brass move arrows, rust for forbidden moves; captions numbered in sync; always pausable; frozen on the final position for reduced motion.
- **Navigation**: logo + CHARDSS wordmark, text links with a brass underline for the current page.
- **Footer**: navigation, contact link, credits.

## Imagery

- Card images and the card back come from the CHARDSS repo; never edited here.
- Board demos are generated from `content/demos.json`.
- No stock photos, no emoji, no icon font. The only icons are the chess pieces and the small shield/lock marks in demos.
