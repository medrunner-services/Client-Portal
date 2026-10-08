import { fileURLToPath, URL } from "node:url";

import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { resolveBuildVersion } from "./build/version.ts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
        __APP_VERSION__: JSON.stringify(
            resolveBuildVersion({
                cwd: fileURLToPath(new URL(".", import.meta.url)),
                production: mode === "production",
            }),
        ),
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
}));
