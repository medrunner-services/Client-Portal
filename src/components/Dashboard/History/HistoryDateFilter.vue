<script setup lang="ts">
import { computed, onMounted, toRaw, useTemplateRef } from "vue";
import { useI18n } from "vue-i18n";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalDateInput from "@/components/utils/GlobalDateInput.vue";

const props = defineProps<{
    currentStart?: string;
    currentEnd?: string;
    hideApplyButton?: boolean;
    requireRange?: boolean;
}>();

const emit = defineEmits<{
    updateFilter: [start: string, end: string];
}>();

const { t } = useI18n();

const startDate = defineModel<string>("selectedStartDate", { default: "" });
const endDate = defineModel<string>("selectedEndDate", { default: "" });

onMounted(() => {
    if (props.currentStart)
        startDate.value = toRaw(props.currentStart);

    if (props.currentEnd)
        endDate.value = toRaw(props.currentEnd);
});

const startDateRef = useTemplateRef("startDateRef");
const endDateRef = useTemplateRef("endDateRef");

const isInvalidDate = computed(() => {
    if (props.requireRange && (!startDate.value || !endDate.value))
        return true;
    else if ((startDateRef.value && !startDateRef.value.isValid) || (endDateRef.value && !endDateRef.value.isValid))
        return true;
    else
        return false;
});

function resetDates() {
    startDate.value = "";
    endDate.value = "";
}
</script>

<template>
    <div class="font-Inter normal-case">
        <GlobalDateInput
            ref="startDateRef"
            v-model="startDate"
            :label="t('home_startDate')"
            :max="endDate || new Date().toISOString().split('T')[0]"
            size="small"
        />

        <GlobalDateInput
            ref="endDateRef"
            v-model="endDate"
            class="mt-3"
            :label="t('home_endDate')"
            :min="startDate || ''"
            :max="new Date().toISOString().split('T')[0]"
            size="small"
        />

        <GlobalButton
            v-if="!props.hideApplyButton"
            class="mt-4 w-full font-Inter text-xs"
            size="full"
            text-size="text-xs"
            :disabled="isInvalidDate"
            @click="emit('updateFilter', startDate, endDate)"
        >
            {{ t("history_saveFilter") }}
        </GlobalButton>

        <p
            class="mt-1 cursor-pointer text-center font-Inter text-xs font-semibold text-primary-600 normal-case underline underline-offset-2"
            @click="resetDates()"
        >
            {{ t("history_clear") }}
        </p>
    </div>
</template>

<style scoped>

</style>
