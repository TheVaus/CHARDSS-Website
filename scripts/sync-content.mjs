// Copies content/ (synced from the private CHARDSS repo) into public/content/
// so Astro serves the images, font and icons as static files.
import { cpSync, rmSync, existsSync } from "node:fs";

const src = new URL("../content/", import.meta.url);
const dst = new URL("../public/content/", import.meta.url);
if (!existsSync(src)) throw new Error("content/ is missing. Run the CHARDSS publish workflow.");
rmSync(dst, { recursive: true, force: true });
cpSync(src, dst, { recursive: true });
console.log("content/ -> public/content/");
