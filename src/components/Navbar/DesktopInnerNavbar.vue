<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import BugReportModal from "@/components/Modals/BugReportModal.vue";
import LanguageDropdown from "@/components/Navbar/LanguageDropdown.vue";
import { useLogicStore } from "@/stores/logicStore";
const logicStore = useLogicStore();
const { t } = useI18n();

const showBugReportModal = ref(false);
</script>

<template>
    <div class="content-container flex flex-wrap items-center justify-between py-4">
        <RouterLink to="/" class="flex items-center">
            <img :src="logicStore.medrunnerLogoUrl" class="h-10" alt="Medrunner Logo" />
        </RouterLink>

        <ul class="flex">
            <li>
                <RouterLink to="/">{{ t("navbar_home") }}</RouterLink>
            </li>
            <li class="ml-5">
                <RouterLink to="/emergency">{{ t("navbar_emergency") }}</RouterLink>
            </li>
        </ul>

        <div class="flex items-center">
            <p class="cursor-pointer text-primary-600 dark:text-red-700" @click="showBugReportModal = true">{{ t("navbar_reportBug") }}</p>
            <div class="mx-5 h-4 border border-gray-300" />
            <LanguageDropdown />
            <div class="mx-5 h-4 border border-gray-300" />
            <RouterLink to="/profile">
                <svg
                    class="h-5 w-5 text-gray-800 dark:text-gray-50"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 14 18"
                >
                    <path
                        d="M7 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm2 1H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z"
                    />
                </svg>
            </RouterLink>
        </div>

        <BugReportModal v-if="showBugReportModal" @close="showBugReportModal = false" />
    </div>
</template>

<style scoped></style>
