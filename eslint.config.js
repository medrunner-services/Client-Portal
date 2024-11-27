import pluginVue from "eslint-plugin-vue";
import vueTsEslintConfig from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
    ...pluginVue.configs["flat/recommended"],
    ...vueTsEslintConfig(),
    {
        files: ["*.vue", "**/*.vue", "*.ts", "**/*.ts"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                parser: "@typescript-eslint/parser",
            },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "@typescript-eslint/no-explicit-any": "off",
            "no-irregular-whitespace": "off",
            "vue/no-v-html": "off",
            "vue/require-default-prop": "off",
            "@typescript-eslint/no-unused-vars": ["error", { caughtErrorsIgnorePattern: "^_" }],
        },
    },
    prettierConfig,
    { ignores: [".node_modules/", "**/logs/*", "**/vscode/*", "**/idea/*", ".env*", "**/dist/*", "tailwind.config.js"] },
];
