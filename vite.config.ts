import { fileURLToPath, URL } from "node:url";

import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        port: 5174,
    },
    plugins: [
        vue(),
        VueI18nPlugin({
            include: "./src/locales/**",
        }),
    ],
    define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
