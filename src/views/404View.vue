<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";

const { t } = useI18n();
</script>

<template>
    <main class="flex h-full w-full flex-col items-center justify-center text-center">
        <p class="font-Mohave text-8xl font-bold text-primary-600">404</p>
        <p class="mt-4 text-3xl font-bold">{{ t("404_somethingMissing") }}</p>
        <p class="mt-2">{{ t("404_helperText") }}</p>
        <RouterLink to="/" class="mt-10">
            <GlobalButton>{{ t("404_backToHomepage") }}</GlobalButton>
        </RouterLink>
    </main>
</template>
