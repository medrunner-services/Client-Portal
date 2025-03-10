<script setup lang="ts">
import { CancellationReason } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { getCancelReasonString } from "@/utils/functions/getStringsFunctions.ts";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const emit = defineEmits(["emergencyCanceled", "close"]);
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const inputCancelReason = ref<CancellationReason | "">("");
const cancelingEmergency = ref(false);
const errorCancelingEmergency = ref("");

const selectOptions = [
    { value: "", label: t("tracking_selectAReason"), hidden: true },
    { value: CancellationReason.RESCUED, label: getCancelReasonString(CancellationReason.RESCUED) },
    {
        value: CancellationReason.SUCCUMBED_TO_WOUNDS,
        label: getCancelReasonString(CancellationReason.SUCCUMBED_TO_WOUNDS),
    },
    {
        value: CancellationReason.SERVER_ERROR,
        label: getCancelReasonString(CancellationReason.SERVER_ERROR),
    },
    {
        value: CancellationReason.RESPAWNED,
        label: getCancelReasonString(CancellationReason.RESPAWNED),
    },
    {
        value: CancellationReason.OTHER,
        label: getCancelReasonString(CancellationReason.OTHER),
    },
];

async function cancelEmergency() {
    cancelingEmergency.value = true;
    errorCancelingEmergency.value = "";

    try {
        if (inputCancelReason.value) {
            await emergencyStore.cancelEmergency(emergencyStore.trackedEmergency!.id, inputCancelReason.value);
        } else {
            new Error();
        }

        document.body.style.overflow = "auto";
        emit("emergencyCanceled");
    } catch (error: any) {
        errorCancelingEmergency.value = errorString(error.statusCode);
    }
    cancelingEmergency.value = false;
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="t('tracking_cancelEmergencyModalTitle')" @close="emit('close')">
        <div>
            <p class="text-gray-500 dark:text-gray-400">{{ t("tracking_cancelEmergencyModalSubTitle") }}</p>

            <form @submit.prevent="cancelEmergency()">
                <GlobalSelectInput
                    v-model="inputCancelReason"
                    class="mt-4"
                    :options="selectOptions"
                    :label="t('tracking_labelCancelEmergency')"
                    :required="true"
                />

                <div class="mt-8 gap-2 lg:flex">
                    <GlobalButton :loading="cancelingEmergency" :submit="true" size="full" icon="cancel">{{
                        t("tracking_cancelButton")
                    }}</GlobalButton>
                    <GlobalButton type="secondary" size="full" class="mt-2 lg:mt-0" @click="modalContainer.close()">
                        {{ t("tracking_backCancelButton") }}</GlobalButton
                    >
                </div>
                <GlobalErrorText v-if="errorCancelingEmergency" :text="errorCancelingEmergency" :icon="false" class="mt-2 text-sm font-semibold" />
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
