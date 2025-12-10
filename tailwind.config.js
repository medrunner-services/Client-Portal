/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}", "./node_modules/flowbite/**/*.js", "./node_modules/vue-tailwind-datepicker/**/*.js"],
    theme: {
        extend: {
            screens: {
                "3xl": "1920px",
            },
            colors: {
                "primary-900": "#170602",
                "primary-800": "#461307",
                "primary-700": "#741F0C",

                // primary 600 is the official Medrunner red
                "primary-600": "#AA0000",

                "primary-500": "#D13815",
                "primary-400": "#EA512E",
                "primary-300": "#EF785D",
                "primary-200": "#F39F8B",
                "primary-100": "#F8C5B9",
                "primary-50": "#FDECE8",
            },
            fontFamily: {
                Mohave: ["Mohave", "sans-serif"],
                Inter: ["Inter", "sans-serif"],
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        maxWidth: "none",
                        "li::marker": {
                            color: theme("colors.black"),
                        },
                        "li:has(> h3)::marker": {
                            fontSize: theme("fontSize.xl"),
                            fontWeight: theme("fontWeight.bold"),
                        },
                        "li:has(> h2)::marker": {
                            fontSize: theme("fontSize.2xl"),
                            fontWeight: theme("fontWeight.bold"),
                        },
                    },
                },
                invert: {
                    css: {
                        "li::marker": {
                            color: theme("colors.white"),
                        },
                    },
                },
            }),
        },
    },
    plugins: [require("flowbite/plugin"), require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
