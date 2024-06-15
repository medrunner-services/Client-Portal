<script setup lang="ts">
import { MissionStatus, ResponseRating } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCard from "@/components/utils/GlobalCard.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";

const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const emit = defineEmits(["ratedEmergency"]);

const inputRating = ref<ResponseRating | undefined>(undefined);
const inputRemarks = ref("");
const sendingRating = ref(false);

async function rateEmergency(): Promise<void> {
    try {
        sendingRating.value = true;
        if (inputRemarks.value && inputRating.value)
            await emergencyStore.rateCompletedEmergency(emergencyStore.trackedEmergency!.id, inputRating.value, inputRemarks.value);
        else if (inputRating.value) await emergencyStore.rateCompletedEmergency(emergencyStore.trackedEmergency!.id, inputRating.value);
        emit("ratedEmergency");
    } catch (error: any) {
        emit("ratedEmergency");
    }

    sendingRating.value = false;
}
</script>

<template>
    <div v-if="emergencyStore.trackedEmergency">
        <div class="min-h-11">
            <h2 class="font-Mohave text-2xl font-semibold uppercase">{{ t("home_OngoingEmergency") }}</h2>
        </div>

        <GlobalCard class="mt-8">
            <p class="font-Mohave text-3xl font-bold">
                {{ emergencyStore.getEmergencyStatusTitle(emergencyStore.trackedEmergency.status) }}
            </p>
            <p class="mt-1 font-medium">{{ emergencyStore.getEmergencyStatusSubtitle(emergencyStore.trackedEmergency.status) }}</p>

            <form
                v-if="[MissionStatus.SUCCESS, MissionStatus.FAILED].includes(emergencyStore.trackedEmergency.status)"
                @submit.prevent="rateEmergency"
                class="mt-10"
            >
                <GlobalSelectInput
                    :options="[
                        { value: undefined, label: t('tracking_selectRating'), hidden: true },
                        { value: ResponseRating.GOOD, label: t('tracking_good') },
                        { value: ResponseRating.BAD, label: t('tracking_bad') },
                    ]"
                    :required="true"
                    :label="t('tracking_ratingTitle')"
                    v-model="inputRating"
                />

                <GlobalTextAreaInput :label="t('tracking_remarks')" :helper="t('tracking_helperRemarks')" v-model="inputRemarks" class="mt-4" />

                <GlobalButton :submit="true" :loading="sendingRating" class="mt-4 lg:w-fit" size="full">{{ t("tracking_sendRating") }}</GlobalButton>
            </form>

            <div v-else class="mt-10">
                <GlobalButton class="mt-4 lg:w-fit" size="full" @click="emit('ratedEmergency')">{{ t("tracking_finishButton") }}</GlobalButton>
            </div>
        </GlobalCard>
    </div>
</template>

<style scoped></style>
