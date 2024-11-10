<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

import GlobalButton from "@/components/utils/GlobalButton.vue";

const { t } = useI18n();

const showBanner = ref(true);
</script>

<template>
    <div v-if="showBanner" id="banner" class="w-full border border-b border-gray-200 bg-yellow-100 px-4 py-3 text-yellow-800 dark:border-0 lg:py-2.5">
        <div class="content-container flex w-full flex-col items-start justify-between md:flex-row md:items-center md:gap-8">
            <div class="sm:flex lg:items-center">
                <svg class="mr-3 hidden h-5 w-5 shrink-0 sm:mb-0 lg:flex" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                <p class="mb-4 md:mb-0">
                    Due to the soft reset caused by the latest patch,
                    <span class="font-medium text-yellow-950">response times may be longer than usual. </span>We apologize for the inconvenience.
                </p>
            </div>
            <div class="flex w-full shrink-0 items-center space-x-4 md:w-fit lg:pl-10">
                <GlobalButton
                    type="outline"
                    size="full"
                    class="w-full md:w-fit"
                    outline-text-color="text-yellow-800"
                    outline-border-color="border-yellow-800"
                    outline-hover-color="hover:bg-gray-200/10"
                    @click="showBanner = false"
                    >{{ t("tracking_finishButton") }}</GlobalButton
                >
            </div>
        </div>
    </div>
</template>

<style scoped></style>
