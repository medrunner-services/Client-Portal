<script setup lang="ts">
import type { ErrorPresentation } from "@/utils/errorDiagnostics";
import DiagnosticReferenceButton from "@/components/utils/DiagnosticReferenceButton.vue";

export interface Props {
    text: ErrorPresentation;
    icon?: boolean;
    weight?: string;
}

const props = withDefaults(defineProps<Props>(), {
    icon: true,
    weight: "font-semibold",
});
</script>

<template>
    <div
        class="
            flex items-center text-red-600
            dark:text-red-500
        " :class="props.weight"
    >
        <svg v-if="icon" class="mr-4 size-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
            />
        </svg>
        <p>{{ typeof props.text === 'string' ? props.text : props.text.message }}</p>
        <DiagnosticReferenceButton v-if="typeof props.text !== 'string' && props.text.diagnostic" :diagnostic="props.text.diagnostic" />
    </div>
</template>

<style scoped></style>
