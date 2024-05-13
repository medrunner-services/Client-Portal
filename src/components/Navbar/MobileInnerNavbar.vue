<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouterLink } from "vue-router";

import BugReportModal from "@/components/Modals/BugReportModal.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";
const logicStore = useLogicStore();
const userStore = useUserStore();
const { t, locale, availableLocales } = useI18n();

const showMenu = ref(false);
const showLanguageMenu = ref(false);
const scrollEnabled = ref(true);
const showBugReportModal = ref(false);

function disableScrolling(): void {
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    scrollEnabled.value = false;
}

function enableScrolling(): void {
    document.body.style.height = "auto";
    document.body.style.overflow = "auto";

    scrollEnabled.value = true;
}

function switchNavMenuSate(): void {
    showMenu.value = !showMenu.value;
    showLanguageMenu.value = false;
    scrollEnabled.value ? disableScrolling() : enableScrolling();
}

async function changeLanguage(newLocal: string): Promise<void> {
    locale.value = newLocal;
    showLanguageMenu.value = false;

    try {
        await userStore.setSettings({ selectedLanguage: newLocal });
    } catch (e) {
        return;
    }
}
</script>

<template>
    <div>
        <div class="content-container relative z-10 flex w-full flex-wrap items-center justify-between bg-white py-4 dark:bg-gray-800">
            <RouterLink to="/" class="flex items-center">
                <img :src="logicStore.medrunnerLogoUrl" class="h-10" alt="Medrunner Logo" />
            </RouterLink>

            <div @click="switchNavMenuSate()">
                <svg
                    v-if="!showMenu"
                    class="h-5 w-5 cursor-pointer text-gray-900 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 17 14"
                >
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                </svg>

                <svg
                    v-else
                    class="h-4 w-4 cursor-pointer text-gray-900 dark:text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                >
                    <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                </svg>
            </div>
        </div>

        <div
            @click.self="switchNavMenuSate()"
            v-if="showMenu"
            class="absolute left-0 top-0 z-[5] h-screen w-screen bg-gray-600/75 pt-4 dark:bg-gray-700/75"
        >
            <div class="absolute top-[72px] z-10 w-full bg-white dark:bg-gray-800">
                <div v-if="!showLanguageMenu">
                    <div class="border border-gray-100 dark:border-gray-700"></div>
                    <ul class="p-4">
                        <li>
                            <RouterLink @click="switchNavMenuSate()" to="/" class="block w-full">{{ t("navbar_home") }}</RouterLink>
                        </li>
                        <li class="mt-4">
                            <RouterLink @click="switchNavMenuSate()" to="/emergency" class="block w-full">{{ t("navbar_emergency") }}</RouterLink>
                        </li>
                    </ul>
                    <div class="border border-gray-100 dark:border-gray-700"></div>
                    <p class="cursor-pointer p-4 text-primary-600 dark:text-red-700" @click="showBugReportModal = true">
                        {{ t("navbar_reportBug") }}
                    </p>
                    <div class="border border-gray-100 dark:border-gray-700"></div>
                    <div @click="showLanguageMenu = !showLanguageMenu" class="flex cursor-pointer items-center justify-between rounded p-4">
                        <div class="flex">
                            <img :src="`/icons/flags/${locale}.svg`" alt="Flag" class="mr-4 h-6 w-6" />
                            {{ logicStore.getLanguageString(locale) }}
                        </div>

                        <svg
                            class="h-3 w-3 -rotate-90"
                            :class="showLanguageMenu ? 'rotate-180' : ''"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4" />
                        </svg>
                    </div>
                    <div class="border border-gray-100 dark:border-gray-700"></div>
                    <RouterLink @click="switchNavMenuSate()" to="/profile" class="flex cursor-pointer items-center p-4">
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
                        <p class="ml-4">{{ t("navbar_profile") }}</p>
                    </RouterLink>
                </div>

                <div v-else>
                    <div class="border border-gray-100 dark:border-gray-700"></div>
                    <ul class="p-4 text-gray-700 dark:text-gray-400">
                        <li
                            v-for="language in availableLocales"
                            :key="language"
                            @click="changeLanguage(language)"
                            class="flex cursor-pointer items-center rounded-lg px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                            <img :src="`/icons/flags/${language}.svg`" alt="Flag" class="mr-6 h-6 w-6" />
                            <p>{{ logicStore.getLanguageString(language) }}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <BugReportModal v-if="showBugReportModal" @close="showBugReportModal = false" />
    </div>
</template>

<style scoped></style>
