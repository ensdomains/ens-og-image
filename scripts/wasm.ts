import * as esbuild from "esbuild";
import path from "path";

export const wasmPlugin: esbuild.Plugin = {
  name: "wasm",
  setup(build) {
    build.onResolve({ filter: /\.wasm\?module$/ }, async (args) => {
      return {
        path: path.join(args.resolveDir, args.path.split("?")[0]),
      };
    });
  },
};
