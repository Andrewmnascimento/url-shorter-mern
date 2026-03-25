// import js from "@eslint/js";
// import globals from "globals";
// import tseslint from "typescript-eslint";
// import { defineConfig } from "eslint/config";

// export default tseslint.config(
//   js.configs.recommended,
//   ...tseslint.configs.recommended,
//   {
//     files: ["**/*.{ts,mts,cts}"],
//     languageOptions: {
//       parserOptions: {
//         project: "./tsconfig.json",
//       },
//       globals: { ...globals.node }
//     },
//     rules: {
//       "no-console": "warn",
//       "semi": ["error", "always"],
//       "quotes": ["error", "double", { avoidEscape: true }],
//       "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
//       "@typescript-eslint/no-explicit-any": "warn",
//       "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }]
//     }
//   }
// );