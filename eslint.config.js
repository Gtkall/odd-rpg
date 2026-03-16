import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  // --- Ignored paths ---
  { ignores: ["dist/**", "node_modules/**"] },

  // --- TypeScript source files ---
  {
    files: ["src/**/*.ts"],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      sonarjs.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // --- Selectively promoted strict rules ---
      "@typescript-eslint/no-unnecessary-condition": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // --- Warn rather than error on explicit any ---
      // Foundry's stubs require boundary casts; annotated cases are acceptable.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",

      // --- Sonar overrides ---
      // Cognitive complexity cap: default 15 is reasonable; tighten if desired.
      "sonarjs/cognitive-complexity": ["warn", 15],
      // Sonar's no-unused-vars conflicts with TS's own checker
      "sonarjs/no-unused-vars": "off",
      // void-use conflicts with @typescript-eslint/no-floating-promises:
      // we use void to explicitly discard promises in event handlers.
      "sonarjs/void-use": "off",

      // --- Unused vars: allow _-prefixed params (intentionally unused overrides) ---
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // --- General ---
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
);
