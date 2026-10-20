import { defineConfig } from "astro/config";

// GitHub Pages project site: https://thevaus.github.io/CHARDSS-Website/
// If you move to a custom domain, set `site` to it and remove `base`.
export default defineConfig({
  site: "https://thevaus.github.io",
  base: "/CHARDSS-Website",
  trailingSlash: "ignore",
});
