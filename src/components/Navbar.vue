<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";

import BugReportModal from "@/components/BugReportModal.vue";
import LanguageSelectorModal from "@/components/LanguageSelectorModal.vue";
import Modal from "@/components/Modal.vue";
import UserModal from "@/components/UserModal.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const logicStore = useLogicStore();
const route = useRoute();
const router = useRouter();
const { t, locale, availableLocales } = useI18n({ useScope: "global" });
const navMenuCollapsed = ref(false);
const currentPage = ref(route.path);
const scrollEnabled = ref(true);
const displayUserModal = ref(false);
const displayBugReportModal = ref(false);
const displayLanguageSelectorModal = ref(false);
const displayLanguageSelector = ref(false);

onMounted(() => {
    const userLanguage = localStorage.getItem("selectedLanguage");
    const availableMainLocales = availableLocales.map(locale => locale.split("-")[0]);

    if (userLanguage) {
        locale.value = userLanguage;
    } else if (availableLocales.includes(navigator.language)) {
        locale.value = navigator.language;
    } else if (availableMainLocales.includes(navigator.language.split("-")[0])) {
        const fallbackLocal = availableLocales.find(item => item.indexOf(navigator.language.split("-")[0]) === 0);
        if (fallbackLocal) {
            locale.value = fallbackLocal;
        } else {
            locale.value = "en-US";
        }
    } else {
        locale.value = "en-US";
    }
});

watch(route, async (oldRoute, newRoute) => {
    currentPage.value = newRoute.path;
});

function switchNavMenuSate(): void {
    navMenuCollapsed.value = !navMenuCollapsed.value;
    scrollEnabled.value ? disableScrolling() : enableScrolling();
}

function changeLanguage(newLanguage: string): void {
    locale.value = newLanguage;
    localStorage.setItem("selectedLanguage", newLanguage);
    displayLanguageSelectorModal.value = false;
}

async function disconnect(): Promise<void> {
    await userStore.disconnectUser();
    await router.push("/login");
}

function getLanguageString(languageLocal: string): string {
    switch (languageLocal) {
        case "en-US":
            return "English";
        case "fr-FR":
            return "Français";
        case "de-DE":
            return "Deutsch";
        case "it-IT":
            return "Italiano";
        case "da-DK":
            return "Dansk";
        default:
            return "English";
    }
}

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
</script>

