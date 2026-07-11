// @ts-check
import { defineConfig } from "astro/config";

// Static output, no adapter, no client-side JavaScript.
// Cloudflare Pages serves the `dist/` directory as-is.
export default defineConfig({
  output: "static",
});
