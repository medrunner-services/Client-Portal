<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";

const { t } = useI18n();

const showBanner = ref(true);

onMounted(() => {
    if (Date.now() > 1731301199000) showBanner.value = false;
});
</script>

<template>
    <div
        v-if="showBanner"
        id="banner"
        class="fixed bottom-0 z-50 flex w-full flex-col items-start justify-between border border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center md:gap-8 lg:py-4"
    >
        <div class="sm:flex xl:items-center">
            <svg
                class="mb-3 mr-3 hidden h-5 w-5 shrink-0 text-primary-600 sm:mb-0 lg:flex"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                ></path>
            </svg>
            <p class="mb-4 text-gray-500 dark:text-gray-400 md:mb-0">
                Due to the soft reset caused by the latest patch,
                <span class="font-medium text-gray-900 dark:text-white">response times may be longer than usual. </span>We apologize for the
                inconvenience.
            </p>
        </div>
        <div class="items-cente flex shrink-0 items-center space-x-4 lg:pl-10">
            <GlobalButton @click="showBanner = false">{{ t("tracking_finishButton") }}</GlobalButton>
        </div>
    </div>
</template>

<style scoped></style>
