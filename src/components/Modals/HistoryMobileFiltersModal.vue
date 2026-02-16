<script setup lang="ts">
import type { HistoryFilterStatus } from "@/@types/types.ts";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import HistoryDateFilter from "@/components/Dashboard/History/HistoryDateFilter.vue";
import HistoryStatusFilter from "@/components/Dashboard/History/HistoryStatusFilter.vue";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";

const props = defineProps<{
    currentStatus: HistoryFilterStatus[];
    currentStart?: string;
    currentEnd?: string;
}>();

const emit = defineEmits<{
    updateFilters: [start: string, end: string, status: HistoryFilterStatus[]];
    close: [];
}>();

const { t } = useI18n();

const selectedStatus = ref<HistoryFilterStatus[]>([...props.currentStatus]);
const selectedStartDate = ref<string>(props.currentStart ?? "");
const selectedEndDate = ref<string>(props.currentEnd ?? "");

function handleUpdate() {
    emit("updateFilters", selectedStartDate.value, selectedEndDate.value, selectedStatus.value);
}

function resetAll() {
    selectedStatus.value = [];
    selectedStartDate.value = "";
    selectedEndDate.value = "";
}
</script>

<template>
    <ModalContainer :title="t('history_filterModalTitle')" @close="emit('close')">
        <div>
            <div class="mt-6">
                <p
                    class="text-center font-semibold"
                >
                    {{ t("history_date") }}

                    <HistoryDateFilter
                        v-model:selected-start-date="selectedStartDate"
                        v-model:selected-end-date="selectedEndDate"
                        class="mt-3"
                        :hide-apply-button="true"
                    />
                </p>
            </div>

            <hr class="my-4">

            <div>
                <p
                    class="text-center font-semibold"
                >
                    {{ t("history_status") }}
                </p>

                <HistoryStatusFilter
                    v-model="selectedStatus"
                    class="mt-3"
                    :hide-apply-button="true"
                />
            </div>

            <GlobalButton class="mt-8 w-full font-Inter text-xs" size="full" text-size="text-xs" @click="handleUpdate()">
                {{ t("history_saveFilter") }}
            </GlobalButton>
            <p
                class="mt-2 cursor-pointer text-center font-Inter text-xs font-semibold text-primary-600 normal-case underline underline-offset-2"
                @click="resetAll()"
            >
                {{ t("history_clearAll") }}
            </p>
        </div>
    </ModalContainer>
</template>

<style scoped></style>
