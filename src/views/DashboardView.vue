<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

import { AlertColors } from "@/@types/types.ts";
import BlockedUserCTA from "@/components/Dashboard/BlockedUserCTA.vue";
import ChartEmergencyBreakdown from "@/components/Dashboard/Charts/ChartEmergencyBreakdown.vue";
import ChartEmergencyNumberPerWeek from "@/components/Dashboard/Charts/ChartEmergencyNumberPerWeek.vue";
import ChartEmergencySuccessRate from "@/components/Dashboard/Charts/ChartEmergencySuccessRate.vue";
import CTAEmergency from "@/components/Dashboard/CTAEmergency.vue";
import HistoryTable from "@/components/Dashboard/History/HistoryTable.vue";
import UnlinkedUserCTA from "@/components/Dashboard/UnlinkedUserCTA.vue";
import RateEmergencyModal from "@/components/Modals/RateEmergencyModal.vue";
import { useAlertStore } from "@/stores/alertStore.ts";
import { useUserStore } from "@/stores/userStore";
import { clearURLParams } from "@/utils/functions/urlFunctions.ts";

const userStore = useUserStore();
const route = useRoute();
const alertStore = useAlertStore();
const { t } = useI18n();

const displayRateEmergencyModal = ref(false);

onMounted(() => {
    if (route.query.rateemergency) {
        displayRateEmergencyModal.value = true;

        clearURLParams();
    }
});

function handleRatedEmergency() {
    displayRateEmergencyModal.value = false;
    alertStore.newAlert(AlertColors.GREEN, t("home_rateEmergencySuccess"));
}
</script>

<template>
    <div
        class="
            content-container flex flex-col gap-10
            xl:flex-row
        "
    >
        <div class="xl:w-1/2">
            <BlockedUserCTA v-if="userStore.isBlocked" />
            <UnlinkedUserCTA v-else-if="!userStore.user.rsiHandle" />
            <CTAEmergency v-else />
            <HistoryTable class="mt-4" />
        </div>

        <div class="xl:w-1/2">
            <ChartEmergencyBreakdown />
            <ChartEmergencySuccessRate class="mt-4" />
            <ChartEmergencyNumberPerWeek class="mt-4" />
        </div>

        <RateEmergencyModal
            v-if="displayRateEmergencyModal"
            :emergency-id="route.query.rateemergency as string"
            @close="displayRateEmergencyModal = false"
            @rated-emergency="handleRatedEmergency()"
        />
    </div>
</template>
