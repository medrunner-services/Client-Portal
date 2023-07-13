export default {
    semi: true,
    singleQuote: false,
    arrowParens: "avoid",
    tabWidth: 4,
    printWidth: 150,
    trailingComma: "all",
    plugins: [require("prettier-plugin-tailwindcss")],
    tailwindFunctions: ["tw"],
};
