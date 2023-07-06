/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
    theme: {
        extend: {
            colors: {
                "primary-900": "#aa0000",
                "primary-800": "#b9150f",
                "primary-700": "#c51e17",
                "primary-600": "#d7291c",
                "primary-500": "#e5351a",
                "primary-400": "#e3473b",
                "primary-300": "#dd6962",
                "primary-200": "#ea928d",
                "primary-100": "#fdc8cb",
                "primary-50": "#fee9eb",
                "secondary-900": "#13293D",
                "secondary-800": "#263d55",
                "secondary-700": "#344f6b",
                "secondary-600": "#40748C",
                "secondary-500": "#517092",
                "secondary-400": "#6985a4",
                "secondary-300": "#819ab7",
                "secondary-200": "#a2b7d1",
                "secondary-100": "#c1d5ea",
                "secondary-50": "#e3eeff",
                "neutral-900": "#1c1917",
                "neutral-800": "#292524",
                "neutral-700": "#44403c",
                "neutral-600": "#57534e",
                "neutral-500": "#78716c",
                "neutral-400": "#a8a29e",
                "neutral-300": "#d6d3d1",
                "neutral-200": "#e7e5e4",
                "neutral-100": "#f5f5f4",
                "neutral-50": "#fafaf9",
            },
            fontFamily: {
                Mohave: ["Mohave", "sans-serif"],
                Inter: ["Inter", "sans-serif"],
            },
            fontSize: {
                title: "40px",
                "header-1": "32px",
                "header-2": "24px",
                "header-3": "18px",
                body: "16px",
                small: "14px",
                verysmall: "12px",
                tiny: "10px",
            },
            screens: {
                "3xl": "2000px",
                "4xl": "2500px",
                "5xl": "3000px",
            },
            backgroundImage: {
                "light-arrow-pattern": "url('/icons/chevron-up-down.svg')",
                "light-disabled-arrow-pattern": "url('/icons/chevron-up-down-disabled.svg')",
                "dark-arrow-pattern": "url('/icons/chevron-up-down-dark.svg')",
                "dark-disabled-arrow-pattern": "url('/icons/chevron-up-down-dark-disabled.svg')",
            },
        },
    },
    plugins: [require("@tailwindcss/forms")],
};
