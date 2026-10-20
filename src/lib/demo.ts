// Compiles a card demo (from content/demos.json) into an animated SVG.
// Every moving thing becomes an item with one state per frame; the timeline turns
// those states into CSS keyframes that loop. No JavaScript is needed to play it.
import { readFileSync } from "node:fs";
import { asset, cards } from "./content";

type Sq = string;
interface BoardStep {
  label: string;
  moves?: [Sq, Sq][];
  remove?: Sq[];
  place?: [string, Sq][];
  transform?: [Sq, string][];
  mark?: [Sq, string][];
  blocked?: [Sq, Sq][];
}
interface BoardDemo { scene?: "board"; intro?: string; pieces: string; steps: BoardStep[] }
interface TableItem { id: string; kind: "card" | "back" | "text" | "cross"; card?: string; text?: string; size?: number; accent?: boolean }
interface TableState { x?: number; y?: number; r?: number; o?: number }
interface TableDemo { scene: "table"; items: TableItem[]; frames: { label: string; state: Record<string, TableState> }[] }
export type Demo = BoardDemo | TableDemo;

const root = new URL("../../content/", import.meta.url);
export const demos: Record<string, Demo> = JSON.parse(readFileSync(new URL("demos.json", root), "utf-8"));

// ---------------------------------------------------------------- timeline
const INTRO = 1.6, MOVE = 0.7, HOLD = 1.7, OUTRO = 2.4, FADE = 0.6;

function timeline(frames: number) {
  const steps = frames - 1;
  const starts: number[] = [];
  for (let k = 1; k <= steps; k++) starts.push(INTRO + (k - 1) * (MOVE + HOLD));
  const lastEnd = steps ? starts[steps - 1] + MOVE : INTRO;
  const total = lastEnd + OUTRO + FADE;
  return { starts, total, final: lastEnd + 0.2 };
}
const pct = (t: number, total: number) => `${((t / total) * 100).toFixed(3)}%`;

interface State { x: number; y: number; r?: number; o: number }
const css = (s: State) =>
  `transform:translate(${round(s.x)}px,${round(s.y)}px)${s.r ? ` rotate(${s.r}deg)` : ""};opacity:${s.o}`;
const round = (n: number) => Math.round(n * 100) / 100;

function keyframes(name: string, states: State[], tl: ReturnType<typeof timeline>) {
  const pts: string[] = [`0%{${css(states[0])}}`];
  tl.starts.forEach((s, i) => {
    pts.push(`${pct(s, tl.total)}{${css(states[i])}}`);
    pts.push(`${pct(s + MOVE, tl.total)}{${css(states[i + 1])}}`);
  });
  pts.push(`100%{${css(states[states.length - 1])}}`);
  return `@keyframes ${name}{${pts.join("")}}`;
}

function labelKeyframes(name: string, k: number, tl: ReturnType<typeof timeline>) {
  // Frame k's caption is "on" from the moment its step starts until the next one does.
  const on = k === 0 ? 0 : tl.starts[k - 1];
  const off = k < tl.starts.length ? tl.starts[k] : tl.total - FADE;
  const dim = "opacity:.42", lit = "opacity:1";
  const p = (t: number) => pct(Math.max(0, Math.min(t, tl.total)), tl.total);
  return k === 0
    ? `@keyframes ${name}{0%{${lit}}${p(off)}{${lit}}${p(off + 0.3)}{${dim}}100%{${dim}}}`
    : `@keyframes ${name}{0%{${dim}}${p(on)}{${dim}}${p(on + 0.3)}{${lit}}${p(off)}{${lit}}${p(off + 0.3)}{${dim}}100%{${dim}}}`;
}

// ---------------------------------------------------------------- pieces
const PIECE_FILE: Record<string, string> = { k: "King", q: "Queen", r: "Rook", b: "Bishop", n: "Knight", p: "Pawn" };
const iconSrc = (name: string) => readFileSync(new URL(`icons/${name}.svg`, root), "utf-8");

