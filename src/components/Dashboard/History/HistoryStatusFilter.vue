<script setup lang="ts">
import type { HistoryFilterStatus } from "@/@types/types.ts";
import { MissionStatus } from "@medrunner/api-client";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalCheckbox from "@/components/utils/GlobalCheckbox.vue";
import { getStatusColor, getStatusString } from "@/utils/functions/getStringsFunctions.ts";

const props = defineProps<{
    currentStatus?: HistoryFilterStatus[];
    hideApplyButton?: boolean;
}>();

const emit = defineEmits<{
    updateFilter: [status: HistoryFilterStatus[]];
}>();

const selectedStatus = defineModel<HistoryFilterStatus[]>({ default: [] });

onMounted(() => {
    if (props.currentStatus)
        selectedStatus.value = [...props.currentStatus];
});

const { t } = useI18n();

const availableStatus: HistoryFilterStatus[] = [MissionStatus.SUCCESS, MissionStatus.FAILED, MissionStatus.SERVER_ERROR, MissionStatus.ABORTED, MissionStatus.REFUSED, MissionStatus.NO_CONTACT, MissionStatus.CANCELED];

function toggleStatus(status: HistoryFilterStatus) {
    const index = selectedStatus.value.indexOf(status);
    if (index > -1) {
        selectedStatus.value = selectedStatus.value.filter(s => s !== status);
    }
    else {
        selectedStatus.value = [...selectedStatus.value, status];
    }
}

function resetStatus() {
    selectedStatus.value = [];
}
</script>

<template>
    <div>
        <GlobalCheckbox
            v-for="(status) in availableStatus" :key="status" class="
                mt-3
                first:mt-0
            "
            :model-value="selectedStatus.includes(status)"
            @update:model-value="toggleStatus(status)"
        >
            <div
                class="cursor-pointer rounded-sm px-1.5 py-0.5 font-Inter text-xs font-medium normal-case"
                :class="getStatusColor(status)"
                @click="toggleStatus(status)"
            >
                {{ getStatusString(status) }}
            </div>
        </GlobalCheckbox>

        <GlobalButton v-if="!props.hideApplyButton" class="mt-4 w-full font-Inter text-xs" size="full" text-size="text-xs" @click="emit('updateFilter', selectedStatus)">
            {{ t("history_saveFilter") }}
        </GlobalButton>

        <p
            class="mt-1 cursor-pointer text-center font-Inter text-xs font-semibold text-primary-600 normal-case underline underline-offset-2"
            @click="resetStatus()"
        >
            {{ t("history_clear") }}
        </p>
    </div>
</template>

<style scoped>

</style>
