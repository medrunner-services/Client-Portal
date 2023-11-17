<script setup lang="ts">
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { locale, availableLocales } = useI18n({ useScope: "global" });

import DesktopInnerNavbar from "@/components/Navbar/DesktopInnerNavbar.vue";
import MobileInnerNavbar from "@/components/Navbar/MobileInnerNavbar.vue";

onMounted(() => {
    const userLanguage = localStorage.getItem("selectedLanguage");
    const availableMainLocales = availableLocales.map((locale) => locale.split("-")[0]);

    if (userLanguage) {
        locale.value = userLanguage;
    } else if (availableLocales.includes(navigator.language)) {
        locale.value = navigator.language;
    } else if (availableMainLocales.includes(navigator.language.split("-")[0])) {
        const fallbackLocal = availableLocales.find((item) => item.indexOf(navigator.language.split("-")[0]) === 0);
        if (fallbackLocal) {
            locale.value = fallbackLocal;
        } else {
            locale.value = "en-US";
        }
    } else {
        locale.value = "en-US";
    }
});
</script>

<template>
    <nav class="bg-white shadow-md dark:bg-gray-800 dark:shadow-gray-900">
        <div class="mx-auto font-medium">
            <DesktopInnerNavbar class="hidden lg:flex" />
            <MobileInnerNavbar class="block lg:hidden" />
        </div>
    </nav>
</template>

<style>
.router-link-active {
    @apply underline decoration-2 underline-offset-4;
}
</style>
