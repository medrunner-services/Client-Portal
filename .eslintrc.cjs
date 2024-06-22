/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    extends: ["plugin:vue/vue3-recommended", "eslint:recommended", "@vue/eslint-config-typescript", "@vue/eslint-config-prettier/skip-formatting"],
    plugins: ["simple-import-sort"],
    parserOptions: {
        ecmaVersion: "latest",
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    rules: {
        "simple-import-sort/imports": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "vue/no-v-html": "off",
        "vue/require-default-prop": "off",
    },
};
