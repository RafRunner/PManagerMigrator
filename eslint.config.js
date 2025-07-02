import pluginJs from "@eslint/js";
import securityPlugin from "eslint-plugin-security";
import globals from "globals";
import tsPlugin from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Security
  securityPlugin.configs.recommended,
  pluginJs.configs.recommended,
  ...tsPlugin.configs.recommended,
  {
    files: ["**/*.ts"],
  },
  {
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      "func-style": ["error", "expression"],
      "no-restricted-syntax": ["off", "ForOfStatement"],
      "prefer-template": "error",
      quotes: ["error", "double", { avoidEscape: true }],
    },
  },
  // TypeScript Eslint
  {
    rules: {
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/no-explicit-any": ["off"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
];
