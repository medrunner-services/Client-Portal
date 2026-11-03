<script setup lang="ts">
import type { DiagnosticReference } from "@/utils/errorDiagnostics";
import { computed, nextTick, ref, useId, watch } from "vue";
import { useI18n } from "vue-i18n";
import { copyDiagnosticId } from "@/utils/errorDiagnostics";

const props = defineProps<{ diagnostic: DiagnosticReference }>();
const { t } = useI18n();
const tooltipId = useId();
const visible = ref(false);
const hovered = ref(false);
const focused = ref(false);
const feedback = ref("");
const manualCopy = ref(false);
const trigger = ref<HTMLElement>();
const tooltip = ref<HTMLElement>();
const position = ref({ left: "16px", top: "16px" });
const label = computed(() => t(props.diagnostic.kind === "request" ? "diagnostics_requestId" : "diagnostics_frontendId"));

watch(visible, async (open, _previous, cleanup) => {
    if (!open)
        return;
    const hide = () => {
        visible.value = false;
    };
    window.addEventListener("resize", hide);
    window.addEventListener("scroll", hide, true);
    cleanup(() => {
        window.removeEventListener("resize", hide);
        window.removeEventListener("scroll", hide, true);
    });
    await nextTick();
    if (!trigger.value || !tooltip.value || !visible.value)
        return;
    const rect = trigger.value.getBoundingClientRect();
    const width = tooltip.value.offsetWidth;
    const height = tooltip.value.offsetHeight;
    position.value = {
        left: `${Math.max(16, Math.min(rect.left, window.innerWidth - width - 16))}px`,
        top: `${rect.top > height + 8 ? rect.top - height - 8 : rect.bottom + 8}px`,
    };
});

watch(() => props.diagnostic.id, () => {
    feedback.value = "";
    manualCopy.value = false;
    visible.value = false;
});

async function copy() {
    visible.value = true;
    const copied = await copyDiagnosticId(props.diagnostic.id);
    feedback.value = t(copied ? "diagnostics_copied" : "diagnostics_copyFailed");
    manualCopy.value = !copied;
}
</script>

<template>
    <span class="relative ml-2 inline-flex items-center gap-1" @mouseenter="hovered = true; visible = true" @mouseleave="hovered = false; visible = focused" @keydown.esc="visible = false">
        <button
            ref="trigger"
            type="button"
            class="
                inline-flex size-7 items-center justify-center rounded-sm border border-current
                focus:outline-2 focus:outline-offset-2
            "
            :aria-label="`${t('diagnostics_copy')} - ${label}`"
            :aria-describedby="tooltipId"
            @focus="focused = true; visible = true"
            @blur="focused = false; visible = hovered"
            @click="copy"
        >
            <svg class="size-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </svg>
        </button>
        <Teleport to="body">
            <span v-show="visible" :id="tooltipId" ref="tooltip" role="tooltip" :style="position" class="fixed z-500 w-72 max-w-[calc(100vw-2rem)] rounded-sm border bg-gray-950 p-2 text-left text-xs font-normal break-all text-white shadow-sm">
                {{ label }}: {{ diagnostic.id }}
            </span>
        </Teleport>
        <span role="status" aria-live="polite" class="text-xs">{{ feedback }}</span>
        <input v-if="manualCopy" :value="diagnostic.id" :aria-label="label" readonly class="max-w-full rounded-sm border px-1 font-mono text-xs select-text" @focus="($event.target as HTMLInputElement).select()">
    </span>
</template>
