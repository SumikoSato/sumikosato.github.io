import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default {
  input: "Legacy/src/main.js",
  output: {
    file: "Legacy/dist/legacy.bundle.js",
    format: "iife",
    name: "LegacyGame",
    sourcemap: false,
  },
  plugins: [
    resolve(),
    babel({
      babelHelpers: "bundled",
      presets: [
        [
          "@babel/preset-env",
          {
            targets: {
              android: "2.3",
              ios: "6",
              ie: "10",
              safari: "6",
            },
            modules: false,
            useBuiltIns: false,
            exclude: [
              "transform-async-to-generator",
              "transform-regenerator",
            ],
          },
        ],
      ],
      plugins: ["transform-async-to-promises"],
      extensions: [".js"],
    }),
  ],
};
