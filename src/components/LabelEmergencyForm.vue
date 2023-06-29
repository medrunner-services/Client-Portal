<script setup lang="ts">
import { onBeforeUnmount, onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
    titleLocal: string;
    descriptionLocal: string;
}>();

const displayTooltip = ref(false);
const tooltipDiv: Ref<HTMLDivElement | null> = ref(null);
const tooltipImg: Ref<HTMLImageElement | null> = ref(null);

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
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
    <div class="flex w-full items-center">
        <label class="text-sm font-semibold">{{ t(titleLocal) }}</label>
        <div class="relative">
            <img
                ref="tooltipImg"
                src="/icons/info-icon.svg"
                alt="Info label"
                class="ml-2 h-4 w-4 cursor-pointer"
                @click="displayTooltip = !displayTooltip"
            />

            <div ref="tooltipDiv" v-if="displayTooltip" class="absolute bottom-5 left-0 z-10 w-56 border bg-gray-50 px-2 py-3 shadow-xl">
                <p class="text-sm">{{ t(descriptionLocal) }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
