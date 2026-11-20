import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import next from "@next/eslint-plugin-next";

export default tseslint.config(
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./packages/config/tsconfig.base.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "@next/next": next,
    },
    rules: {
      // Turn off the old React import requirement – Next.js 15 uses the new JSX transform
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    // Extend recommended configs for ESLint, TypeScript, React, JSX‑a11y and Next.js
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.strict,
      ...react.configs.recommended,
      ...reactHooks.configs.recommended,
      ...jsxA11y.configs.recommended,
      ...next.configs.recommended,
    ],
  }
);
