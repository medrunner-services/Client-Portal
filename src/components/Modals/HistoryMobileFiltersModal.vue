<script setup lang="ts">
import type { MissionStatus } from "@medrunner/api-client";
import { useI18n } from "vue-i18n";
import HistoryDateFilter from "@/components/Dashboard/History/HistoryDateFilter.vue";
import HistoryStatusFilter from "@/components/Dashboard/History/HistoryStatusFilter.vue";
import ModalContainer from "@/components/utils/ModalContainer.vue";

const props = defineProps<{
    currentStatus: MissionStatus[];
    currentStart?: string;
    currentEnd?: string;
}>();

const emit = defineEmits<{
    updateDateFilter: [start: string, end: string];
    updateStatusFilter: [status: MissionStatus[]];
    close: [];
}>();

const { t } = useI18n();

function emitStatusUpdate(newStatus: MissionStatus[]): void {
    document.body.style.overflow = "auto";
    emit("updateStatusFilter", newStatus);
}

function emitDateUpdate(start: string, end: string): void {
    document.body.style.overflow = "auto";
    emit("updateDateFilter", start, end);
}
</script>

<template>
    <ModalContainer :title="t('history_filterModalTitle')" @close="emit('close')">
        <div>
            <div class="mt-6">
                <p
                    class="text-center font-semibold text-primary-600"
                >
                    {{ t("history_status") }}
                </p>

                <HistoryStatusFilter
                    class="mt-3"
                    :current-status="props.currentStatus"
                    @update-filter="(newStatus) => emitStatusUpdate(newStatus)"
                />
            </div>

            <hr class="my-4">

            <HistoryDateFilter
                class="mt-4"
                :current-start="props.currentStart"
                :current-end="props.currentEnd"
                @update-filter="(start, end) => emitDateUpdate(start, end)"
            />
        </div>
    </ModalContainer>
</template>

<style scoped></style>
