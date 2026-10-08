<script setup lang="ts">
import { ref, watch } from "vue";

export interface Props {
    width?: string;
    disableHover?: boolean;
    hideTrigger?: boolean;
    content?: string;
}

const props = withDefaults(defineProps<Props>(), {
    width: "w-64",
    disableHover: false,
    hideTrigger: false,
});

const showTooltip = ref(false);
const triggerRef = ref<HTMLElement>();
const tooltipPosition = ref({ bottom: 0, left: 0 });

function updateTooltipPosition() {
    if (!triggerRef.value) {
        return;
    }

    const rect = triggerRef.value.getBoundingClientRect();

    tooltipPosition.value = {
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
    };
}

watch(showTooltip, () => {
    if (showTooltip.value) {
        updateTooltipPosition();
    }
});
</script>

<template>
    <div
        ref="triggerRef"
        class="relative"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
    >
        <slot v-if="!hideTrigger" name="trigger">
            <svg
                class="
                    ml-2 size-4 cursor-pointer text-gray-400
                    hover:text-gray-500
                "
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd"
                />
            </svg>
        </slot>

        <teleport to="body">
            <div
                v-if="!disableHover && showTooltip && triggerRef"
                role="tooltip"
                :style="{
                    bottom: `${tooltipPosition.bottom}px`,
                    left: `${tooltipPosition.left}px`,
                }"
                class="
                    fixed z-500 inline-block rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500 shadow-xs
                    dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400
                " :class="[
                    props.width,
                ]"
            >
                <div class="px-3 py-2">
                    <slot name="content">
                        <p>{{ props.content }}</p>
                    </slot>
                </div>
            </div>
        </teleport>
    </div>
</template>

<style scoped></style>