function pieceSymbols(prefix: string) {
  let out = "";
  for (const [letter, name] of Object.entries(PIECE_FILE)) {
    const inner = iconSrc(name).replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
    const white = inner.replaceAll('fill="#fff"', 'fill="#f7eedb"').replaceAll('stroke="#000"', 'stroke="#1e140e"').replaceAll('fill="#000"', 'fill="#1e140e"');
    const black = inner.replaceAll('fill="#fff"', 'fill="#24170f"').replaceAll('stroke="#000"', 'stroke="#ecdcb2"').replaceAll('fill="#000"', 'fill="#ecdcb2"');
    out += `<symbol id="${prefix}-w${letter}" viewBox="0 0 45 45">${white}</symbol>`;
    out += `<symbol id="${prefix}-b${letter}" viewBox="0 0 45 45">${black}</symbol>`;
  }
  return out;
}

const S = 100; // one square = 100 user units
const xy = (sq: Sq) => ({ x: (sq.charCodeAt(0) - 97) * S, y: (8 - Number(sq[1])) * S });
const center = (sq: Sq) => { const p = xy(sq); return { x: p.x + S / 2, y: p.y + S / 2 }; };

function markShape(kind: string) {
  const inset = `x="6" y="6" width="${S - 12}" height="${S - 12}"`;
  switch (kind) {
    case "block":
      return `<rect width="${S}" height="${S}" fill="#a8452f" opacity=".45"/><path d="M22 22L78 78M78 22L22 78" stroke="#f3e2bd" stroke-width="9" stroke-linecap="round"/>`;
    case "check":
      return `<circle cx="50" cy="50" r="46" fill="#c0442c" opacity=".65"/>`;
    case "shield":
      return `<rect ${inset} fill="none" stroke="#c9a24e" stroke-width="7"/><path d="M76 8h18v11c0 9-6 14-9 15-3-1-9-6-9-15z" fill="#c9a24e" stroke="#1e140e" stroke-width="2"/>`;
    case "lock":
      return `<rect ${inset} fill="none" stroke="#a8452f" stroke-width="7"/><rect x="74" y="15" width="20" height="16" rx="2" fill="#a8452f" stroke="#1e140e" stroke-width="2"/><path d="M78 15v-4a6 6 0 0 1 12 0v4" fill="none" stroke="#a8452f" stroke-width="3.5"/>`;
    case "target":
      return `<circle cx="50" cy="50" r="43" fill="none" stroke="#c9a24e" stroke-width="7"/>`;
    case "win":
      return `<rect width="${S}" height="${S}" fill="#c9a24e" opacity=".55"/><circle cx="50" cy="50" r="46" fill="none" stroke="#f3e2bd" stroke-width="5"/>`;
  }
  return "";
}

function arrow(from: Sq, to: Sq, blocked = false) {
  const a = center(from), b = center(to);
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  const tip = { x: b.x - ux * 30, y: b.y - uy * 30 };   // stop short of the piece
  const base = { x: tip.x - ux * 36, y: tip.y - uy * 36 };
  const color = blocked ? "#a8452f" : "#c9a24e";
  const head = `<path d="M${tip.x},${tip.y} L${base.x - uy * 24},${base.y + ux * 24} L${base.x + uy * 24},${base.y - ux * 24}Z" fill="${color}"/>`;
  const end = blocked ? { x: b.x - ux * 30, y: b.y - uy * 30 } : base;
  const line = `<line x1="${a.x + ux * 20}" y1="${a.y + uy * 20}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="14" stroke-linecap="round"${blocked ? ' stroke-dasharray="2 26"' : ""}/>`;
  const x = blocked ? `<path d="M${b.x - 22},${b.y - 22}L${b.x + 22},${b.y + 22}M${b.x + 22},${b.y - 22}L${b.x - 22},${b.y + 22}" stroke="#a8452f" stroke-width="12" stroke-linecap="round"/>` : head;
  return `<g opacity=".92">${line}${x}</g>`;
}

interface Item { id: string; body: string; states: State[]; layer: "marks" | "arrows" | "pieces" }

