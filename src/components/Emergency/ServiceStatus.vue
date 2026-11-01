<script setup lang="ts">
import { ServiceStatus } from "@medrunner/api-client";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import GlobalCard from "@/components/utils/GlobalCard.vue";
import { useLogicStore } from "@/stores/logicStore.ts";

const { t } = useI18n();
const logicStore = useLogicStore();

const effectiveStatus = computed(() => {
    if (logicStore.medrunnerSettings?.emergenciesEnabled === false)
        return ServiceStatus.OFFLINE;

    return logicStore.medrunnerSettings?.status;
});
</script>

<template>
    <div>
        <div class="min-h-11">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">
                {{ t("home_serviceStatus") }}
            </h2>
        </div>

        <div v-if="logicStore.medrunnerSettings">
            <GlobalCard
                v-if="
                    effectiveStatus === ServiceStatus.OPERATIONAL || effectiveStatus === ServiceStatus.UNKNOWN
                "
                class="mt-4 flex flex-col items-center justify-center gap-8"
            >
                <img src="/images/StatusShield_green.svg" class="h-28" alt="Status shield">
                <p class="text-xl font-semibold">
                    {{ t("home_statusAllOperational") }}
                </p>
            </GlobalCard>

            <GlobalCard
                v-else-if="effectiveStatus === ServiceStatus.SLIGHTLY_DEGRADED"
                class="mt-4 flex flex-col items-center justify-center gap-8"
            >
                <img src="/images/StatusShield_yellow.svg" class="h-28" alt="Status shield">
                <p class="text-xl font-semibold">
                    {{ t("home_statusSlightlyDisrupted") }}
                </p>
            </GlobalCard>

            <GlobalCard
                v-else-if="effectiveStatus === ServiceStatus.HEAVILY_DEGRADED"
                class="mt-4 flex flex-col items-center justify-center gap-8"
            >
                <img src="/images/StatusShield_orange.svg" class="h-28" alt="Status shield">
                <p class="text-xl font-semibold">
                    {{ t("home_statusHeavilyDisrupted") }}
                </p>
            </GlobalCard>

            <GlobalCard
                v-else-if="effectiveStatus === ServiceStatus.OFFLINE"
                class="mt-4 flex flex-col items-center justify-center gap-8"
            >
                <img src="/images/StatusShield_red.svg" class="h-28" alt="Status shield">
                <p class="text-xl font-semibold">
                    {{ t("home_statusDown") }}
                </p>
            </GlobalCard>
        </div>

        <div v-else>
            <GlobalCard class="mt-4 flex flex-col items-center justify-center gap-8">
                <img src="/images/StatusShield_green.svg" class="h-28" alt="Status shield">
                <p class="text-xl font-semibold">
                    {{ t("home_statusAllOperational") }}
                </p>
            </GlobalCard>
        </div>
    </div>
</template>

<style scoped></style>
