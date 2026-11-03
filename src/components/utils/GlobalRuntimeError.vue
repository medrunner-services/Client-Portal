<script setup lang="ts">
import { useI18n } from "vue-i18n";
import GlobalErrorText from "@/components/utils/GlobalErrorText.vue";
import { runtimeFailure } from "@/utils/errorDiagnostics";

const { t } = useI18n();
</script>

<template>
    <div v-if="runtimeFailure" role="alert" class="fixed inset-x-4 top-4 z-500 flex items-center justify-between rounded-sm border border-red-300 bg-red-50 p-4 shadow-lg">
        <GlobalErrorText :text="runtimeFailure" />
        <button type="button" class="ml-3 rounded-sm p-2" :aria-label="t('diagnostics_dismiss')" @click="runtimeFailure = undefined">
            &#215;
        </button>
    </div>
</template>
