<script setup lang="ts">
import { ResponseRating } from "@medrunner/api-client";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import GlobalSelectInput from "@/components/utils/GlobalSelectInput.vue";
import GlobalTextAreaInput from "@/components/utils/GlobalTextAreaInput.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";
import { useEmergencyStore } from "@/stores/emergencyStore";
import { errorString } from "@/utils/functions/stringFunctions.ts";

const props = defineProps<{
    emergencyId: string;
}>();
const emit = defineEmits<{
    close: [];
    ratedEmergency: [];
}>();
const emergencyStore = useEmergencyStore();
const { t } = useI18n();

const loadingRatingRequest = ref(false);
const errorRatingEmergency = ref("");
const inputRating = ref<ResponseRating>();
const inputRemarks = ref("");

const isInvalidReason = computed(() => {
    if (inputRemarks.value) {
        return inputRemarks.value.length > 1024;
    }
    else {
        return false;
    }
});

async function rateEmergency() {
    if (!inputRating.value || isInvalidReason.value)
        return;

    loadingRatingRequest.value = true;
    errorRatingEmergency.value = "";

    try {
        await emergencyStore.rateCompletedEmergency(props.emergencyId, inputRating.value, inputRemarks.value);

        document.body.style.overflow = "auto";
        emit("ratedEmergency");
    }
    catch (error: any) {
        errorRatingEmergency.value = errorString(error.statusCode);
    }
    finally {
        loadingRatingRequest.value = false;
    }
}
</script>

<template>
    <ModalContainer v-slot="modalContainer" :title="t('home_rateEmergencyModalTitle')" @close="emit('close')">
        <div>
            <p
                class="
                    text-gray-500
                    dark:text-gray-400
                "
            >
                {{ t("home_rateEmergencyModalDescription") }}
            </p>

            <form class="mt-10" @submit.prevent="rateEmergency()">
                <GlobalSelectInput
                    v-model="inputRating"
                    :options="[
                        { value: undefined, label: t('tracking_selectRating'), hidden: true },
                        { value: ResponseRating.GOOD, label: t('tracking_good') },
                        { value: ResponseRating.BAD, label: t('tracking_bad') },
                    ]"
                    :required="true"
                    :label="t('tracking_ratingTitle')"
                />

                <GlobalTextAreaInput
                    v-model="inputRemarks"
                    :label="t('tracking_remarks')"
                    :helper="t('tracking_helperRemarks')"
                    :error="isInvalidReason"
                    class="mt-4"
                />
                <GlobalErrorText v-if="isInvalidReason" class="mt-1 text-sm" :icon="false" :text="t('error_reasonTooLong')" />

                <div
                    class="
                        mt-8 gap-2
                        lg:flex
                    "
                >
                    <GlobalButton :loading="loadingRatingRequest" :submit="true" size="full">
                        {{ t("tracking_sendRating") }}
                    </GlobalButton>
                    <GlobalButton
                        type="secondary" size="full" class="
                            mt-2
                            lg:mt-0
                        " @click="modalContainer.close()"
                    >
                        {{ t("tracking_backCancelButton") }}
                    </GlobalButton>
                </div>
                <GlobalErrorText v-if="errorRatingEmergency" class="mt-4 text-sm font-semibold" :text="errorRatingEmergency" />
            </form>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
