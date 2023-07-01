<script setup lang="ts">
import { onMounted, type Ref, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

import LanguageSelector from "@/components/LanguageSelector.vue";
import Modal from "@/components/Modal.vue";
import BugReportModal from "@/components/Modals/BugReportModal.vue";
import LanguageSelectorModal from "@/components/Modals/LanguageSelectorModal.vue";
import UserModal from "@/components/Modals/UserModal.vue";
import { useLogicStore } from "@/stores/logicStore";
import { useUserStore } from "@/stores/userStore";

const userStore = useUserStore();
const logicStore = useLogicStore();
const router = useRouter();
const { t, locale, availableLocales } = useI18n({ useScope: "global" });
const navMenuCollapsed = ref(false);
const scrollEnabled = ref(true);
const displayUserModal = ref(false);
const displayBugReportModal = ref(false);
const displayLanguageSelectorModal = ref(false);
const displayLanguageSelector = ref(false);
const selectorParent: Ref<HTMLDivElement | null> = ref(null);

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

function switchNavMenuSate(): void {
    navMenuCollapsed.value = !navMenuCollapsed.value;
    scrollEnabled.value ? disableScrolling() : enableScrolling();
}

function changeLanguage(newLanguage: string): void {
    locale.value = newLanguage;
    localStorage.setItem("selectedLanguage", newLanguage);
    displayLanguageSelectorModal.value = false;
    displayLanguageSelector.value = false;
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

async function gotoDevView(): Promise<void> {
    displayUserModal.value = false;
    navMenuCollapsed.value = false;
    enableScrolling();
    await router.push("/developer");
}
</script>

<template>
    <div class="flex w-full flex-col bg-white shadow-md md:static">
        <div class="content-container z-10 flex items-center gap-2 bg-white py-2 md:py-3">
            <img class="h-8 md:h-12" :src="logicStore.medrunnerLogoUrl" alt="Medrunner Logo" />

            <nav class="ml-auto hidden items-center gap-8 font-Mohave text-header-2 font-semibold lg:flex">
                <RouterLink to="/">{{ t("navbar_emergency") }}</RouterLink>
                <RouterLink to="/blocklist">{{ t("navbar_blocklist") }} </RouterLink>
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
                        ref="selectorParent"
                    >
                        <img :src="`/icons/flags/${locale.split('-')[1].toLowerCase()}.svg`" class="h-4 w-5" alt="flag" />
                        <p class="font text ml-2 mr-4 font-Mohave text-xl">{{ logicStore.getLanguageString(locale) }}</p>
                        <img src="/icons/chevron-up-down.svg" class="h-6 w-6" alt="Arrow" />
                    </div>

                    <LanguageSelector
                        :available-locales="availableLocales"
                        :selector-parent="selectorParent"
                        @change-language="language => changeLanguage(language)"
                        @closeSelector="displayLanguageSelector = false"
                        v-if="displayLanguageSelector"
                        class="absolute right-0 top-14 w-96 border border-gray-400 bg-gray-50 p-4 shadow-xl"
                    />
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
                    <RouterLink @click="switchNavMenuSate()" to="/">{{ t("navbar_emergency") }}</RouterLink>
                    <RouterLink @click="switchNavMenuSate()" to="/blocklist">{{ t("navbar_blocklist") }}</RouterLink>
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
                        <p class="font text ml-2 mr-4 font-Mohave text-xl">{{ logicStore.getLanguageString(locale) }}</p>
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
        <UserModal @disconnectUser="disconnect()" @gotoDevView="gotoDevView" />
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
.router-link-active {
    @apply underline decoration-[3px] underline-offset-8;
}
</style>