function compileBoard(d: BoardDemo, prefix: string, name: string, cost: number) {
  const frames = d.steps.length + 1;
  const items: Item[] = [];
  const hidden = (n: number, from: number, pos = { x: 0, y: 0 }): State[] =>
    Array.from({ length: frames }, (_, k) => ({ ...pos, o: k >= from ? 1 : 0 }));

  // live pieces: square -> item
  const live = new Map<Sq, Item>();
  const addPiece = (p: string, sq: Sq, from: number) => {
    const white = p === p.toUpperCase();
    const it: Item = {
      id: `${prefix}-i${items.length}`,
      body: `<use href="#${prefix}-${white ? "w" : "b"}${p.toLowerCase()}" x="6" y="6" width="88" height="88"/>`,
      states: hidden(frames, from, xy(sq)),
      layer: "pieces",
    };
    items.push(it);
    live.set(sq, it);
    return it;
  };
  for (const tok of d.pieces.split(/\s+/)) addPiece(tok[0], tok.slice(1), 0);

  d.steps.forEach((st, i) => {
    const k = i + 1;
    // carry every live piece's state forward
    for (const it of items) it.states[k] = { ...it.states[k - 1] };
    const moving = (st.moves ?? []).map(([a, b]) => [live.get(a)!, a, b] as const);
    for (const [, a] of moving) live.delete(a);
    for (const [it, , b] of moving) {
      const victim = live.get(b);
      if (victim) for (let j = k; j < frames; j++) victim.states[j] = { ...victim.states[j - 1], o: 0 };
      for (let j = k; j < frames; j++) it.states[j] = { ...xy(b), o: it.states[k - 1].o };
      live.set(b, it);
    }
    for (const [, a, b] of moving) {
      if (!(st.moves ?? []).some(([x, y]) => x === b && y === a)) // swaps read clearly without arrows
        items.push({ id: `${prefix}-i${items.length}`, body: arrow(a, b), states: hidden(frames, k), layer: "arrows" });
    }
    for (const sq of st.remove ?? []) {
      const it = live.get(sq)!;
      for (let j = k; j < frames; j++) it.states[j] = { ...it.states[j], o: 0 };
      live.delete(sq);
    }
    for (const [p, sq] of st.place ?? []) addPiece(p, sq, k);
    for (const [sq, p] of st.transform ?? []) {
      const old = live.get(sq)!;
      for (let j = k; j < frames; j++) old.states[j] = { ...old.states[j], o: 0 };
      addPiece(p, sq, k);
    }
    for (const [sq, kind] of st.mark ?? [])
      items.push({ id: `${prefix}-i${items.length}`, body: markShape(kind), states: hidden(frames, k, xy(sq)), layer: "marks" });
    for (const [a, b] of st.blocked ?? [])
      items.push({ id: `${prefix}-i${items.length}`, body: arrow(a, b, true), states: hidden(frames, k), layer: "arrows" });
  });
  // pieces added later need states for earlier frames too (already filled by hidden())

  let squares = "";
  for (let r = 0; r < 8; r++)
    for (let f = 0; f < 8; f++) {
      const dark = (r + f) % 2 === 1;
      squares += `<rect x="${f * S}" y="${r * S}" width="${S}" height="${S}" fill="${dark ? "#6b4630" : "#e2cd9c"}"/>`;
    }
  let coords = "";
  for (let i = 0; i < 8; i++) {
    coords += `<text x="${i * S + S - 7}" y="${8 * S - 8}" text-anchor="end" fill="${i % 2 ? "#6b4630" : "#e2cd9c"}">${String.fromCharCode(97 + i)}</text>`;
    coords += `<text x="7" y="${i * S + 22}" fill="${i % 2 ? "#e2cd9c" : "#6b4630"}">${8 - i}</text>`;
  }

  const intro = d.intro ?? `White plays ${name}${cost === 0 ? ", which is free" : ` for ${cost} ${cost === 1 ? "point" : "points"}`}.`;
  const labels = [intro, ...d.steps.map((s) => s.label)];
  const svg = (layers: string) =>
    `<svg class="demo-svg" viewBox="-14 -14 828 828" role="img" aria-labelledby="${prefix}-t"><title id="${prefix}-t">Animated board: ${labels.join(" ")}</title>` +
    `<defs>${pieceSymbols(prefix)}</defs><rect x="-14" y="-14" width="828" height="828" rx="6" fill="#1e140e"/>` +
    `<g>${squares}</g><g class="coords">${coords}</g>${layers}</svg>`;
  return { items, labels, svg };
}

