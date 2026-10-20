import { readFileSync } from "node:fs";
import { marked } from "marked";

export interface Card {
  id: number;
  slug: string;
  name: string;
  cost: number;
  text: string;
  pieces: string[];
  v1_color: string;
  image: string;
  image_full: string;
}

const root = new URL("../../content/", import.meta.url);
const read = (p: string) => readFileSync(new URL(p, root), "utf-8");

export const deck: { version: string; cards: Card[] } = JSON.parse(read("cards.json"));
export const cards = deck.cards;
export const manifest = JSON.parse(read("manifest.json"));

/** Prefix a path with the site base (works on GitHub Pages sub-paths). */
export const url = (p = "") => `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${p.replace(/^\//, "")}`;
export const asset = (p: string) => url(`content/${p}`);

const PIECES = ["King", "Queen", "Rook", "Bishop", "Knight", "Pawn"];
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Wrap {King}-style tokens so the Chardss Display font draws the piece glyph. */
export function pieceTokens(html: string): string {
  return html.replace(/\{(King|Queen|Rook|Bishop|Knight|Pawn)\}/g,
    (_, p) => `<span class="piece" role="img" aria-label="${p}">{${p}}</span>`);
}
export const cardText = (text: string) => pieceTokens(escape(text));
export const plainText = (text: string) => text.replace(/\{(\w+)\}/g, "$1");

/** Rules: strip front matter, render Markdown, then add piece glyphs and heading ids. */
export function rules() {
  const md = read("rules.md").replace(/^---[\s\S]*?---\s*/, "");
  const headings: { id: string; text: string }[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((t: any) => t.raw).join("");
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (depth === 2) headings.push({ id, text });
    return `<h${depth} id="${id}">${pieceTokens(escape(text))}</h${depth}>`;
  };
  const html = pieceTokens(marked.parse(md, { renderer, async: false }) as string);
  return { html, headings };
}

export const costBands = [
  { key: "0", label: "Free", test: (c: number) => c === 0 },
  { key: "1", label: "1", test: (c: number) => c === 1 },
  { key: "2", label: "2", test: (c: number) => c === 2 },
  { key: "3", label: "3", test: (c: number) => c === 3 },
  { key: "4+", label: "4+", test: (c: number) => c >= 4 },
];
export { PIECES };
