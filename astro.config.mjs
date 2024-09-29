// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";
// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [sitemap()],
  output: "server",
  adapter: cloudflare(),
  markdown: {
    shikiConfig: {
      theme: "material-theme-darker",
      langs: [],
    },
  },
});
