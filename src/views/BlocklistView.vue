<script setup lang="ts">
import { useI18n } from "vue-i18n";

import BlocklistCard from "@/components/BlocklistCard.vue";
import BlocklistForm from "@/components/BlocklistForm.vue";

const { t } = useI18n();
</script>

<template>
    <div class="content-container flex flex-col items-center">
        <h1 class="text-center text-3xl lg:text-4xl font-Mohave font-semibold uppercase">{{ t("blocklist_Title") }}</h1>

        <BlocklistForm />
        <BlocklistCard />
    </div>
</template>

<style scoped></style>
