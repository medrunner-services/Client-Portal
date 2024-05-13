import messages from "@intlify/unplugin-vue-i18n/messages";
import { createI18n } from "vue-i18n";

export const i18n = createI18n({
    legacy: false,
    fallbackLocale: "en-US",
    messages,
});
