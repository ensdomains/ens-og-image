import esbuild from "esbuild";
import { wasmPlugin } from "./wasm";

const built = await esbuild.build({
  treeShaking: true,
  bundle: true,
  splitting: false,
  minify: true,
  entryPoints: ["./src/index.tsx"],
  outdir: "dist",
  target: "es2022",
  format: "esm",
  platform: "browser",
  conditions: ["workerd", "worker", "browser"],
  loader: {
    ".bin": "copy",
    ".wasm": "copy",
  },
  plugins: [wasmPlugin],
  alias: {
    "viem/*": "./node_modules/viem/_esm/*",
    "@ensdomains/ensjs/*": "./node_modules/@ensdomains/ensjs/dist/esm/*",
  },
  metafile: true,
});

Bun.write("./dist/meta.json", JSON.stringify(built.metafile, null, 2));

console.log("Build complete!");
