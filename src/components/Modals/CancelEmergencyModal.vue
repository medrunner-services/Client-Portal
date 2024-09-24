<script setup lang="ts">
import { CancellationReason } from "@medrunner/api-client";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { useLogicStore } from "@/stores/logicStore";
import { errorString } from "@/utils/stringUtils";

const emit = defineEmits(["emergencyCanceled", "close"]);
const emergencyStore = useEmergencyStore();
const logicStore = useLogicStore();
const { t } = useI18n();

const inputCancelReason = ref<CancellationReason | "">("");
const cancelingEmergency = ref(false);
const errorCancelingEmergency = ref("");

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
                    :options="[
                        { value: '', label: t('tracking_selectAReason'), hidden: true },
                        { value: CancellationReason.RESCUED, label: logicStore.getCancelReasonString(CancellationReason.RESCUED) },
                        {
                            value: CancellationReason.SUCCUMBED_TO_WOUNDS,
                            label: logicStore.getCancelReasonString(CancellationReason.SUCCUMBED_TO_WOUNDS),
                        },
                        {
                            value: CancellationReason.SERVER_ERROR,
                            label: logicStore.getCancelReasonString(CancellationReason.SERVER_ERROR),
                        },
                        {
                            value: CancellationReason.RESPAWNED,
                            label: logicStore.getCancelReasonString(CancellationReason.RESPAWNED),
                        },
                        {
                            value: CancellationReason.OTHER,
                            label: logicStore.getCancelReasonString(CancellationReason.OTHER),
                        },
                    ]"
                    :label="t('tracking_labelCancelEmergency')"
                    :required="true"
                />

                <div class="mt-8 gap-2 lg:flex">
                    <GlobalButton :loading="cancelingEmergency" :submit="true" size="full" :error-text="errorCancelingEmergency" icon="cancel">{{
                        t("tracking_cancelButton")
                    }}</GlobalButton>
                    <GlobalButton type="secondary" size="full" class="mt-2 lg:mt-0" @click="modalContainer.close()">
                        {{ t("tracking_backCancelButton") }}</GlobalButton
                    >
                </div>
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
