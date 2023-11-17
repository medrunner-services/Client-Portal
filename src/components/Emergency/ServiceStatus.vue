<script setup lang="ts">
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";

const { t } = useI18n();
</script>

<template>
    <div>
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_serviceStatus") }}</h2>

        <GlobalCard class="mt-8 flex flex-col items-center justify-center gap-8">
            <img src="/images/StatusShield_green.svg" class="h-28" alt="Status shield" />
            <p class="text-xl font-semibold">{{ t("home_statusAllOperational") }}</p>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
