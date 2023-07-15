<script setup lang="ts">
import { type Ref, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import { useLogicStore } from "@/stores/logicStore";

const { t } = useI18n();
const logicStore = useLogicStore();

const props = defineProps({
    titleLocal: {
        type: String,
        required: true,
    },
    descriptionLocal: {
        type: String,
        required: true,
    },
    alignment: {
        validator(value: string) {
            return ["left", "right"].includes(value);
        },
        default() {
            return "right";
        },
    },
    required: {
        type: Boolean,
        default() {
            return false;
        },
    },
});

const displayTooltip = ref(false);
const tooltipDiv: Ref<HTMLDivElement | null> = ref(null);
const tooltipImg: Ref<HTMLImageElement | null> = ref(null);
const labelContainer: Ref<HTMLDivElement | null> = ref(null);

watch(displayTooltip, async newValue => {
    if (newValue) {
        document.addEventListener("click", handleClickOutside);
    } else {
        document.removeEventListener("click", handleClickOutside);
    }
});

const handleClickOutside = (event: MouseEvent) => {
    if (
        tooltipDiv.value &&
        tooltipImg.value &&
        !event.composedPath().includes(tooltipDiv.value) &&
        !event.composedPath().includes(tooltipImg.value)
    ) {
        displayTooltip.value = false;
    }
};
</script>

<template>
    <div ref="labelContainer" class="flex w-full items-center">
        <label class="text-sm font-semibold">{{ t(titleLocal) }} <span v-if="props.required">*</span></label>
        <div class="relative" v-auto-animate="{ duration: 100 }">
            <img
                ref="tooltipImg"
                :src="logicStore.darkMode ? '/icons/info-icon-dark.svg' : '/icons/info-icon.svg'"
                alt="Info label"
                class="ml-2 h-4 w-4 cursor-pointer"
                @click="displayTooltip = !displayTooltip"
            />

            <div
                ref="tooltipDiv"
                id="test"
                v-if="displayTooltip"
                class="absolute bottom-5 z-10 w-56 border bg-gray-50 px-2 py-3 shadow-xl dark:border-stone-500 dark:bg-stone-700 dark:shadow-lg dark:shadow-stone-800"
                :class="alignment === 'left' ? '-right-10' : '-left-10'"
            >
                <p class="text-sm">{{ t(descriptionLocal) }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
