<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import GlobalButton from "@/components/utils/GlobalButton.vue";
import GlobalDateInput from "@/components/utils/GlobalDateInput.vue";

const props = defineProps<{
    currentStart?: string;
    currentEnd?: string;
}>();

const emit = defineEmits<{
    updateFilter: [start: string, end: string];
}>();

const { t } = useI18n();

const startDate = ref<string>(props.currentStart ?? "");
const endDate = ref<string>(props.currentEnd ?? "");
</script>

<template>
    <div class="font-Inter normal-case">
        <!-- TODO: localization -->
        <GlobalDateInput
            v-model="startDate"
            label="Start date"
            :max="endDate || new Date().toISOString().split('T')[0]"
            size="small"
        />

        <GlobalDateInput
            v-model="endDate"
            class="mt-3"
            label="End date"
            :min="startDate || ''"
            :max="new Date().toISOString().split('T')[0]"
            size="small"
        />

        <GlobalButton class="mt-4 w-full font-Inter text-xs" size="full" text-size="text-xs" @click="emit('updateFilter', startDate, endDate)">
            {{ t("history_saveFilter") }}
        </GlobalButton>

        <p
            class="mt-1 cursor-pointer text-center font-Inter text-xs font-semibold text-primary-600 normal-case underline underline-offset-2"
            @click="emit('updateFilter', '', '')"
        >
            {{ t("history_reset") }}
        </p>
    </div>
</template>

<style scoped>

</style>
