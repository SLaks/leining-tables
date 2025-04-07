import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid/configs/recommended";
import * as tsParser from "@typescript-eslint/parser";

export default tseslint.config([
  { files: ["**/*.{js,mjs,cjs,ts,tsx}"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    ...solid,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
      },
    },
  },
]);
