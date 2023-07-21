<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

<template>
    <div class="flex flex-col items-center justify-center">
        <h1 class="mt-52 font-Mohave text-5xl font-bold text-primary-900 lg:mt-64 lg:text-6xl">404</h1>
        <p class="mt-14 font-semibold lg:text-xl">{{ t("error_pageNotFound") }}</p>
    </div>
</template>

<style scoped></style>
