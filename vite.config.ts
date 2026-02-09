import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/odd-rpg.ts"),
      formats: ["es"],
      fileName: "odd-rpg",
    },
    rollupOptions: {
      // Foundry VTT globals — don't bundle these
      external: [/^foundry/, /^pixi/],
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "system.json", dest: "." },
        { src: "templates/actor/*", dest: "templates/actor" },
        { src: "templates/item/*", dest: "templates/item" },
        { src: "lang/*", dest: "lang" },
        { src: "src/styles/*", dest: "styles" },
        { src: "LICENSE", dest: "." },
      ],
    }),
  ],
});