function compileTable(d: TableDemo, prefix: string) {
  const W = 22, H = 22 * 88 / 63;
  const frames = d.frames.length;
  const items: Item[] = d.items.map((t) => {
    let body = "";
    if (t.kind === "card" || t.kind === "back") {
      const src = t.kind === "back" ? asset("card-back.webp") : asset(cards.find((c) => c.slug === t.card)!.image);
      body = `<image href="${src}" x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" preserveAspectRatio="none"/>`;
    } else if (t.kind === "cross") {
      body = `<path d="M${-W / 2 + 3},${-H / 2 + 5}L${W / 2 - 3},${H / 2 - 5}M${W / 2 - 3},${-H / 2 + 5}L${-W / 2 + 3},${H / 2 - 5}" stroke="#c0442c" stroke-width="2.4" stroke-linecap="round"/>`;
    } else {
      body = `<text text-anchor="middle" dominant-baseline="middle" font-size="${t.size ?? 8}" fill="${t.accent ? "#c9a24e" : "#ead9b0"}" class="demo-text">${t.text}</text>`;
    }
    return { id: `${prefix}-${t.id}`, body, states: [], layer: "pieces" as const };
  });
  const byId = new Map(d.items.map((t, i) => [t.id, items[i]]));
  let prev: Record<string, State> = {};
  d.frames.forEach((f, k) => {
    const next: Record<string, State> = {};
    for (const t of d.items) {
      const base = prev[t.id] ?? { x: 0, y: 0, r: 0, o: 1 };
      const s = f.state[t.id] ?? {};
      const isCard = t.kind === "card" || t.kind === "back" || t.kind === "cross";
      const x = s.x !== undefined ? s.x + (isCard ? W / 2 : 0) : base.x;
      const y = s.y !== undefined ? s.y + (isCard ? H / 2 : 0) : base.y;
      next[t.id] = { x, y, r: s.r ?? base.r ?? 0, o: s.o ?? base.o };
      byId.get(t.id)!.states[k] = next[t.id];
    }
    prev = next;
  });
  void frames;
  const labels = d.frames.map((f) => f.label);
  const svg = (layers: string) =>
    `<svg class="demo-svg" viewBox="0 0 160 100" role="img" aria-labelledby="${prefix}-t"><title id="${prefix}-t">Animated table: ${labels.join(" ")}</title>` +
    `<rect width="160" height="100" rx="1.5" fill="#5b3a27"/><rect x="2" y="2" width="156" height="96" rx="1" fill="none" stroke="#6b4630" stroke-width=".6"/>${layers}</svg>`;
  return { items, labels, svg };
}

export function renderDemo(slug: string, name: string, cost: number, prefix = `d-${slug}`) {
  const d = demos[slug];
  if (!d) return null;
  const c = d.scene === "table" ? compileTable(d, prefix) : compileBoard(d as BoardDemo, prefix, name, cost);
  const tl = timeline(c.labels.length);
  let styles = `#${prefix}{--T:${tl.total.toFixed(2)}s;--final:-${tl.final.toFixed(2)}s}`;
  styles += `#${prefix} .layer{animation:${prefix}-layer var(--T) linear infinite}`;
  styles += `@keyframes ${prefix}-layer{0%{opacity:0}${pct(0.35, tl.total)}{opacity:1}${pct(tl.total - FADE, tl.total)}{opacity:1}100%{opacity:0}}`;
  const layer = (name: Item["layer"]) =>
    c.items.filter((i) => i.layer === name).map((i) => `<g class="it" style="animation-name:${i.id}">${i.body}</g>`).join("");
  for (const it of c.items) styles += keyframes(it.id, it.states, tl);
  c.labels.forEach((_, k) => (styles += labelKeyframes(`${prefix}-l${k}`, k, tl)));
  const svg = c.svg(`<g class="layer">${layer("marks")}${layer("pieces")}${layer("arrows")}</g>`);
  return { id: prefix, svg, styles, labels: c.labels, duration: tl.total };
}
