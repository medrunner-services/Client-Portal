<script setup lang="ts">
import { type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";

const { t } = useI18n();

enum Status {
    Operational = "OPERATIONAL",
    Degraded = "DEGRADED",
    Down = "DOWN",
}

const status: Ref<Status> = ref(Status.Degraded);
</script>

<template>
    <div>
        <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_serviceStatus") }}</h2>

        <GlobalCard v-if="status === Status.Operational" class="mt-8 flex flex-col items-center justify-center gap-8">
            <img src="/images/StatusShield_green.svg" class="h-28" alt="Status shield" />
            <p class="text-xl font-semibold">{{ t("home_statusAllOperational") }}</p>
        </GlobalCard>

        <GlobalCard v-else-if="status === Status.Degraded" class="mt-8 flex flex-col items-center justify-center gap-8">
            <img src="/images/StatusShield_yellow.svg" class="h-28" alt="Status shield" />
            <p class="text-xl font-semibold">{{ t("home_statusDisrupted") }}</p>
        </GlobalCard>

        <GlobalCard v-else-if="status === Status.Down" class="mt-8 flex flex-col items-center justify-center gap-8">
            <img src="/images/StatusShield_red.svg" class="h-28" alt="Status shield" />
            <p class="text-xl font-semibold">{{ t("home_statusDown") }}</p>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
