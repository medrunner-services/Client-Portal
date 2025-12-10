import antfu from "@antfu/eslint-config";
import betterTW from "eslint-plugin-better-tailwindcss";

export default antfu(
	{
		ignores: ["**/logs/*", "**/vscode/*", "**/idea/*", ".env*", "**/dist/*", "tailwind.config.js", "*.yaml", "src/locales/*"],
		vue: true,
		typescript: {
			overrides: {
				"ts/no-explicit-any": "off",
				"no-irregular-whitespace": "off",
				"vue/no-v-html": "off",
				"vue/require-default-prop": "off",
				"ts/no-unused-vars": ["error", { caughtErrorsIgnorePattern: "^_" }],
				"ts/only-throw-error": "off",
				"ts/no-misused-promises": "off",
				"unused-imports/no-unused-vars": "off",
				"antfu/no-top-level-await": "off",
				"no-unmodified-loop-condition": "off",
				"no-useless-catch": "off",
				"no-throw-literal": "off",
				"import/no-mutable-exports": "off",
				"node/prefer-global/process": "off",
			},
		},
		pnpm: false,
		stylistic: {
			quotes: "double",
			indent: "tab",
			semi: true,
			commaStyle: "last",
		},
	},
	{
		plugins: {
			"better-tailwindcss": betterTW,
		},
		settings: {
			"better-tailwindcss": {
				entryPoint: "src/assets/main.css",
			},
		},
		rules: {
			...betterTW.configs.recommended.rules,
			"better-tailwindcss/enforce-consistent-line-wrapping": ["warn", {
				printWidth: 250,
				indent: "tab",
				lineBreakStyle: "windows",
			}],
			"better-tailwindcss/no-unregistered-classes": "off",
			"better-tailwindcss/enforce-consistent-important-position": "error",
			"better-tailwindcss/no-deprecated-classes": "warn",
		},
	},
);