<template>
    <div class="flex w-full flex-col bg-white shadow-md md:static">
        <div class="content-container z-10 flex items-center gap-2 bg-white py-2 md:py-3">
            <img class="h-8 md:h-12" :src="logicStore.medrunnerLogoUrl" alt="Medrunner Logo" />

            <nav class="ml-auto hidden items-center gap-8 font-Mohave text-header-2 font-semibold lg:flex">
                <RouterLink to="/" :class="currentPage === '/' ? 'current-link' : ''">{{ t("navbar_emergency") }}</RouterLink>
                <RouterLink to="/blocklist" :class="currentPage === '/blocklist' ? 'current-link' : ''">{{ t("navbar_blocklist") }} </RouterLink>
                <div
                    @click="displayBugReportModal = !displayBugReportModal"
                    class="ml-8 flex w-fit cursor-pointer items-center font-Mohave font-semibold text-primary-900"
                >
                    {{ t("navbar_reportBug") }}
                </div>
                <div class="relative">
                    <div
                        class="flex cursor-pointer select-none items-center border px-2 py-2 font-Inter text-body text-neutral-900 hover:border-neutral-600"
                        :class="displayLanguageSelector ? 'border-secondary-600' : 'border-gray-400'"
                        @click="displayLanguageSelector = !displayLanguageSelector"
                    >
                        <img :src="`/icons/flags/${locale.split('-')[1].toLowerCase()}.svg`" class="h-4 w-5" alt="flag" />
                        <p class="font text ml-2 mr-4 font-Mohave text-xl">{{ getLanguageString(locale) }}</p>
                        <img src="/icons/chevron-up-down.svg" class="h-6 w-6" alt="Arrow" />
                    </div>

                    <div class="absolute right-0 top-14 w-96 border border-gray-400 bg-gray-50 p-4 shadow-xl" v-if="displayLanguageSelector">
                        <div class="grid grid-cols-2 gap-4">
                            <div
                                v-for="language in availableLocales"
                                :key="language"
                                @click="
                                    changeLanguage(language);
                                    displayLanguageSelector = !displayLanguageSelector;
                                "
                                class="flex w-fit cursor-pointer items-center gap-2"
                            >
                                <img :src="`/icons/flags/${language.split('-')[1].toLowerCase()}.svg`" class="h-4 w-5" alt="flag" />
                                <p class="font-Mohave text-xl">{{ getLanguageString(language) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="userStore.isAuthenticated">
                    <div @click="displayUserModal = !displayUserModal" class="cursor-pointer">
                        <img src="/icons/user-profile.svg" alt="User profile" />
                    </div>
                </div>
            </nav>

            <button @click="switchNavMenuSate()" class="ml-auto lg:hidden">
                <img v-if="!navMenuCollapsed" src="/icons/burger-button.svg" alt="Open menu" />
                <img v-else src="/icons/close-button.svg" alt="Close menu" />
            </button>
        </div>

        <div @click.self="switchNavMenuSate()" v-if="navMenuCollapsed" class="absolute left-0 top-0 z-[5] h-screen w-screen bg-gray-400/50">
            <nav class="content-container absolute top-14 z-10 flex w-full flex-col justify-end bg-white py-4 text-header-2 font-semibold shadow-lg">
                <div class="flex flex-col gap-4 font-Mohave">
                    <RouterLink @click="switchNavMenuSate()" to="/" :class="currentPage === '/' ? 'current-link' : ''">{{
                        t("navbar_emergency")
                    }}</RouterLink>
                    <RouterLink @click="switchNavMenuSate()" to="/blocklist" :class="currentPage === '/blocklist' ? 'current-link' : ''">{{
                        t("navbar_blocklist")
                    }}</RouterLink>
                </div>
                <div
                    @click="displayBugReportModal = !displayBugReportModal"
                    class="mt-16 flex w-fit cursor-pointer items-center font-Mohave font-semibold text-primary-900"
                >
                    {{ t("navbar_reportBug") }}
                </div>
                <div class="mt-5 flex w-full items-center justify-between">
                    <div
                        class="flex cursor-pointer items-center border border-gray-400 px-2 py-2 font-Inter text-body text-neutral-900 hover:border-neutral-600"
                        @click="displayLanguageSelectorModal = !displayLanguageSelectorModal"
                    >
                        <img :src="`/icons/flags/${locale.split('-')[1].toLowerCase()}.svg`" class="h-4 w-5" alt="flag" />
                        <p class="font text ml-2 mr-4 font-Mohave text-xl">{{ getLanguageString(locale) }}</p>
                        <img src="/icons/chevron-up-down.svg" class="h-6 w-6" alt="Arrow" />
                    </div>
                    <div @click="displayUserModal = !displayUserModal" class="cursor-pointer">
                        <img src="/icons/user-profile.svg" alt="User profile" />
                    </div>
                </div>
            </nav>
        </div>
    </div>

    <Modal @close-modal="displayUserModal = !displayUserModal" @click.self="displayUserModal = !displayUserModal" v-if="displayUserModal">
        <UserModal @disconnect-user="disconnect()" />
    </Modal>

    <Modal
        @close-modal="displayBugReportModal = !displayBugReportModal"
        @click.self="displayBugReportModal = !displayBugReportModal"
        v-if="displayBugReportModal"
    >
        <BugReportModal />
    </Modal>

    <Modal
        @close-modal="displayLanguageSelectorModal = !displayLanguageSelectorModal"
        @click.self="displayLanguageSelectorModal = !displayLanguageSelectorModal"
        v-if="displayLanguageSelectorModal"
    >
        <LanguageSelectorModal :available-locales="availableLocales" @change-language="language => changeLanguage(language)" />
    </Modal>
</template>

<style scoped>
.current-link {
    @apply underline decoration-[3px] underline-offset-8;
}
</style>
